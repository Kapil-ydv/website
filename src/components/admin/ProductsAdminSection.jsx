import React, { useEffect, useState } from "react";
import {
  deleteCatalogProduct,
  fetchCatalogProducts,
  updateCatalogProduct,
} from "../../redux/actions";

function ProductsAdminSection({ onEditProduct } = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    discountPrice: "",
    description: "",
    status: "active",
    rating: "0",
    numReviews: "0",
    isFeatured: "no",
  });
  const [deleteSavingId, setDeleteSavingId] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchCatalogProducts({
        page: 1,
        limit: 1000,
      });
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setProducts(items);
    } catch (e) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openEdit = (p) => {
    const id = p?._id || p.id;
    // Route to the full editor so variants/images are editable.
    if (onEditProduct && id) {
      onEditProduct(id);
      return;
    }

    setEditingProduct(p);
    setEditForm({
      name: p?.name ?? "",
      categoryId: p?.categoryId != null ? String(p.categoryId) : "",
      price: p?.price != null ? String(p.price) : "",
      discountPrice: p?.discountPrice != null ? String(p.discountPrice) : "",
      description: p?.description ?? "",
      status: p?.status ?? "active",
      rating: p?.rating != null ? String(p.rating) : "0",
      numReviews: p?.numReviews != null ? String(p.numReviews) : "0",
      isFeatured: p?.isFeatured ? "yes" : "no",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingProduct(null);
  };

  const submitEdit = async () => {
    if (!editingProduct?._id) return;
    setEditSaving(true);
    try {
      const payload = {
        name: editForm.name,
        categoryId: Number(editForm.categoryId),
        price: Number(editForm.price),
        discountPrice:
          editForm.discountPrice === ""
            ? undefined
            : Number(editForm.discountPrice),
        description: editForm.description,
        status: editForm.status,
        rating: Number(editForm.rating || 0),
        numReviews: Number(editForm.numReviews || 0),
        isFeatured: editForm.isFeatured === "yes",
        // Keep variants untouched for now.
        variants: Array.isArray(editingProduct.variants) ? editingProduct.variants : [],
        brand: editingProduct.brand ?? "",
      };

      await updateCatalogProduct(editingProduct._id, payload);
      closeEdit();
      await loadProducts();
    } catch (e) {
      setError(e?.message || "Failed to update product");
    } finally {
      setEditSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this catalog product?");
    if (!ok) return;
    setDeleteSavingId(id);
    setError("");
    try {
      await deleteCatalogProduct(id);
      await loadProducts();
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    } finally {
      setDeleteSavingId(null);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <div className="section-title">Products</div>
          <div className="section-desc">Manage your product catalog</div>
        </div>
      </div>
      <div className="table-wrap">
        {error && (
          <div style={{ marginBottom: 8, fontSize: 13, color: "var(--accent2)" }}>
            {error}
          </div>
        )}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category Id</th>
              <th>Price (₹)</th>
              <th>Variants</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--muted)",
                  }}
                >
                  Loading products...
                </td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: "32px",
                    color: "var(--muted)",
                  }}
                >
                  No products yet
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p._id || p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: "var(--muted)" }}>{p.categoryId}</td>
                <td
                  style={{
                    color: "var(--accent3)",
                    fontWeight: 600,
                  }}
                >
                  ₹{Number(p.price || 0).toLocaleString()}
                </td>
                <td
                  style={{
                    color: "var(--text)",
                  }}
                >
                  {Array.isArray(p.variants) ? p.variants.length : 0}
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      p.status === "active" ? "status-active" : "status-oos"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button
                      className="action-btn action-edit"
                      type="button"
                      onClick={() => openEdit(p)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn action-del"
                      type="button"
                      onClick={() => deleteProduct(p._id || p.id)}
                      disabled={deleteSavingId === (p._id || p.id)}
                      title="Delete product"
                    >
                      {deleteSavingId === (p._id || p.id) ? "…" : "🗑️"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editOpen && editingProduct && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
          role="dialog"
          aria-label="Edit catalog product"
        >
          <div
            className="modal"
            style={{
              width: "min(720px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 18,
              background: "#fff",
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 16 }}>Edit Product</div>
              <button className="btn btn-ghost" type="button" onClick={closeEdit}>
                Close
              </button>
            </div>

            <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category Id *</label>
                  <input className="form-input" value={editForm.categoryId} onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input className="form-input" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price</label>
                  <input className="form-input" value={editForm.discountPrice} onChange={(e) => setEditForm((p) => ({ ...p, discountPrice: e.target.value }))} placeholder="optional" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input className="form-input" value={editForm.rating} onChange={(e) => setEditForm((p) => ({ ...p, rating: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Num Reviews</label>
                  <input className="form-input" value={editForm.numReviews} onChange={(e) => setEditForm((p) => ({ ...p, numReviews: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Featured</label>
                <select className="form-select" value={editForm.isFeatured} onChange={(e) => setEditForm((p) => ({ ...p, isFeatured: e.target.value }))}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div style={{ color: "var(--muted)", fontWeight: 800, fontSize: 13 }}>
                Variants: {Array.isArray(editingProduct.variants) ? editingProduct.variants.length : 0} (not editable here)
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" type="button" onClick={closeEdit}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="button" onClick={submitEdit} disabled={editSaving}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductsAdminSection;
