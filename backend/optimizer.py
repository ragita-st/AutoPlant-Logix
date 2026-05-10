import numpy as np
from numba import njit, prange

@njit
def compute_cost(perm, flow, dist):
    cost = 0.0
    for i in range(12):
        for j in range(12):
            if flow[i, j] > 0:
                cost += flow[i, j] * dist[perm[i], perm[j]]
    return cost

@njit
def simulated_annealing_core(flow, dist, seed, strict_mode):
    np.random.seed(seed)
    current_perm = np.arange(12, dtype=np.int32)
    
    # Kumpulan Indeks Fasilitas
    fac_100 = np.array([0, 1, 2, 3], dtype=np.int32)
    fac_200 = np.array([4, 5, 6, 7, 8, 9], dtype=np.int32)
    fac_300 = np.array([10, 11], dtype=np.int32)
    
    if strict_mode:
        # STRICT MODE: Berikan lokasi acak namun sesuai aturan ukuran
        loc_100 = np.array([2, 4, 7, 10], dtype=np.int32)
        loc_200 = np.array([0, 3, 5, 6, 8, 9], dtype=np.int32)
        loc_300 = np.array([1, 11], dtype=np.int32)
        
        np.random.shuffle(loc_100)
        np.random.shuffle(loc_200)
        np.random.shuffle(loc_300)
        
        # Format Murni: current_perm[Fasilitas] = Lokasi
        for i in range(4): current_perm[fac_100[i]] = loc_100[i]
        for i in range(6): current_perm[fac_200[i]] = loc_200[i]
        for i in range(2): current_perm[fac_300[i]] = loc_300[i]
    else:
        # FREE MODE: Acak bebas tanpa batasan ukuran
        np.random.shuffle(current_perm)

    current_cost = compute_cost(current_perm, flow, dist)
    best_perm = current_perm.copy()
    best_cost = current_cost

    temp = 10000.0
    cooling_rate = 0.995
    min_temp = 1.0

    while temp > min_temp:
        for _ in range(100):
            next_perm = current_perm.copy()
            
            if strict_mode:
                # Pilih dua FASILITAS yang berukuran sama, lalu tukar LOKASI mereka
                group_choice = np.random.randint(0, 3)
                if group_choice == 0:
                    fac1, fac2 = np.random.choice(fac_100, 2, replace=False)
                elif group_choice == 1:
                    fac1, fac2 = np.random.choice(fac_200, 2, replace=False)
                else:
                    fac1, fac2 = 10, 11
                
                next_perm[fac1], next_perm[fac2] = next_perm[fac2], next_perm[fac1]
            else:
                # Pilih dua FASILITAS bebas, lalu tukar LOKASI mereka
                fac1, fac2 = np.random.randint(0, 12, 2)
                next_perm[fac1], next_perm[fac2] = next_perm[fac2], next_perm[fac1]

            next_cost = compute_cost(next_perm, flow, dist)
            delta = next_cost - current_cost

            if delta < 0 or np.random.random() < np.exp(-delta / temp):
                current_perm = next_perm.copy()
                current_cost = next_cost
                if current_cost < best_cost:
                    best_perm = current_perm.copy()
                    best_cost = current_cost
                    
        temp *= cooling_rate

    # TIDAK ADA LAGI REVERSE MAPPING! Langsung return array lurus.
    return best_perm, best_cost

@njit(parallel=True)
def run_auto_optimizer(flow, dist, strict_mode=False, num_restarts=50):
    best_costs = np.full(num_restarts, np.inf)
    best_perms = np.zeros((num_restarts, 12), dtype=np.int32)
    for i in prange(num_restarts):
        perm, cost = simulated_annealing_core(flow, dist, seed=i+100, strict_mode=strict_mode)
        best_costs[i] = cost
        best_perms[i] = perm
    best_idx = np.argmin(best_costs)
    return best_perms[best_idx], best_costs[best_idx]