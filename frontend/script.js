const DIST = [[0, 45, 65, 40, 55, 50, 60, 75, 70, 80, 65, 35],[45, 0, 60, 35, 50, 45, 55, 70, 65, 70, 60, 10],[65, 60, 0, 55, 10, 45, 35, 50, 45, 55, 40, 50],[40, 35, 55, 0, 45, 40, 50, 65, 60, 70, 55, 25],[55, 50, 10, 45, 0, 35, 25, 40, 35, 45, 30, 40],[50, 45, 45, 40, 35, 0, 40, 55, 50, 60, 45, 35],[60, 55, 35, 50, 25, 40, 0, 45, 40, 50, 35, 45],[75, 70, 50, 65, 40, 55, 45, 0, 35, 45, 10, 60],[70, 65, 45, 60, 35, 50, 40, 35, 0, 40, 25, 55],[80, 70, 55, 70, 45, 60, 50, 45, 40, 0, 35, 75],[65, 60, 40, 55, 30, 45, 35, 10, 25, 35, 0, 50],[35, 10, 50, 25, 40, 35, 45, 60, 55, 75, 50, 0]];
const FLOW = [[0,345,145,130,45,55,0,285,140,0,0,0],[0,0,100,0,65,180,0,0,0,0,0,0],[0,0,0,75,120,135,0,0,0,0,0,0],[0,0,0,0,185,20,150,90,0,105,100,0],[0,0,0,380,0,140,0,0,75,35,0,0],[0,0,0,65,205,0,325,95,0,20,50,25],[0,0,0,0,0,0,0,180,125,30,150,120],[0,0,40,0,55,210,0,0,0,80,90,160],[0,0,0,0,0,45,0,0,0,95,75,125],[0,0,0,0,0,0,0,0,0,0,40,175],[0,0,0,0,150,0,0,0,0,35,0,390],[0,0,0,0,0,0,0,0,0,0,0,0]];
const PART_ROUTES = { 'alpha': [0,1,5,6,7,9,11], 'beta': [0,1,5,4,3,10,11], 'gamma': [0,2,3,4,5,11], 'delta': [0,1,2,5,6,8,11], 'epsilon':[0,2,4,3,7,10,11], 'zeta': [0,2,4,3,6,9,11], 'eta': [0,4,2,5,6,7,11], 'theta': [0,7,5,4,3,9,11], 'iota': [0,3,4,8,10,11], 'kappa': [0,7,2,5,6,8,11], 'lambda': [0,3,6,7,11], 'mu': [0,8,5,10,11], 'nu': [0,1,2,4,9,11], 'xi': [0,7,4,3,10,11], 'omicron': [0,3,6,10,11], 'pi': [0,2,5,7,11], 'rho': [0,1,5,10,11], 'sigma': [0,8,9,11], 'tau': [0,2,4,8,11], 'upsilon': [0,4,3,6,11] };
const PART_NAMES = { 'alpha': 'Part α', 'beta': 'Part β', 'gamma': 'Part γ', 'delta': 'Part δ', 'epsilon': 'Part ε', 'zeta': 'Part ζ', 'eta': 'Part η', 'theta': 'Part θ', 'iota': 'Part ι', 'kappa': 'Part κ', 'lambda': 'Part λ', 'mu': 'Part μ', 'nu': 'Part ν', 'xi': 'Part ξ', 'omicron': 'Part ο', 'pi': 'Part π', 'rho': 'Part ρ', 'sigma': 'Part σ', 'tau': 'Part τ', 'upsilon': 'Part υ' };
const PART_COLORS = { 'alpha': '#ef4444', 'beta': '#f97316', 'gamma': '#f59e0b', 'delta': '#eab308', 'epsilon': '#84cc16', 'zeta': '#22c55e', 'eta': '#10b981', 'theta': '#14b8a6', 'iota': '#06b6d4', 'kappa': '#0ea5e9', 'lambda': '#3b82f6', 'mu': '#6366f1', 'nu': '#8b5cf6', 'xi': '#a855f7', 'omicron': '#d946ef', 'pi': '#ec4899', 'rho': '#f43f5e', 'sigma': '#be123c', 'tau': '#9f1239', 'upsilon': '#4338ca' };

let chartInstance = null; 
let lastDrawnParts = [];
let IS_STRICT_MODE = window.STRICT_MODE || false;
let draggedElement = null;
let isCurrentlyAnimated = true;

// KAMUS IKON
const FAC_ICONS = { 100: '⚙️', 200: '📦', 300: '🏭' };

// Mengubah warna teks default Chart.js agar terlihat di Dark Mode
Chart.defaults.color = '#94a3b8';

// ==========================================
// 1. INIT & UI UPDATES
// ==========================================
function initApp() {
    let select = document.getElementById('part-select');
    select.innerHTML = '<option value="">-- Pilih Suku Cadang --</option>';
    for(let key in PART_NAMES) {
        let opt = document.createElement('option');
        opt.value = key; opt.innerHTML = PART_NAMES[key];
        select.appendChild(opt);
    }
    applyStrictModeUI();

    if (window.INJECTED_LAYOUT) {
        autoPlace(window.INJECTED_LAYOUT);
    }
}

function applyStrictModeUI() {
    if(IS_STRICT_MODE) {
        document.body.classList.add('strict-mode-active');
        for(let i=0; i<12; i++) {
            let fac = document.getElementById('f'+i);
            if(fac) { 
                let size = fac.getAttribute('data-size'); 
                fac.innerText = `${FAC_ICONS[size]} F${i+1} (${size})`; 
            }
        }
    } else {
        document.body.classList.remove('strict-mode-active');
        for(let i=0; i<12; i++) {
            let fac = document.getElementById('f'+i);
            if(fac) {
                let size = fac.getAttribute('data-size'); 
                fac.innerText = `${FAC_ICONS[size]} F${i+1}`;
            }
        }
    }
}

function updateStatus() {
    let count = 0;
    for(let i=0; i<12; i++) {
        let slot = document.getElementById('loc-' + i);
        if(slot && slot.children.length > 1) count++;
    }
    let badge = document.getElementById('app-status');
    if (count === 12) { badge.innerHTML = "🟢 Layout Lengkap & Siap"; badge.style.color = "#10b981"; badge.style.background = "rgba(16, 185, 129, 0.2)"; }
    else { badge.innerHTML = `🟡 Menunggu Input (${count}/12)`; badge.style.color = "#fbbf24"; badge.style.background = "rgba(251, 191, 36, 0.2)"; }
}

// ==========================================
// 2. DRAG AND DROP
// ==========================================
function allowDrop(ev) { ev.preventDefault(); }
function enter(ev) { ev.preventDefault(); if(ev.currentTarget.id !== "pool") ev.currentTarget.classList.add('dragover'); }
function leave(ev) { ev.currentTarget.classList.remove('dragover'); ev.currentTarget.classList.remove('error-drop'); }

function drag(ev) {
    draggedElement = ev.target;
    ev.dataTransfer.setData("text", ev.target.id);
    clearRoute();
    document.getElementById('route-preview').innerHTML = '<div class="route-placeholder">Preview dihapus...</div>';
    setTimeout(() => { draggedElement.style.pointerEvents = 'none'; }, 0);
}

function dragEnd(ev) {
    if(draggedElement) draggedElement.style.pointerEvents = 'auto';
    ev.target.style.pointerEvents = 'auto';
    draggedElement = null;
}

function drop(ev) {
    ev.preventDefault();
    let target = ev.currentTarget;
    target.classList.remove('dragover');
    target.classList.remove('error-drop');

    let elId = ev.dataTransfer.getData("text");
    let el = document.getElementById(elId);
    if (!el) return;

    if(IS_STRICT_MODE && target.id !== "pool") {
        let facSize = parseInt(el.getAttribute('data-size'));
        let slotSize = parseInt(target.getAttribute('data-size'));
        if(facSize !== slotSize) {
            target.classList.add('error-drop');
            alert(`⛔ MODE STRICT AKTIF!\nMesin berukuran ${facSize} ft² tidak bisa masuk ke ruangan ${slotSize} ft².`);
            setTimeout(() => target.classList.remove('error-drop'), 500);
            if(draggedElement) draggedElement.style.pointerEvents = 'auto';
            return;
        }
    }

    let sourceParent = el.parentNode;
    if (target.id !== "pool") {
        let existingFacility = target.querySelector('.facility');
        if (existingFacility) sourceParent.appendChild(existingFacility);
    }
    target.appendChild(el);
    el.style.pointerEvents = 'auto';
    updateStatus();
}

// ==========================================
// 3. AUTO PLACE & CALCULATION
// ==========================================
function autoPlace(permArray) {
    for(let facIdx = 0; facIdx < 12; facIdx++) {
        let locIdx = permArray[facIdx];
        let facEl = document.getElementById('f' + facIdx);
        let locEl = document.getElementById('loc-' + locIdx);
        if(facEl && locEl) locEl.appendChild(facEl);
    }
    updateStatus();
    setTimeout(() => { calculate(); }, 500);
}

function calculate() {
    let mapping = {}; 
    let currentPerm = new Array(12); // Menampung array letak
    let isComplete = true;

    for(let i=0; i<12; i++) {
        let slot = document.getElementById('loc-' + i);
        let fac = slot.querySelector('.facility');
        if(!fac) { isComplete = false; break; }
        
        let facVal = parseInt(fac.getAttribute('data-val'));
        mapping[facVal] = i;
        currentPerm[i] = facVal; // Menyimpan ID Mesin di index lokasi
    }
    
    if(!isComplete) { alert("Selesaikan penempatan 12 mesin terlebih dahulu!"); return; }

    // 1. Kalkulasi TMHC Utama
    let total = 0;
    for(let i=0; i<12; i++) {
        for(let j=0; j<12; j++) {
            if(FLOW[i][j] > 0) total += FLOW[i][j] * DIST[mapping[i]][mapping[j]];
        }
    }

    // 2. Kalkulasi Bottleneck (Mesin dengan Total Flow Keluar + Masuk Tertinggi)
    let maxFlow = -1;
    let bottleneckFac = -1;
    for(let i=0; i<12; i++) {
        let currentFlow = 0;
        for(let j=0; j<12; j++) {
            currentFlow += FLOW[i][j]; // Flow Keluar
            currentFlow += FLOW[j][i]; // Flow Masuk
        }
        if(currentFlow > maxFlow) {
            maxFlow = currentFlow;
            bottleneckFac = i;
        }
    }

    document.getElementById('result-container').classList.remove('empty');
    document.getElementById('cost-value').innerHTML = `Rp ${total.toLocaleString('id-ID')}`;
    let badge = document.getElementById('status-badge-res');
    if(total === 221825) { badge.innerHTML = "🌟 GLOBAL OPTIMUM DITEMUKAN"; badge.style.color = "#f59e0b"; } 
    else { badge.innerHTML = "Metrik telah dikalkulasi."; badge.style.color = "var(--text-muted)"; }

    // Tampilkan Permutasi
    let permDiv = document.getElementById('current-permutation');
    permDiv.style.display = 'block';
    permDiv.innerText = `Permutasi: [${currentPerm.join(', ')}]`;

    // 3. Kalkulasi Analisis Rektilinear (Jarak per Suku Cadang)
    let chartLabels = []; let chartData = []; let bgColors = [];
    let totalDistance = 0;
    let maxRouteDist = -1;
    let longestPartName = "";

    for (let part in PART_ROUTES) {
        let seq = PART_ROUTES[part]; let distSum = 0;
        for(let k=0; k<seq.length-1; k++) { 
            distSum += DIST[mapping[seq[k]]][mapping[seq[k+1]]]; 
        }
        
        totalDistance += distSum;
        if(distSum > maxRouteDist) {
            maxRouteDist = distSum;
            longestPartName = PART_NAMES[part];
        }

        chartLabels.push(PART_NAMES[part]); 
        chartData.push(distSum); 
        bgColors.push(PART_COLORS[part]);
    }

    // 4. Update UI Micro-KPI
    document.getElementById('kpi-container').style.display = 'grid';
    document.getElementById('kpi-dist').innerText = `${totalDistance.toLocaleString('id-ID')} ft`;
    document.getElementById('kpi-bottle').innerText = `F${bottleneckFac + 1}`;
    document.getElementById('kpi-longest').innerText = longestPartName;

    // 5. Update Chart.js
    if(chartInstance) chartInstance.destroy();
    let ctx = document.getElementById('costChart').getContext('2d');
    chartInstance = new Chart(ctx, { 
        type: 'bar', 
        data: { labels: chartLabels, datasets: [{ label: 'Jarak (ft)', data: chartData, backgroundColor: bgColors }] }, 
        options: { 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { grid: { color: '#334155' } }
            }
        } 
    });
}

function previewRoute() {
    let partKey = document.getElementById('part-select').value;
    let container = document.getElementById('route-preview');
    if (!partKey) { container.innerHTML = '<div class="route-placeholder">Pilih produk...</div>'; return; }
    let seq = PART_ROUTES[partKey]; let color = PART_COLORS[partKey]; let html = '';
    for(let i=0; i<seq.length; i++) {
        html += `<div class="route-node" style="background-color: ${color}">F${seq[i] + 1}</div>`;
        if(i < seq.length - 1) html += `<div class="route-arrow">➔</div>`;
    }
    container.innerHTML = html;
}

// ==========================================
// 4. ANIMASI SVG AGV
// ==========================================
function drawRouteSingle() { 
    isCurrentlyAnimated = true;
    let pk = document.getElementById('part-select').value; 
    if(pk) buildSVG([pk], true); else alert("Pilih Suku Cadang dari dropdown!"); 
}
function drawRouteStatic() { 
    isCurrentlyAnimated = false;
    let pk = document.getElementById('part-select').value; 
    if(pk) buildSVG([pk], false); else alert("Pilih Suku Cadang dari dropdown!"); 
}
function drawRouteMulti() { isCurrentlyAnimated = true; buildSVG(['alpha', 'gamma', 'epsilon'], true); }
function changeSpeed() { if(lastDrawnParts.length > 0) buildSVG(lastDrawnParts, isCurrentlyAnimated); }
function clearRoute() { document.getElementById('route-layer').innerHTML = ''; lastDrawnParts = []; }

// Fungsi utama pembuat SVG dengan sakelar animasi
function buildSVG(partsArray, animate = true) {
    clearRoute(); lastDrawnParts = partsArray;
    let speedMultiplier = parseFloat(document.getElementById('speed-select').value);
    let floorRect = document.getElementById('floor-area').getBoundingClientRect();
    let aisle = document.getElementById('factory-aisle').getBoundingClientRect();
    let aisleCenterX = aisle.left - floorRect.left + (aisle.width / 2);
    let svgLayer = document.getElementById('route-layer');

    let mapping = {};
    for(let i=0; i<12; i++) {
        let slot = document.getElementById('loc-' + i);
        let fac = slot.querySelector('.facility');
        if(fac) { mapping[parseInt(fac.getAttribute('data-val'))] = slot; }
    }
    if(Object.keys(mapping).length < 12) { alert("Selesaikan 12 mesin sebelum simulasi rute!"); return; }

    for(let a=0; a<partsArray.length; a++) {
        let partKey = partsArray[a]; let seq = PART_ROUTES[partKey]; let agvColor = PART_COLORS[partKey]; let trackOffset = (a - 1) * 12;
        let points = [];
        for(let i=0; i<seq.length; i++) {
            let rect = mapping[seq[i]].getBoundingClientRect();
            points.push({ x: rect.left - floorRect.left + (rect.width / 2), y: rect.top - floorRect.top + (rect.height / 2) });
        }

        let dPath = `M ${points[0].x} ${points[0].y} `;
        for(let i=0; i<points.length-1; i++) {
            let p1 = points[i]; let p2 = points[i+1];
            if (Math.abs(p1.y - p2.y) < 5) dPath += `L ${p2.x} ${p2.y} `;
            else dPath += `L ${aisleCenterX + trackOffset} ${p1.y} L ${aisleCenterX + trackOffset} ${p2.y} L ${p2.x} ${p2.y} `;
        }

        let pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('id', `path-${a}`); pathEl.setAttribute('class', 'track-line'); pathEl.setAttribute('d', dPath); pathEl.setAttribute('stroke', agvColor);
        svgLayer.appendChild(pathEl);

        // Hanya buat dan tempel robot jika mode animate bernilai true
        if(animate) {
            let robotGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            let shadow = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); shadow.setAttribute('x', '-12'); shadow.setAttribute('y', '-8'); shadow.setAttribute('width', '24'); shadow.setAttribute('height', '16'); shadow.setAttribute('fill', 'rgba(0,0,0,0.5)'); shadow.setAttribute('rx', '4');
            let body = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); body.setAttribute('x', '-14'); body.setAttribute('y', '-10'); body.setAttribute('width', '28'); body.setAttribute('height', '20'); body.setAttribute('rx', '4'); body.setAttribute('fill', agvColor);
            let cabin = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); cabin.setAttribute('cx', '-2'); cabin.setAttribute('cy', '0'); cabin.setAttribute('r', '5'); cabin.setAttribute('fill', '#ffffff');
            robotGroup.appendChild(shadow); robotGroup.appendChild(body); robotGroup.appendChild(cabin);

            let anim = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            anim.setAttribute('fill', 'freeze'); anim.setAttribute('repeatCount', 'indefinite'); anim.setAttribute('rotate', 'auto');
            anim.setAttribute('dur', ((pathEl.getTotalLength() / 150) / speedMultiplier) + 's');
            let mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath'); mpath.setAttribute('href', `#path-${a}`);
            anim.appendChild(mpath); robotGroup.appendChild(anim); svgLayer.appendChild(robotGroup);
        }
    }
    if(animate) playAnim();
}

// ==========================================
// 5. FITUR EKSPOR GAMBAR (SCREENSHOT)
// ==========================================
function captureLayout() {
    let btn = document.querySelector('button[onclick="captureLayout()"]');
    let originalText = btn.innerHTML;
    
    // Ubah status tombol
    btn.innerHTML = "⏳ Memproses Gambar...";
    btn.style.opacity = "0.7";
    btn.style.pointerEvents = "none";

    let targetElement = document.querySelector('.factory-wrapper');

    // Menggunakan pustaka html-to-image yang jauh lebih stabil untuk SVG & Gradient CSS
    htmlToImage.toPng(targetElement, { 
        backgroundColor: '#0f172a', 
        pixelRatio: 2 // Resolusi HD
    })
    .then(function (dataUrl) {
        // Buat link download
        let link = document.createElement('a');
        link.download = `AutoPlant_Layout_${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();

        // Kembalikan status tombol
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
    })
    .catch(function (error) {
        console.error("Gagal mengambil gambar: ", error);
        alert("Terjadi kesalahan saat memproses gambar. Periksa konsol browser.");
        
        // Kembalikan status tombol jika gagal
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
    });
}

// ==========================================
// 6. FITUR TEMA TERANG / GELAP (THEME TOGGLE)
// ==========================================
function toggleTheme() {
    let body = document.body;
    let btn = document.getElementById('theme-toggle');
    
    // Sakelar kelas light-mode
    body.classList.toggle('light-mode');
    
    // Cek apakah sekarang sedang mode terang
    let isLightMode = body.classList.contains('light-mode');
    
    if (isLightMode) {
        btn.innerHTML = "🌙 Ganti ke Dark Mode";
        
        // Update grid warna Chart.js jika chart sudah pernah di-render
        if(chartInstance) {
            chartInstance.options.scales.y.grid.color = '#e2e8f0'; // Grid abu-abu terang
            chartInstance.update();
        }
    } else {
        btn.innerHTML = "☀️ Ganti ke Light Mode";
        
        // Update grid warna Chart.js kembali ke gelap
        if(chartInstance) {
            chartInstance.options.scales.y.grid.color = '#334155'; // Grid biru gelap
            chartInstance.update();
        }
    }
}

initApp();