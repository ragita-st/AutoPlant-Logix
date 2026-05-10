import streamlit as st
# import streamlit.components.v1 as components
import os
from backend.data import FLOW_MATRIX, DIST_MATRIX
from backend.optimizer import run_auto_optimizer

st.set_page_config(page_title="AutoPlant Logix | AI Optimization", page_icon="🏭", layout="wide", initial_sidebar_state="expanded")

if 'optimal_layout' not in st.session_state:
    st.session_state.optimal_layout = None
if 'optimal_cost' not in st.session_state:
    st.session_state.optimal_cost = None

with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2830/2830305.png", width=80)
    st.title("AutoPlant Logix")
    st.markdown("---")
    
    # SAKELAR STRICT MODE
    strict_mode = st.toggle("🔒 Aktifkan Strict Mode", value=False, help="Batasi penempatan fasilitas sesuai kapasitas ruang (100, 200, 300 ft²).")
    st.markdown("---")

    st.subheader("🧠 AI Optimizer")
    
    if st.button("🚀 Jalankan Auto-Optimize", use_container_width=True, type="primary"):
        with st.spinner('AI sedang menganalisis jutaan permutasi...'):
            best_perm, best_cost = run_auto_optimizer(FLOW_MATRIX, DIST_MATRIX, strict_mode=strict_mode)
            st.session_state.optimal_layout = best_perm.tolist()
            st.session_state.optimal_cost = best_cost
        st.success(f"Optimal Ditemukan! TMHC: Rp {best_cost:,.0f}")
        
    if st.button("🔄 Reset Layout", use_container_width=True):
        st.session_state.optimal_layout = None
        st.session_state.optimal_cost = None
        st.rerun()

st.title("🏭 Dasbor Simulasi Logistik & AI Tata Letak AGV")

def load_html_component(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

html_file_path = os.path.join(os.path.dirname(__file__), 'frontend', 'dashboard.html')

if os.path.exists(html_file_path):
    html_content = load_html_component(html_file_path)
    
    # MAGIC INJECTION: Teruskan status Strict Mode dan Layout ke HTML
    injection_script = f"window.STRICT_MODE = {'true' if strict_mode else 'false'};"
    if st.session_state.optimal_layout is not None:
        injection_script += f"\nwindow.INJECTED_LAYOUT = {st.session_state.optimal_layout};"
        
    html_content = html_content.replace('// /* INJECT_STATE_HERE */', injection_script)
    # components.html(html_content, height=1000, scrolling=True)
    st.html(html_content)
else:
    st.error(f"❌ File frontend tidak ditemukan.")