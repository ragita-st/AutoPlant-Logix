import streamlit as st
import streamlit.components.v1 as components
import os
from backend.data import FLOW_MATRIX, DIST_MATRIX
from backend.optimizer import run_auto_optimizer

st.set_page_config(page_title="AutoPlant Logix", page_icon="🏭", layout="wide", initial_sidebar_state="expanded")

if 'optimal_layout' not in st.session_state:
    st.session_state.optimal_layout = None
if 'optimal_cost' not in st.session_state:
    st.session_state.optimal_cost = None

with st.sidebar:
    st.image("https://cdn-icons-png.flaticon.com/512/2830/2830305.png", width=80)
    st.title("AutoPlant Logix")
    st.markdown("---")
    
    st.subheader("🧭 Navigasi Modul")
    menu_app = st.radio("Pilih Mode Aplikasi:", [
        "1️⃣ Desain Layout (Builder)", 
        "2️⃣ Simulasi & AI Optimasi"
    ])
    st.markdown("---")

def load_static_file(filename):
    path = os.path.join(os.path.dirname(__file__), 'frontend', filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

def render_modular_dashboard(strict_mode):
    html = load_static_file('dashboard.html')
    css = load_static_file('style.css')
    js = load_static_file('script.js')
    
    if not html: return None
        
    full_html = html.replace('/* KITA INJECT CSS DARI FILE TERPISAH MENGGUNAKAN PYTHON */', css)
    full_html = full_html.replace('/* KITA INJECT JAVASCRIPT DARI FILE TERPISAH DI SINI */', js)
    
    state_injection = f"window.STRICT_MODE = {'true' if strict_mode else 'false'};"
    if st.session_state.optimal_layout is not None:
        state_injection += f"\nwindow.INJECTED_LAYOUT = {st.session_state.optimal_layout};"
        
    full_html = full_html.replace('// /* INJECT_STATE_HERE */', state_injection)
    return full_html

if menu_app == "1️⃣ Desain Layout (Builder)":
    st.title("🛠️ Facility Layout Builder")
    st.markdown("Tarik blok ruangan dari **Gudang Blok** ke **Lantai Pabrik** (Kiri/Kanan Lorong). Pastikan seluruh blok digunakan!")
    
    html_builder = load_static_file('layout_builder.html')
    if html_builder:
        # Untuk mode builder yang tidak pakai auto-placement, st.html cukup
        st.html(html_builder) 
    else:
        st.error("❌ File frontend/layout_builder.html tidak ditemukan!")

elif menu_app == "2️⃣ Simulasi & AI Optimasi":
    st.title("🏭 Dasbor Simulasi Logistik & AI")
    
    with st.sidebar:
        strict_mode = st.toggle("🔒 Aktifkan Strict Mode", value=False)
        st.subheader("🧠 AI Optimizer")
        
        if st.button("🚀 Jalankan Auto-Optimize", use_container_width=True, type="primary"):
            with st.spinner('AI sedang menganalisis permutasi...'):
                best_perm, best_cost = run_auto_optimizer(FLOW_MATRIX, DIST_MATRIX, strict_mode=strict_mode)
                st.session_state.optimal_layout = best_perm.tolist()
                st.session_state.optimal_cost = best_cost
            st.success(f"Optimal Ditemukan! TMHC: Rp {best_cost:,.0f}")
            
        if st.button("🔄 Reset Layout", use_container_width=True):
            st.session_state.optimal_layout = None
            st.session_state.optimal_cost = None
            st.rerun()

    modular_html = render_modular_dashboard(strict_mode)
    if modular_html:
        # WAJIB MENGGUNAKAN COMPONENTS.HTML UNTUK DASHBOARD AGAR JS TIDAK DIBLOKIR REACT!
        components.html(modular_html, height=1000, scrolling=True)
    else:
        st.error("❌ File komponen modular dashboard tidak lengkap!")