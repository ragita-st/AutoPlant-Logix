import streamlit as st
import streamlit.components.v1 as components
import os
import numpy as np

# Import Data & Optimizer dari folder backend
from backend.data import FLOW_MATRIX, DIST_MATRIX
from backend.optimizer import run_auto_optimizer

# ==========================================
# 1. KONFIGURASI HALAMAN STREAMLIT
# ==========================================
st.set_page_config(
    page_title="AutoPlant Logix | AI Optimization",
    page_icon="🏭",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ==========================================
# 2. STATE MANAGEMENT & SIDEBAR
# ==========================================
if 'optimal_layout' not in st.session_state:
    st.session_state.optimal_layout = None
if 'optimal_cost' not in st.session_state:
    st.session_state.optimal_cost = None

with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2830/2830305.png", width=80)
    st.title("AutoPlant Logix")
    st.markdown("---")
    
    st.subheader("🧠 AI Optimizer")
    st.markdown("Gunakan Kecerdasan Buatan (Simulated Annealing) untuk menemukan susunan pabrik terbaik.")
    
    # TOMBOL PEMICU ALGORITMA PYTHON
    if st.button("🚀 Jalankan Auto-Optimize", use_container_width=True, type="primary"):
            with st.spinner('AI sedang menganalisis jutaan permutasi...'):
                best_perm, best_cost = run_auto_optimizer(FLOW_MATRIX, DIST_MATRIX)
                
                # KODE YANG DIPERBAIKI: Langsung kirim array asli ke JavaScript
                st.session_state.optimal_layout = best_perm.tolist()
                st.session_state.optimal_cost = best_cost
                
            st.success(f"Optimal Ditemukan! TMHC: Rp {best_cost:,.0f}")
        
    if st.button("🔄 Reset Layout", use_container_width=True):
        st.session_state.optimal_layout = None
        st.session_state.optimal_cost = None
        st.rerun()

    st.markdown("---")
    st.info("💡 **Tips:** Anda juga bisa menyusun secara manual (Drag & Drop) di dalam dashboard untuk menguji insting Anda melawan AI.")

# ==========================================
# 3. KONTEN UTAMA & RENDER FRONTEND
# ==========================================
st.title("🏭 Dasbor Simulasi Logistik & AI Tata Letak AGV")
st.markdown("Integrasi *Machine Learning* (Simulated Annealing) dengan *Digital Twin* lantai pabrik (Layout A).")

def load_html_component(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

html_file_path = os.path.join(os.path.dirname(__file__), 'frontend', 'dashboard.html')

if os.path.exists(html_file_path):
    html_content = load_html_component(html_file_path)
    
    # MAGIC INJECTION: Jika AI sudah menemukan hasil, suntikkan variabel JS ke dalam HTML!
    if st.session_state.optimal_layout is not None:
        injection_script = f"window.INJECTED_LAYOUT = {st.session_state.optimal_layout};"
        html_content = html_content.replace('// /* INJECT_LAYOUT_HERE */', injection_script)
        
    components.html(html_content, height=1000, scrolling=True)
else:
    st.error(f"❌ File frontend tidak ditemukan di: {html_file_path}")