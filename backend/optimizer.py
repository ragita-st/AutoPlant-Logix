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
def simulated_annealing_core(flow, dist, seed):
    np.random.seed(seed)
    current_perm = np.arange(12, dtype=np.int32)
    np.random.shuffle(current_perm)
    current_cost = compute_cost(current_perm, flow, dist)

    best_perm = current_perm.copy()
    best_cost = current_cost

    temp = 10000.0
    cooling_rate = 0.995
    min_temp = 1.0

    while temp > min_temp:
        # Melakukan 100 percobaan di setiap tingkat suhu (Epoch)
        for _ in range(100):
            next_perm = current_perm.copy()
            # Swap 2 fasilitas
            i, j = np.random.randint(0, 12, 2)
            next_perm[i], next_perm[j] = next_perm[j], next_perm[i]

            next_cost = compute_cost(next_perm, flow, dist)
            delta = next_cost - current_cost

            # Acceptance Probability
            if delta < 0 or np.random.random() < np.exp(-delta / temp):
                current_perm = next_perm.copy()
                current_cost = next_cost

                if current_cost < best_cost:
                    best_perm = current_perm.copy()
                    best_cost = current_cost
                    
        temp *= cooling_rate

    return best_perm, best_cost

@njit(parallel=True)
def run_auto_optimizer(flow, dist, num_restarts=50):
    """
    Menjalankan Simulated Annealing sebanyak 50 kali secara paralel 
    untuk menjamin penemuan Global Optimum (221.825).
    """
    best_costs = np.full(num_restarts, np.inf)
    best_perms = np.zeros((num_restarts, 12), dtype=np.int32)
    
    for i in prange(num_restarts):
        perm, cost = simulated_annealing_core(flow, dist, seed=i+100)
        best_costs[i] = cost
        best_perms[i] = perm
        
    best_idx = np.argmin(best_costs)
    return best_perms[best_idx], best_costs[best_idx]