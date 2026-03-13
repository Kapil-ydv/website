import React, { useState } from "react";
import SlidesAdminSection from "./admin/SlidesAdminSection";
import ProductsAdminSection from "./admin/ProductsAdminSection";



export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("slides");


  const navItems = [
    { id: "slides", icon: "🖼️", label: "Slides" },
    { id: "products", icon: "📦", label: "Products" },
  ];

  const currentLabel =
    navItems.find((n) => n.id === activeTab)?.label || "Slides";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            AdminX
            <span>Control Panel</span>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section">Content</div>
            {navItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span> {item.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-chip">
              <div className="avatar">A</div>
              <div>
                <div className="user-info">Admin</div>
                <div className="user-role">Super Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <div>
              <div className="topbar-title">{currentLabel}</div>
            </div>
            <div className="topbar-actions" />
          </div>

          <div className="content">
            {activeTab === "slides" && (
              <SlidesAdminSection />
            )}

            {activeTab === "products" && (
              <ProductsAdminSection />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --surface2: #f3f4f6;
    --border: #e5e7eb;
    --accent: #2563eb;
    --accent2: #f97373;
    --accent3: #16a34a;
    --text: #111827;
    --muted: #6b7280;
    --radius: 12px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .shopify-section {
    background: var(--bg);
  }

  .app { display: flex; min-height: 100vh; background: var(--bg); }

  /* SIDEBAR */
  .sidebar {
    width: 240px; min-height: 100vh; background: #ffffff;
    border-right: 1px solid #e5e7eb; padding: 24px 0;
    display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
  }
  .sidebar-logo {
    padding: 0 24px 32px; font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 22px; letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .sidebar-logo span { display: block; font-size: 10px; font-weight: 400; letter-spacing: 3px; color: #6b7280; -webkit-text-fill-color: #6b7280; text-transform: uppercase; margin-top: 2px; }
  .sidebar-nav { flex: 1; }
  .nav-section { padding: 8px 16px 4px; font-size: 10px; letter-spacing: 2px; color: #9ca3af; text-transform: uppercase; font-weight: 500; margin-top: 8px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 10px 24px;
    cursor: pointer; transition: all 0.2s; color: #4b5563; font-size: 14px;
    border-left: 2px solid transparent; margin: 2px 0;
  }
  .nav-item:hover { color: var(--accent); background: #eff6ff; }
  .nav-item.active { color: #111827; border-left-color: var(--accent); background: #dbeafe; }
  .nav-icon { font-size: 18px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 16px 24px; border-top: 1px solid #e5e7eb; }
  .user-chip { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; }
  .user-info { font-size: 13px; font-weight: 500; color: #111827; }
  .user-role { font-size: 11px; color: #6b7280; }

  /* MAIN */
  .main { margin-left: 240px; flex: 1; min-height: 100vh; }
  .topbar {
    position: sticky; top: 0; z-index: 50; background: #ffffff;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px 32px; display: flex; align-items: center; justify-content: space-between;
  }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #111827; }
  .topbar-actions { display: flex; gap: 10px; align-items: center; }
  .badge { background: rgba(37,99,235,0.1); color: var(--accent); font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(37,99,235,0.25); }

  .content { padding: 32px; }

  /* SECTION */
  .section { margin-bottom: 32px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .section-desc { font-size: 13px; color: #9ca3af; margin-top: 2px; }

  /* BUTTONS */
  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
    border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
    border: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #5a52d5; transform: translateY(-1px); }
  .btn-danger { background: rgba(255,101,132,0.15); color: var(--accent2); border: 1px solid rgba(255,101,132,0.3); }
  .btn-danger:hover { background: rgba(255,101,132,0.25); }
  .btn-ghost { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-success { background: rgba(67,233,123,0.15); color: var(--accent3); border: 1px solid rgba(67,233,123,0.3); }

  /* TABLE */
  .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 14px 16px; text-align: left; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #e5e7eb; border-bottom: 1px solid var(--border); background: var(--surface2); font-weight: 500; }
  td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--text); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(108,99,255,0.04); }

  .status-pill {
    display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
  }
  .status-open { background: rgba(108,99,255,0.15); color: var(--accent); }
  .status-closed { background: rgba(67,233,123,0.15); color: var(--accent3); }
  .status-escalated { background: rgba(255,101,132,0.15); color: var(--accent2); }
  .status-active { background: rgba(67,233,123,0.15); color: var(--accent3); }
  .status-inactive { background: rgba(107,114,128,0.2); color: var(--muted); }
  .status-oos { background: rgba(255,101,132,0.15); color: var(--accent2); }

  .action-btn { padding: 6px 8px; border-radius: 6px; border: none; cursor: pointer; transition: all 0.2s; font-size: 14px; }
  .action-edit { background: rgba(108,99,255,0.15); color: var(--accent); }
  .action-edit:hover { background: var(--accent); color: white; }
  .action-del { background: rgba(255,101,132,0.15); color: var(--accent2); }
  .action-del:hover { background: var(--accent2); color: white; }

  /* SLIDES GRID */
  .slides-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .slide-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    overflow: hidden; transition: transform 0.2s, border-color 0.2s;
  }
  .slide-card:hover { transform: translateY(-3px); border-color: var(--accent); }
  .slide-img { width: 100%; height: 140px; object-fit: cover; }
  .slide-body { padding: 14px; }
  .slide-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .slide-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; }
  .slide-order { font-size: 11px; color: var(--muted); }
  .slide-card.add-card {
    border: 2px dashed var(--border); display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 8px; cursor: pointer; min-height: 220px; color: var(--muted);
    transition: all 0.2s;
  }
  .slide-card.add-card:hover { border-color: var(--accent); color: var(--accent); background: rgba(108,99,255,0.04); }
  .add-icon { font-size: 36px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 200;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    animation: slideUp 0.25s;
  }
  @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header { padding: 24px 24px 0; display: flex; align-items: center; justify-content: space-between; }
  .modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .modal-close { background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; width: 32px; height: 32px; cursor: pointer; color: var(--muted); font-size: 18px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .modal-close:hover { color: var(--text); border-color: var(--accent); }
  .modal-body { padding: 24px; }
  .form-group { margin-bottom: 16px; }
  .form-label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px; color: var(--text); font-size: 14px;
    font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); }
  .form-select { appearance: none; cursor: pointer; }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 24px; }

  /* RESPONSIVE LAYOUT */
  @media (max-width: 1024px) {
    .app {
      flex-direction: column;
    }

    .sidebar {
      position: static;
      width: 100%;
      min-height: auto;
      flex-direction: row;
      align-items: center;
      padding: 12px 16px;
      gap: 16px;
    }

    .sidebar-logo {
      padding: 0;
      font-size: 18px;
    }

    .sidebar-nav {
      flex: 1;
      display: flex;
      align-items: center;
      overflow-x: auto;
    }

    .nav-section {
      display: none;
    }

    .nav-item {
      padding: 8px 12px;
      font-size: 13px;
      white-space: nowrap;
    }

    .sidebar-footer {
      display: none;
    }

    .main {
      margin-left: 0;
    }

    .topbar {
      padding: 12px 16px;
    }

    .content {
      padding: 16px;
    }

    .slides-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    table {
      font-size: 12px;
    }

    th,
    td {
      padding: 10px 8px;
    }
  }

  @media (max-width: 640px) {
    .slides-grid {
      grid-template-columns: minmax(0, 1fr);
    }

    .topbar-actions {
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn {
      padding: 7px 12px;
      font-size: 12px;
    }

    .search-bar {
      font-size: 13px;
    }
  }
`;