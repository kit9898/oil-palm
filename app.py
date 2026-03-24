import streamlit as st
import streamlit.components.v1 as components
import subprocess
import os
import pandas as pd
from pathlib import Path
from datetime import datetime

# ─── Page Config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="PalmArchitect | Precision Agriculture AI",
    page_icon="🌴",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── Global CSS ───────────────────────────────────────────────────────────────
# Injected via markdown to affect the parent Streamlit DOM (components.html is sandboxed).
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

/* ── GLOBAL TOKENS ── */
:root {
    --primary: #0058bc; --primary-container: #0070eb;
    --surface: #f9f9fb; --surface-low: #f3f3f5;
    --surface-container: #eeeef0; --surface-high: #e8e8ea;
    --surface-variant: #e2e2e4; --surface-lowest: #ffffff;
    --on-surface: #1a1c1d; --on-surface-variant: #414755;
    --outline-variant: #c1c6d7; --secondary-fixed: #d8e2ff;
    --tertiary: #9e3d00;
}
html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; background-color: var(--surface); color: var(--on-surface); }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; line-height: 1; }
/* ── HIDE STREAMLIT CHROME ── */
#MainMenu, footer, header { visibility: hidden; }
.stDeployButton { display: none; }
.block-container { padding: 0 !important; max-width: 100% !important; }
[data-testid="stSidebar"] { display: none !important; }
/* ── TOP NAV ── */
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--surface); position: sticky; top: 0; z-index: 100; }
.nav-logo { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--on-surface); }
.nav-logo span { color: var(--primary); }
.nav-links { display: flex; gap: 0.5rem; }
.nav-link { color: var(--on-surface-variant); font-size: 0.875rem; font-weight: 500; padding: 0.4rem 1rem; border-radius: 9999px; text-decoration: none; }
.nav-link:hover { background: var(--surface-high); }
.nav-actions { display: flex; gap: 0.5rem; }

/* ── STREAMLIT SANDBOX OVERRIDES (using :has) ── */
div[data-testid="stVerticalBlock"]:has(#marker-upload-card) {
    background: var(--surface-lowest);
    border-radius: 1rem;
    padding: 3rem 2rem;
    border: 1px solid rgba(193,198,215,0.15);
    box-shadow: 0 10px 40px rgba(0,88,188,0.04);
}
div[data-testid="stVerticalBlock"]:has(#marker-hero-card) {
    background: var(--surface-lowest);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 10px 40px rgba(0,88,188,0.06);
}

/* ── UPLOAD SCREEN ── */
.upload-badge { display: inline-block; padding: 0.4rem 1rem; border-radius: 9999px; background: var(--secondary-fixed); color: #001a41; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 1.5rem; }
.upload-hero-title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; color: var(--on-surface); }
.upload-hero-title .accent { color: var(--primary); font-style: italic; }
.upload-subtitle { font-size: 1.1rem; color: var(--on-surface-variant); line-height: 1.6; max-width: 32rem; margin: 1rem auto 0; }
.upload-icon-ring { width: 6rem; height: 6rem; background: var(--surface-low); border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
.upload-icon-ring .material-symbols-outlined { font-size: 2.5rem; color: var(--primary); font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 48; }
.file-type-badges { display: flex; justify-content: center; gap: 1rem; font-size: 0.65rem; font-weight: 700; color: var(--on-surface-variant); opacity: 0.6; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 1.5rem; }
.info-card { background: var(--surface-low); border-radius: 1rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1rem; }
.info-card .material-symbols-outlined { color: var(--primary); font-size: 1.5rem; }
.info-card strong { font-size: 0.9rem; font-weight: 700; }
.info-card p { font-size: 0.8rem; color: var(--on-surface-variant); line-height: 1.4; margin-top: 0.25rem; }
.footer-bar { padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--on-surface-variant); opacity: 0.6; }
.footer-status { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
.status-dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: #22c55e; }

/* ── PROCESSING SCREEN ── */
.processing-overlay { position: fixed; inset: 0; background: rgba(249,249,251,0.6); backdrop-filter: blur(32px); z-index: 200; display: flex; align-items: center; justify-content: center; }
.processing-card { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); border-radius: 1.5rem; padding: 3rem; width: min(560px, 90vw); display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 20px 40px rgba(0,88,188,0.06); position: relative; overflow: hidden; }
.loader-cluster { position: relative; width: 7rem; height: 7rem; margin-bottom: 2rem; }
.loader-track { position: absolute; inset: 0; border: 4px solid var(--surface-high); border-radius: 50%; }
.loader-ring { position: absolute; inset: 0; border: 4px solid transparent; border-top-color: var(--primary); border-radius: 50%; animation: spin 1.5s linear infinite; }
.loader-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.loader-inner .material-symbols-outlined { font-size: 2.25rem; color: var(--primary); font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48; }
@keyframes spin { to { transform: rotate(360deg); } }
.processing-badge { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--on-surface-variant); opacity: 0.7; margin-bottom: 0.5rem; }
.processing-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; color: var(--on-surface); }
.processing-sub { font-size: 0.875rem; color: var(--on-surface-variant); opacity: 0.8; margin-top: 0.5rem; }
.progress-bar-track { width: 100%; max-width: 24rem; height: 6px; background: var(--surface-high); border-radius: 9999px; overflow: hidden; margin-top: 2rem; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--primary-container)); border-radius: 9999px; animation: progress 3s ease-in-out infinite; }
@keyframes progress { 0% { width: 5%; } 50% { width: 80%; } 100% { width: 95%; } }
.processing-meta-grid { display: flex; gap: 1.5rem; margin-top: 1.5rem; padding-top: 1.5rem; }
.processing-meta-item { display: flex; flex-direction: column; gap: 0.25rem; }
.processing-meta-item:not(:first-child) { border-left: 1px solid rgba(193,198,215,0.25); padding-left: 1.5rem; }
.meta-label { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--on-surface-variant); opacity: 0.6; }
.meta-value { font-size: 0.85rem; font-weight: 700; color: var(--primary); }
.glow-orb-top { position: absolute; top: -6rem; right: -6rem; width: 16rem; height: 16rem; background: rgba(0,88,188,0.05); border-radius: 50%; filter: blur(40px); pointer-events: none; }
.glow-orb-bot { position: absolute; bottom: -6rem; left: -6rem; width: 16rem; height: 16rem; background: rgba(161,190,253,0.1); border-radius: 50%; filter: blur(40px); pointer-events: none; }

/* ── RESULTS SCREEN ── */
.sidebar { width: 16rem; min-height: calc(100vh - 4.5rem); background: var(--surface-high); padding: 1.5rem 1rem; flex-shrink: 0; }
.sidebar-heading { font-size: 1.1rem; font-weight: 900; letter-spacing: -0.025em; color: var(--on-surface); }
.sidebar-sub { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--on-surface-variant); opacity: 0.6; margin-top: 0.1rem; margin-bottom: 2rem; }
.nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.75rem; font-size: 0.875rem; color: var(--on-surface-variant); text-decoration: none; transition: all 0.15s ease; }
.nav-item.active { color: var(--primary); font-weight: 700; background: linear-gradient(to right, transparent, var(--surface-low)); border-right: 2px solid var(--primary); }
.nav-item:hover:not(.active) { background: var(--surface-low); color: var(--on-surface); }
.sidebar-footer { margin-top: auto; padding-top: 1.5rem; }
.results-main { flex: 1; padding: 2rem 2.5rem; overflow: auto; }
.results-header { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 2rem; }
.results-overline { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--on-surface-variant); opacity: 0.7; }
.results-title { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; letter-spacing: -0.03em; color: var(--on-surface); }
.count-card { background: var(--surface-low); border-radius: 1rem; padding: 1rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.count-divider { width: 1px; height: 2.5rem; background: rgba(193,198,215,0.3); }
.count-item label { font-size: 0.55rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; color: var(--on-surface-variant); opacity: 0.6; }
.count-item .val { font-size: 1.5rem; font-weight: 800; color: var(--on-surface); letter-spacing: -0.02em; }
.count-item .val.accent { color: var(--primary); }
.meta-card { background: var(--surface-lowest); border-radius: 1rem; padding: 1.5rem; }
.meta-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1rem; }
.meta-row { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px solid var(--surface-low); font-size: 0.8rem; }
.meta-row:last-child { border-bottom: none; }
.meta-row .key { color: var(--on-surface-variant); }
.meta-row .val { font-weight: 600; }
.insight-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.insight-item { background: var(--surface-lowest); padding: 1rem; border-radius: 0.75rem; }
.insight-item .material-symbols-outlined { color: var(--primary); font-size: 1.25rem; margin-bottom: 0.25rem; display: block; }
.insight-item .label { font-size: 0.6rem; color: var(--on-surface-variant); text-transform: uppercase; letter-spacing: 0.08em; }
.insight-item .val { font-size: 1.15rem; font-weight: 800; letter-spacing: -0.02em; }
.thumbnail-reel { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; margin-top: 0.75rem; }
.thumbnail-reel::-webkit-scrollbar { display: none; }
.thumb-btn { flex: none; width: 11rem; cursor: pointer; }
.thumb-frame { aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden; background: var(--surface-high); position: relative; }
.thumb-frame img { width: 100%; height: 100%; object-fit: cover; }
.thumb-label { display: flex; justify-content: space-between; align-items: center; padding: 0.25rem 0.25rem 0; }
.fab { position: fixed; bottom: 2rem; right: 2rem; background: var(--primary); color: white; width: 3.5rem; height: 3.5rem; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,88,188,0.4); cursor: pointer; z-index: 50; transition: transform 0.2s ease; }
.fab:hover { transform: scale(1.1); }

/* ── STREAMLIT WIDGET OVERRIDES ── */
[data-testid="stFileUploader"] { background: transparent !important; border: none !important; padding: 0 !important; width: 100%; max-width: 400px; margin: 0 auto; }
[data-testid="stFileUploaderDropzone"] { background: var(--surface-low) !important; border: 1.5px dashed var(--outline-variant) !important; border-radius: 1rem !important; }
.stButton { display: flex; justify-content: center; width: 100%; margin: 0 auto; max-width: 400px; }
.stButton > button { background: linear-gradient(135deg, #005bc1, #0070eb) !important; color: white !important; border: none !important; border-radius: 9999px !important; font-weight: 700 !important; padding: 0.75rem 2rem !important; width: 100% !important; font-size: 1rem !important; transition: all 0.2s !important; box-shadow: 0 4px 20px rgba(0,88,188,0.25) !important; }
.stButton > button:hover { transform: translateY(-1px) !important; box-shadow: 0 8px 30px rgba(0,88,188,0.4) !important; }
[data-testid="stDownloadButton"] > button { background: var(--surface-high) !important; color: var(--primary) !important; border: 1px solid var(--outline-variant) !important; border-radius: 9999px !important; font-weight: 700 !important; font-size: 0.8rem !important; padding: 0.6rem 1.5rem !important; width: 100% !important; }
[data-testid="stSlider"] { width: 100%; max-width: 400px; margin: 0 auto; }
[data-testid="stSlider"] > div > div > div > div { background: var(--primary) !important; }
[data-testid="stImage"] img { border-radius: 1rem; width: 100%; }
</style>
""", unsafe_allow_html=True)

# ─── Session State ─────────────────────────────────────────────────────────────
defaults = {
    "page": "upload",            # upload | results
    "result_df": None,
    "annotated_path": None,
    "total_palms": 0,
    "avg_confidence": 0.0,
    "uploaded_filename": "",
    "run_timestamp": "",
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─── Shared Top Nav ────────────────────────────────────────────────────────────
def render_nav():
    st.markdown("""
    <div class="top-nav">
        <span class="nav-logo">Palm<span>Architect</span></span>
        <nav class="nav-links">
            <a class="nav-link" href="#">Dashboard</a>
            <a class="nav-link" href="#">Detection</a>
            <a class="nav-link" href="#">Analytics</a>
        </nav>
        <div class="nav-actions">
            <span class="material-symbols-outlined" style="color:#414755;cursor:pointer;padding:0.5rem;">notifications</span>
            <span class="material-symbols-outlined" style="color:#414755;cursor:pointer;padding:0.5rem;">account_circle</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 1 — UPLOAD
# ══════════════════════════════════════════════════════════════════════════════
if st.session_state.page == "upload":
    render_nav()

    # Hero
    st.markdown("""
    <div style="text-align:center; padding: 4rem 2rem 2rem; max-width: 56rem; margin: 0 auto;">
        <span class="upload-badge">Precision Agriculture AI</span>
        <h1 class="upload-hero-title">Project <span class="accent">Oil-Palm</span></h1>
        <p class="upload-subtitle">Advanced palm health detection through structural data architecture and computer vision.</p>
    </div>
    """, unsafe_allow_html=True)

    # Bento Grid
    col_main, col_side = st.columns([2, 1], gap="medium")

    with col_main:
        st.markdown('<div id="marker-upload-card"></div>', unsafe_allow_html=True)
        st.markdown("""
        <div class="upload-icon-ring">
            <span class="material-symbols-outlined">cloud_upload</span>
        </div>
        <div style="text-align:center; margin-bottom:1rem;">
            <h2 style="font-size:1.5rem; font-weight:700; margin:0;">Ready for Detection?</h2>
            <p style="font-size:0.875rem; color:var(--on-surface-variant); margin-top:0.5rem;">Drag and drop high-resolution imagery here or browse your local directory.</p>
        </div>
        """, unsafe_allow_html=True)

        uploaded_file = st.file_uploader(
            "Drop a drone image",
            type=["jpg", "jpeg", "png", "tiff", "tif"],
            label_visibility="collapsed",
        )

        confidence_threshold = st.slider(
            "Confidence Threshold", 0.0, 1.0, 0.5, 0.01,
            help="Minimum confidence score to include a detection."
        )

        run_clicked = st.button("🛰️  Upload & Run Detection")

        st.markdown("""
        <div class="file-type-badges">
            <span>JPG</span><span>PNG</span><span>TIFF</span><span>RAW</span>
        </div>
        """, unsafe_allow_html=True)

    with col_side:
        st.markdown("""
        <div class="info-card" style="margin-bottom:1rem;">
            <span class="material-symbols-outlined">biotech</span>
            <div>
                <strong>Real-time Analysis</strong>
                <p>Instant identification of Ganoderma and pest stress via RetinaNet.</p>
            </div>
        </div>
        <div class="info-card">
            <span class="material-symbols-outlined">query_stats</span>
            <div>
                <strong>Plantation Insights</strong>
                <p>Connect historical data for predictive reporting and yield management.</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Footer
    st.markdown("""
    <div class="footer-bar">
        <span>© 2024 Vantatech. All rights reserved.</span>
        <div class="footer-status">
            <div class="status-dot"></div>
            System Operational: v2.4 Enterprise
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ── Run Logic ─────────────────────────────────────────────────────────────
    if run_clicked:
        if uploaded_file is None:
            st.error("⚠️ Please upload a drone image first.")
        else:
            data_dir   = Path("./data"); data_dir.mkdir(exist_ok=True)
            input_path = data_dir / "input_drone.jpg"
            output_csv = data_dir / "result.csv"
            annotated  = data_dir / "annotated_drone.jpg"
            cwd_abs    = Path(".").resolve()

            with open(input_path, "wb") as f:
                f.write(uploaded_file.getvalue())

            # ── Processing Overlay ─────────────────────────────────────────
            st.markdown("""
            <div class="processing-overlay">
              <div class="processing-card">
                <div class="glow-orb-top"></div>
                <div class="glow-orb-bot"></div>
                <div class="loader-cluster">
                  <div class="loader-track"></div>
                  <div class="loader-ring"></div>
                  <div class="loader-inner">
                    <span class="material-symbols-outlined">biotech</span>
                  </div>
                </div>
                <p class="processing-badge">Plantation AI Analysis</p>
                <h2 class="processing-title">Running Inference…</h2>
                <p class="processing-sub">GPU-accelerated detection on Jetson Orin Nano</p>
                <div class="progress-bar-track"><div class="progress-bar-fill"></div></div>
                <div class="processing-meta-grid">
                  <div class="processing-meta-item"><span class="meta-label">Model</span><span class="meta-value">ResNet-101</span></div>
                  <div class="processing-meta-item"><span class="meta-label">Runtime</span><span class="meta-value">NVIDIA GPU</span></div>
                  <div class="processing-meta-item"><span class="meta-label">Telemetry</span><span class="meta-value">ACTIVE</span></div>
                </div>
              </div>
            </div>
            """, unsafe_allow_html=True)

            # ── Step 1: Inference ──────────────────────────────────────────
            try:
                result = subprocess.run([
                    "sudo", "docker", "run", "--runtime", "nvidia", "--rm",
                    "-v", f"{cwd_abs}/data:/workspace/data",
                    "optimal-ipb-jetson",
                    "python3", "/workspace/inference.py",
                    "--model",      "/workspace/data/Google-Resnet101.h5",
                    "--image",      "/workspace/data/input_drone.jpg",
                    "--output",     "/workspace/data/result.csv",
                    "--confidence", str(confidence_threshold),
                ], capture_output=True, text=True, timeout=300)
                if result.returncode != 0:
                    st.error(f"**Inference failed**\n```\n{result.stderr.strip()}\n```")
                    st.stop()
            except subprocess.TimeoutExpired:
                st.error("⏱ Inference timed out after 5 minutes.")
                st.stop()
            except Exception as e:
                st.error(f"⚠️ Docker error: `{e}`")
                st.stop()

            # ── Step 2: Draw Boxes ─────────────────────────────────────────
            try:
                draw_result = subprocess.run([
                    "sudo", "docker", "run", "--runtime", "nvidia", "--rm",
                    "-v", f"{cwd_abs}/data:/workspace/data",
                    "optimal-ipb-jetson",
                    "python3", "/workspace/data/draw_boxes.py",
                    "--image",  "/workspace/data/input_drone.jpg",
                    "--csv",    "/workspace/data/result.csv",
                    "--output", "/workspace/data/annotated_drone.jpg",
                ], capture_output=True, text=True, timeout=120)
                if draw_result.returncode != 0:
                    st.error(f"**Box rendering failed**\n```\n{draw_result.stderr.strip()}\n```")
                    st.stop()
            except subprocess.TimeoutExpired:
                st.error("⏱ Rendering timed out.")
                st.stop()
            except Exception as e:
                st.error(f"⚠️ Drawing error: `{e}`")
                st.stop()

            # ── Step 3: Update State & Navigate ───────────────────────────
            try:
                df = pd.read_csv(output_csv)
                st.session_state.result_df       = df
                st.session_state.total_palms     = len(df)
                st.session_state.avg_confidence  = df["confidence"].mean() if not df.empty else 0.0
                st.session_state.annotated_path  = str(annotated)
                st.session_state.uploaded_filename = uploaded_file.name
                st.session_state.run_timestamp   = datetime.now().strftime("%b %d, %Y %H:%M")
                st.session_state.page            = "results"
            except Exception as e:
                st.error(f"⚠️ Could not parse results: `{e}`")
                st.stop()

            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
#  PAGE 2 — RESULTS GALLERY
# ══════════════════════════════════════════════════════════════════════════════
elif st.session_state.page == "results":
    render_nav()

    df              = st.session_state.result_df
    annotated_path  = st.session_state.annotated_path
    total_palms     = st.session_state.total_palms
    avg_conf        = st.session_state.avg_confidence
    ts              = st.session_state.run_timestamp
    fname           = st.session_state.uploaded_filename

    # ── Layout: Sidebar + Main ────────────────────────────────────────────
    sidebar_col, main_col = st.columns([1, 4], gap="small")

    with sidebar_col:
        st.markdown(f"""
        <div class="sidebar">
            <div>
                <div class="sidebar-heading">Plantation AI</div>
                <div class="sidebar-sub">Premium B2B v2.4</div>
            </div>
            <nav>
                <a class="nav-item active" href="#">
                    <span class="material-symbols-outlined">grid_view</span> Dashboard
                </a>
                <a class="nav-item" href="#">
                    <span class="material-symbols-outlined">biotech</span> Detection
                </a>
                <a class="nav-item" href="#">
                    <span class="material-symbols-outlined">query_stats</span> Analytics
                </a>
                <a class="nav-item" href="#">
                    <span class="material-symbols-outlined">potted_plant</span> Inventory
                </a>
                <a class="nav-item" href="#">
                    <span class="material-symbols-outlined">description</span> Reports
                </a>
            </nav>
        </div>
        """, unsafe_allow_html=True)

        # Back button at bottom of sidebar
        st.markdown("<div style='padding: 1rem 0.5rem;'>", unsafe_allow_html=True)
        if st.button("＋ New Analysis"):
            st.session_state.page = "upload"
            st.session_state.result_df = None
            st.session_state.annotated_path = None
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)

    with main_col:
        st.markdown('<div class="results-main">', unsafe_allow_html=True)

        # ── Header + Count Card ───────────────────────────────────────────
        hdr1, hdr2 = st.columns([3, 2], gap="medium")
        with hdr1:
            st.markdown("""
            <div class="results-header">
                <span class="results-overline">Analysis Results</span>
                <h1 class="results-title">Interactive Detection Gallery</h1>
            </div>
            """, unsafe_allow_html=True)
        with hdr2:
            st.markdown(f"""
            <div class="count-card">
                <div class="count-item">
                    <label>Image</label>
                    <div class="val" style="font-size:0.9rem;">{fname or "input_drone.jpg"}</div>
                </div>
                <div class="count-divider"></div>
                <div class="count-item">
                    <label>Detections</label>
                    <div class="val accent">{total_palms}</div>
                </div>
                <div class="count-divider"></div>
                <div class="count-item">
                    <label>Avg Conf.</label>
                    <div class="val accent">{avg_conf:.1%}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        # ── Hero Image + Data Sidebar ─────────────────────────────────────
        hero_col, data_col = st.columns([2, 1], gap="medium")

        with hero_col:
            if annotated_path and os.path.exists(annotated_path):
                st.markdown('<div id="marker-hero-card"></div>', unsafe_allow_html=True)
                st.markdown(f"""
                <div style="position:relative;">
                    <div style="position:absolute;top:1rem;left:1rem;z-index:10;display:flex;flex-direction:column;gap:0.5rem;">
                        <div class="hero-tag">
                            <span style="width:0.5rem;height:0.5rem;border-radius:50%;background:#0058bc;display:inline-block;"></span>
                            Live Detection: Active
                        </div>
                        <div class="hero-tag" style="background:rgba(0,88,188,0.9);color:white;">
                            {total_palms} Palms Detected
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                st.image(annotated_path, use_container_width=True)

                # Action buttons below hero
                act1, act2 = st.columns(2, gap="small")
                with act1:
                    if df is not None:
                        csv_bytes = df.to_csv(index=False).encode("utf-8")
                        st.download_button("⬇ Export CSV", data=csv_bytes,
                                           file_name="palm_detections.csv",
                                           mime="text/csv", use_container_width=True)
                with act2:
                    if os.path.exists(annotated_path):
                        with open(annotated_path, "rb") as f:
                            img_bytes = f.read()
                        st.download_button("⬇ Export Image", data=img_bytes,
                                           file_name="annotated_drone.jpg",
                                           mime="image/jpeg", use_container_width=True)
            else:
                st.warning("No annotated image found.")

        with data_col:
            # Metadata Analysis Card
            conf_pct = int(avg_conf * 100)
            st.markdown(f"""
            <div class="meta-card" style="margin-bottom:1rem;">
                <h3>Metadata Analysis</h3>
                <div class="meta-row"><span class="key">Timestamp</span><span class="val">{ts}</span></div>
                <div class="meta-row"><span class="key">Source File</span><span class="val">{fname or "—"}</span></div>
                <div class="meta-row"><span class="key">Total Detections</span><span class="val">{total_palms}</span></div>
                <div class="meta-row" style="border-bottom:none;">
                    <span class="key">AI Confidence</span>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div style="width:6rem;height:6px;background:var(--surface-high);border-radius:9999px;overflow:hidden;">
                            <div style="width:{conf_pct}%;height:100%;background:var(--primary);border-radius:9999px;"></div>
                        </div>
                        <span style="font-size:0.75rem;font-weight:700;color:var(--primary);">{avg_conf:.1%}</span>
                    </div>
                </div>
            </div>
            <div class="meta-card" style="background:var(--surface-low);">
                <h3 style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--on-surface-variant);margin-bottom:0.75rem;">Quick Insights</h3>
                <div class="insight-grid">
                    <div class="insight-item">
                        <span class="material-symbols-outlined">eco</span>
                        <div class="label">Health Index</div>
                        <div class="val">Optimal</div>
                    </div>
                    <div class="insight-item">
                        <span class="material-symbols-outlined" style="color:var(--tertiary);">biotech</span>
                        <div class="label">Model</div>
                        <div class="val">ResNet101</div>
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        # ── Detection Report Table ─────────────────────────────────────────
        if df is not None and not df.empty:
            st.markdown("""
            <div style="margin-top:2rem;">
                <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;">Inspection Reel — Detection Report</h2>
            </div>
            """, unsafe_allow_html=True)

            # Top 5 → 20 rows
            st.dataframe(
                df[["label", "confidence", "xmin", "ymin", "xmax", "ymax"]].head(20),
                use_container_width=True, hide_index=True,
            )
            if len(df) > 20:
                st.caption(f"Showing 20 of {len(df)} detections — download CSV for full report")

        st.markdown('</div>', unsafe_allow_html=True)

    # FAB — New Scan
    st.markdown("""
    <div class="fab" title="Start New Scan">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;font-size:1.5rem;">add</span>
    </div>
    """, unsafe_allow_html=True)
