import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavMenu, adminSaveNavMenu } from "../../redux/actions";

function makeKey(label) {
  const s = String(label || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return s || "nav";
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Tag({ children, onRemove }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#eff6ff",
        color: "#2563eb",
        border: "1px solid #bfdbfe",
        borderRadius: 6,
        padding: "2px 8px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            color: "#2563eb",
            padding: "0 2px",
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}

function LabelInput({ value, onChange, placeholder }) {
  return (
    <input
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Label"}
      style={{ flex: 1 }}
    />
  );
}

// ─── Items editor (flat list: Ethnic, Jewellery) ──────────────────────────────

function ItemsEditor({ items, onChange }) {
  const [newLabel, setNewLabel] = useState("");

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    onChange([...items, { label }]);
    setNewLabel("");
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const update = (idx, label) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, label } : it)));

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((it, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LabelInput
            value={it.label}
            onChange={(v) => update(idx, v)}
            placeholder="Item label"
          />
          <button
            type="button"
            className="action-btn action-del"
            onClick={() => remove(idx)}
          >
            🗑️
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          className="form-input"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New item label…"
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button type="button" className="btn btn-primary" onClick={add}>
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── Groups editor (nested: Western Wear) ────────────────────────────────────

function GroupsEditor({ groups, onChange }) {
  const [newGroupLabel, setNewGroupLabel] = useState("");

  const addGroup = () => {
    const label = newGroupLabel.trim();
    if (!label) return;
    onChange([...groups, { label, items: [] }]);
    setNewGroupLabel("");
  };

  const removeGroup = (gi) => onChange(groups.filter((_, i) => i !== gi));

  const updateGroupLabel = (gi, label) =>
    onChange(groups.map((g, i) => (i === gi ? { ...g, label } : g)));

  const updateGroupItems = (gi, items) =>
    onChange(groups.map((g, i) => (i === gi ? { ...g, items } : g)));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {groups.map((g, gi) => (
        <div
          key={gi}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 12,
            background: "#f8fafc",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              Group
            </span>
            <LabelInput
              value={g.label}
              onChange={(v) => updateGroupLabel(gi, v)}
              placeholder="Group label"
            />
            <button
              type="button"
              className="action-btn action-del"
              onClick={() => removeGroup(gi)}
            >
              🗑️
            </button>
          </div>

          <div style={{ paddingLeft: 12, borderLeft: "2px solid #cbd5e1" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Items
            </div>
            <ItemsEditor items={g.items || []} onChange={(items) => updateGroupItems(gi, items)} />
          </div>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <input
          className="form-input"
          value={newGroupLabel}
          onChange={(e) => setNewGroupLabel(e.target.value)}
          placeholder="New group label…"
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && addGroup()}
        />
        <button type="button" className="btn btn-primary" onClick={addGroup}>
          + Add Group
        </button>
      </div>
    </div>
  );
}

// ─── Category IDs editor ──────────────────────────────────────────────────────

function CategoryIdsEditor({ ids, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const num = parseInt(input.trim(), 10);
    if (!Number.isFinite(num)) return;
    if (ids.includes(num)) { setInput(""); return; }
    onChange([...ids, num]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {ids.map((id) => (
        <Tag key={id} onRemove={() => onChange(ids.filter((x) => x !== id))}>
          {id}
        </Tag>
      ))}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          className="form-input"
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add ID…"
          style={{ width: 90, padding: "4px 8px" }}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button type="button" className="btn btn-ghost" style={{ padding: "4px 10px" }} onClick={add}>
          +
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ navItem, allItems, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    label: navItem.label || "",
    categoryIds: navItem.categoryIds || [],
    items: (navItem.items || []).map((it) => ({
      label: it.label,
      categoryIds: it.categoryIds || [],
    })),
    groups: (navItem.groups || []).map((g) => ({
      label: g.label,
      categoryIds: g.categoryIds || [],
      items: (g.items || []).map((it) => ({ label: it.label, categoryIds: it.categoryIds || [] })),
    })),
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState(
    navItem.groups && navItem.groups.length > 0 ? "groups" : "items"
  );

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.label.trim()) { setError("Label is required"); return; }
    setSaving(true);
    setError("");
    try {
      const updated = allItems.map((it) =>
        (it._id === navItem._id)
          ? {
              key: makeKey(form.label.trim()),
              label: form.label.trim(),
              categoryIds: form.categoryIds,
              items: mode === "items" ? form.items : [],
              groups: mode === "groups" ? form.groups : [],
            }
          : {
              key: makeKey(it.label),
              label: it.label,
              categoryIds: it.categoryIds || [],
              items: it.items || [],
              groups: it.groups || [],
            }
      );
      await adminSaveNavMenu(updated);
      onSaved();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: 640, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">Edit "{navItem.label}"</div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body" style={{ display: "grid", gap: 16 }}>
          {error && (
            <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Label</label>
              <input className="form-input" value={form.label} onChange={(e) => set("label", e.target.value)} />
            </div>
          </div>

          {/* Items vs Groups toggle */}
          <div>
            <label className="form-label">Sub-navigation type</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className={`btn ${mode === "items" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setMode("items")}
              >
                Flat items
              </button>
              <button
                type="button"
                className={`btn ${mode === "groups" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setMode("groups")}
              >
                Grouped items
              </button>
            </div>
          </div>

          {mode === "items" && (
            <div>
              <label className="form-label">Items</label>
              <ItemsEditor items={form.items} onChange={(v) => set("items", v)} />
            </div>
          )}

          {mode === "groups" && (
            <div>
              <label className="form-label">Groups</label>
              <GroupsEditor groups={form.groups} onChange={(v) => set("groups", v)} />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Category Modal ───────────────────────────────────────────────────────

function AddCategoryModal({ allItems, onClose, onSaved }) {
  const [form, setForm] = useState({ label: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.label.trim()) { setError("Label is required"); return; }
    setSaving(true);
    setError("");
    try {
      const key = form.label.trim().toLowerCase().replace(/\s+/g, "-");
      const newItem = {
        key,
        label: form.label.trim(),
        categoryIds: [],
        items: [],
        groups: [],
      };
      const updated = [
        ...allItems.map((it) => ({
          key: makeKey(it.label),
          label: it.label,
          categoryIds: it.categoryIds || [],
          items: it.items || [],
          groups: it.groups || [],
        })),
        newItem,
      ];
      await adminSaveNavMenu(updated);
      onSaved();
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Nav Category</div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && (
            <div style={{ color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Label *</label>
            <input className="form-input" value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="e.g. Accessories" />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function NavMenuAdminSection() {
  const dispatch = useDispatch();
  const reduxNavMenu = useSelector((s) => s.navMenu || []);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    await dispatch(fetchNavMenu());
    setLoading(false);
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setItems(Array.isArray(reduxNavMenu) ? reduxNavMenu : []);
  }, [reduxNavMenu]);

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.label}"? This cannot be undone.`)) return;
    try {
      const updated = items
        .filter((it) => it._id !== item._id)
        .map((it) => ({
          key: makeKey(it.label),
          label: it.label,
          categoryIds: it.categoryIds || [],
          items: it.items || [],
          groups: it.groups || [],
        }));
      await adminSaveNavMenu(updated);
      dispatch(fetchNavMenu());
    } catch (e) {
      setError(e.message || "Failed to delete");
    }
  };

  const subCount = (item) => {
    if (item.items?.length) return `${item.items.length} items`;
    if (item.groups?.length) {
      const total = item.groups.reduce((s, g) => s + (g.items?.length || 0), 0);
      return `${item.groups.length} groups · ${total} items`;
    }
    return "No sub-items";
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <div className="section-title">Nav Menu</div>
          <div className="section-desc">Manage header navigation categories and sub-items</div>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setAddOpen(true)}>
          + Add Category
        </button>
      </div>

      {error && (
        <div style={{ marginBottom: 12, color: "#b91c1c", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 700 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20, color: "var(--muted)", fontWeight: 700, textAlign: "center" }}>
          Loading nav menu…
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Label</th>
                <th>Sub-navigation</th>
                <th>Category IDs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
                    No nav categories yet.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item._id || idx}>
                    <td style={{ fontWeight: 700, color: "#0f172a" }}>{item.label}</td>
                    <td>
                      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                        {subCount(item)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(item.categoryIds || []).length > 0
                          ? item.categoryIds.map((id) => <Tag key={id}>{id}</Tag>)
                          : <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="button"
                          className="action-btn action-edit"
                          title="Edit"
                          onClick={() => setEditing(item)}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="action-btn action-del"
                          title="Delete"
                          onClick={() => deleteItem(item)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditModal
          navItem={editing}
          allItems={items}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {addOpen && (
        <AddCategoryModal
          allItems={items}
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); load(); }}
        />
      )}
    </div>
  );
}
