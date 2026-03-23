import React, { useEffect, useMemo, useState } from "react";
import {
  createCatalogProduct,
  deleteCatalogProduct,
  fetchMasterCategories,
  fetchCatalogProductById,
  updateCatalogProduct,
  uploadImagesToCloudinary,
} from "../../redux/actions";

function hexToRgb(hex) {
  const clean = String(hex || "")
    .trim()
    .replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return { r, g, b };
}

function rgbDistance(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

// Best-effort color name for a hex code (approx)
function colorNameFromHex(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "";

  const palette = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Gray", hex: "#808080" },
    { name: "Red", hex: "#FF0000" },
    { name: "Green", hex: "#00FF00" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Cyan", hex: "#00FFFF" },
    { name: "Magenta", hex: "#FF00FF" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Purple", hex: "#800080" },
    { name: "Brown", hex: "#8B4513" },
    { name: "Navy", hex: "#000080" },
    { name: "Teal", hex: "#008080" },
    { name: "Olive", hex: "#808000" },
  ];

  let best = { name: "", dist: Number.POSITIVE_INFINITY };
  for (const p of palette) {
    const prgb = hexToRgb(p.hex);
    const dist = rgbDistance(rgb, prgb);
    if (dist < best.dist) best = { name: p.name, dist };
  }
  return best.name;
}

const emptyVariant = () => ({
  color: "",
  colorCode: "",
  sizes: [{ size: "", stock: 0 }],
  images: [],
  imageFiles: [],
  stockAll: "",
  colorAuto: true,
});

export default function CatalogProductAdminSection({
  initialProductIdToEdit = null,
  onEditCancel,
} = {}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState(null);

  const [editingProductId, setEditingProductId] = useState(null);
  const [productIdToEdit, setProductIdToEdit] = useState("");
  const [loadingExisting, setLoadingExisting] = useState(false);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    description: "",
    categoryId: "",
    rating: 0,
    numReviews: 0,
    isFeatured: false,
    status: "active",
    variants: [emptyVariant()],
  });

  const resetToCreateMode = () => {
    setEditingProductId(null);
    setProductIdToEdit("");
    setForm({
      name: "",
      price: "",
      discountPrice: "",
      description: "",
      categoryId: "",
      rating: 0,
      numReviews: 0,
      isFeatured: false,
      status: "active",
      variants: [emptyVariant()],
    });
    onEditCancel?.();
  };

  const loadForEdit = async (idOverride) => {
    const id = String((idOverride ?? productIdToEdit) || "").trim();
    if (!id) return;
    setProductIdToEdit(id);
    setLoadingExisting(true);
    setError("");
    setSuccess("");
    try {
      const p = await fetchCatalogProductById(id);
      const loadedVariants = Array.isArray(p?.variants) && p.variants.length
        ? p.variants.map((v) => ({
            color: v?.color ?? "",
            colorCode: v?.colorCode ?? "#000000",
            sizes: Array.isArray(v?.sizes) && v.sizes.length
              ? v.sizes.map((s) => ({ size: s?.size ?? "", stock: Number(s?.stock ?? 0) }))
              : [{ size: "", stock: 0 }],
            images: Array.isArray(v?.images) ? v.images : [],
            imageFiles: [],
            stockAll: "",
            colorAuto: false,
          }))
        : [emptyVariant()];

      setForm({
        name: p?.name ?? "",
        price: p?.price != null ? String(p.price) : "",
        discountPrice: p?.discountPrice != null ? String(p.discountPrice) : "",
        description: p?.description ?? "",
        categoryId: p?.categoryId != null ? String(p.categoryId) : "",
        rating: p?.rating != null ? Number(p.rating) : 0,
        numReviews: p?.numReviews != null ? Number(p.numReviews) : 0,
        isFeatured: Boolean(p?.isFeatured),
        status: p?.status ?? "active",
        variants: loadedVariants,
      });

      setEditingProductId(String(p?._id || id));
      setSuccess("Product loaded for update");
    } catch (e) {
      setError(e?.message || "Failed to load product");
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    if (!initialProductIdToEdit) return;
    const id = String(initialProductIdToEdit).trim();
    if (!id) return;
    if (editingProductId && String(editingProductId) === id) return;
    loadForEdit(id);
  }, [initialProductIdToEdit]); // Intentionally not including loadForEdit to avoid re-loading on every render.

  const deleteEditingProduct = async () => {
    if (!editingProductId) return;
    const ok = window.confirm("Delete this catalog product?");
    if (!ok) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await deleteCatalogProduct(editingProductId);
      setSuccess("Product deleted");
      resetToCreateMode();
    } catch (e) {
      setError(e?.message || "Failed to delete product");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMasterCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        setCategories([]);
      }
    };
    load();
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id ?? c._id, label: c.title })),
    [categories],
  );

  const setVariant = (idx, patch) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));
  };

  const setVariantSizes = (variantIdx, sizes) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx ? { ...v, sizes } : v,
      ),
    }));
  };

  const addCommonSizes = (variantIdx, labels) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIdx) return v;
        const existing = new Set((v.sizes || []).map((s) => s.size));
        const nextSizes = [...(v.sizes || [])];
        for (const size of labels) {
          if (!existing.has(size)) nextSizes.push({ size, stock: 0 });
        }
        return { ...v, sizes: nextSizes };
      }),
    }));
  };

  const applyStockToAllSizes = (variantIdx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIdx) return v;
        const stock = Number(v.stockAll || 0);
        return {
          ...v,
          sizes: (v.sizes || []).map((s) => ({ ...s, stock })),
        };
      }),
    }));
  };

  const addVariant = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };

  const removeVariant = (idx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx),
    }));
  };

  const addSize = (variantIdx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx ? { ...v, sizes: [...v.sizes, { size: "", stock: 0 }] } : v,
      ),
    }));
  };

  const removeSize = (variantIdx, sizeIdx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx ? { ...v, sizes: v.sizes.filter((_, s) => s !== sizeIdx) } : v,
      ),
    }));
  };

  const setSize = (variantIdx, sizeIdx, patch) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx
          ? {
              ...v,
              sizes: v.sizes.map((s, si) => (si === sizeIdx ? { ...s, ...patch } : s)),
            }
          : v,
      ),
    }));
  };

  const onSubmit = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const required = [
        ["name", form.name],
        ["price", form.price],
        ["description", form.description],
        ["categoryId", form.categoryId],
      ];
      const missing = required.find(([, v]) => !String(v || "").trim());
      if (missing) {
        setError(`${missing[0]} is required`);
        return;
      }

      if (!Array.isArray(form.variants) || form.variants.length === 0) {
        setError("At least one variant is required");
        return;
      }

      // Upload variant images (parallel per-variant)
      const variantsInput = form.variants;

      const invalid = variantsInput.find((v) => {
        if (!v.color || !v.colorCode) return true;
        if (!Array.isArray(v.sizes) || v.sizes.length === 0) return true;
        return v.sizes.some((s) => !s.size);
      });
      if (invalid) {
        if (!invalid.color || !invalid.colorCode) {
          setError("Each variant requires color and colorCode");
        } else if (!Array.isArray(invalid.sizes) || invalid.sizes.length === 0) {
          setError("Each variant requires at least one size");
        } else {
          setError("Each size requires size value");
        }
        return;
      }

      const preparedVariants = await Promise.all(
        variantsInput.map(async (v) => {
          const uploaded =
            v.imageFiles && v.imageFiles.length > 0
              ? await uploadImagesToCloudinary(v.imageFiles)
              : [];

          const images = [...(v.images || []), ...uploaded];
          if (!images.length) {
            throw new Error("Each variant requires at least one image");
          }

          return {
            color: v.color,
            colorCode: v.colorCode,
            sizes: v.sizes.map((s) => ({
              size: s.size,
              stock: Number(s.stock || 0),
            })),
            images,
          };
        }),
      );
      const payload = {
        name: form.name,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        description: form.description,
        categoryId: Number(form.categoryId),
        variants: preparedVariants,
        rating: Number(form.rating || 0),
        numReviews: Number(form.numReviews || 0),
        isFeatured: Boolean(form.isFeatured),
        status: form.status,
      };

      if (editingProductId) {
        await updateCatalogProduct(editingProductId, payload);
        setSuccess("Product updated successfully");
      } else {
        await createCatalogProduct(payload);
        setSuccess("Product created successfully");
        resetToCreateMode();
      }
    } catch (e) {
      setError(editingProductId ? "Failed to update product" : "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section">
      <style>{`
        .compact-form .form-group { margin-bottom: 10px; }
        .compact-form .form-row { gap: 10px; }
        .compact-form .form-label { margin-bottom: 4px; }
        .compact-form .form-input,
        .compact-form .form-select,
        .compact-form .form-textarea { padding: 9px 12px; }
        .compact-form .form-textarea { min-height: 70px; }
      `}</style>
      <div className="section-header">
        <div>
          <div className="section-title">{editingProductId ? "Update Product" : "Add Product"}</div>
          <div className="section-desc">Create catalog product with variants</div>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 12, fontSize: 13, color: "var(--accent2)" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginBottom: 12, fontSize: 13, color: "var(--accent3)" }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
        {/* <div style={{ flex: "1 1 280px" }}>
          <label className="form-label">Product ID (for edit)</label>
          <input
            className="form-input"
            value={productIdToEdit}
            onChange={(e) => setProductIdToEdit(e.target.value)}
            placeholder="e.g. 65f... (Mongo _id)"
          />
        </div>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={loadForEdit}
          disabled={!productIdToEdit || saving || loadingExisting}
        >
          {loadingExisting ? "Loading..." : "Load for Edit"}
        </button> */}
        {editingProductId && (
          <>
            <button
              className="btn btn-danger"
              type="button"
              onClick={deleteEditingProduct}
              disabled={saving || loadingExisting}
            >
              Delete
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={resetToCreateMode}
              disabled={saving || loadingExisting}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="table-wrap compact-form" style={{ padding: 12 }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={form.categoryId}
              onChange={(e) =>
                setForm((p) => ({ ...p, categoryId: e.target.value }))
              }
            >
              <option value="">Select...</option>
              {categoryOptions.map((o) => (
                <option key={String(o.value)} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Price *</label>
            <input
              className="form-input"
              type="number"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Discount Price</label>
            <input
              className="form-input"
              type="number"
              value={form.discountPrice}
              onChange={(e) =>
                setForm((p) => ({ ...p, discountPrice: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description *</label>
          <textarea
            className="form-textarea"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Rating</label>
            <input
              className="form-input"
              type="number"
              step="0.1"
              value={form.rating}
              onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Num Reviews</label>
            <input
              className="form-input"
              type="number"
              value={form.numReviews}
              onChange={(e) =>
                setForm((p) => ({ ...p, numReviews: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Featured</label>
            <select
              className="form-select"
              value={form.isFeatured ? "yes" : "no"}
              onChange={(e) =>
                setForm((p) => ({ ...p, isFeatured: e.target.value === "yes" }))
              }
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 18, marginBottom: 8, fontWeight: 700 }}>
          Variants *
        </div>

        {form.variants.map((v, idx) => (
          <div
            key={idx}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              background: "var(--surface)",
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Color *</label>
                <input
                  className="form-input"
                  value={v.color}
                  onChange={(e) =>
                    setVariant(idx, { color: e.target.value, colorAuto: false })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Color Code *</label>
                <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: 10 }}>
                  <input
                    className="form-input"
                    type="color"
                    value={v.colorCode || "#000000"}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const suggested = colorNameFromHex(hex);
                      setVariant(idx, {
                        colorCode: hex,
                        ...(v.colorAuto || !v.color
                          ? { color: suggested, colorAuto: true }
                          : {}),
                      });
                    }}
                    aria-label="Pick color"
                    style={{ padding: 6, height: 42 }}
                  />
                  <input
                    className="form-input"
                    value={v.colorCode}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const suggested = colorNameFromHex(hex);
                      setVariant(idx, {
                        colorCode: hex,
                        ...(v.colorAuto || !v.color
                          ? { color: suggested, colorAuto: true }
                          : {}),
                      });
                    }}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Variant Images *</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm((prev) => ({
                      ...prev,
                      variants: prev.variants.map((v2, i2) =>
                        i2 === idx
                          ? {
                              ...v2,
                              imageFiles: [
                                ...(v2.imageFiles || []),
                                ...files,
                              ],
                            }
                          : v2,
                      ),
                    }));
                  }}
                />
                <button
                  type="button"
                  className="btn"
                  style={{
                    background:
                      "linear-gradient(90deg, #ff7a18 0%, #ffb347 50%, #ff7a18 100%)",
                    color: "#fff",
                    border: "none",
                    fontWeight: 600,
                    padding: "8px 16px",
                    boxShadow: "0 0 10px rgba(255, 122, 24, 0.6)",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    cursor: "pointer",
                  }}
                  disabled={
                    uploadingVariantIndex === idx ||
                    !v.imageFiles ||
                    v.imageFiles.length === 0
                  }
                  onClick={async () => {
                    try {
                      if (!v.imageFiles || v.imageFiles.length === 0) return;
                      setUploadingVariantIndex(idx);
                      const uploaded = await uploadImagesToCloudinary(v.imageFiles);
                      setForm((prev) => ({
                        ...prev,
                        variants: prev.variants.map((v2, i2) =>
                          i2 === idx
                            ? {
                                ...v2,
                                images: [...(v2.images || []), ...uploaded],
                                imageFiles: [],
                              }
                            : v2,
                        ),
                      }));
                    } finally {
                      setUploadingVariantIndex(null);
                    }
                  }}
                >
                  {uploadingVariantIndex === idx ? "Uploading..." : "Add image"}
                </button>
              </div>
              {!!(v.images || []).length && (
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)" }}>
                  Existing image URLs: {(v.images || []).length}
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 700 }}>Sizes *</div>
              <button className="btn btn-ghost" type="button" onClick={() => addSize(idx)}>
                + Add Size
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => addCommonSizes(idx, ["S", "M", "L", "XL"])}
              >
                + S M L XL
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => addCommonSizes(idx, ["XS", "S", "M", "L", "XL", "XXL"])}
              >
                + XS..XXL
              </button>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "end",
                }}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Stock for all sizes</label>
                  <input
                    className="form-input"
                    type="number"
                    value={v.stockAll}
                    onChange={(e) => setVariant(idx, { stockAll: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>
                <button
                  className="btn btn-success"
                  type="button"
                  onClick={() => applyStockToAllSizes(idx)}
                  style={{ height: 38 }}
                >
                  Apply to all
                </button>
              </div>
              {v.sizes.map((s, si) => (
                <div
                  key={si}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto",
                    gap: 10,
                    alignItems: "end",
                  }}
                >
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Size *</label>
                    <input
                      className="form-input"
                      value={s.size}
                      onChange={(e) => setSize(idx, si, { size: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Stock *</label>
                    <input
                      className="form-input"
                      type="number"
                      value={s.stock}
                      onChange={(e) =>
                        setSize(idx, si, { stock: e.target.value })
                      }
                    />
                  </div>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => removeSize(idx, si)}
                    disabled={v.sizes.length === 1}
                    style={{ height: 38 }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <div />
              <button
                className="btn btn-danger"
                type="button"
                onClick={() => removeVariant(idx)}
                disabled={form.variants.length === 1}
              >
                Remove Variant
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button className="btn btn-ghost" type="button" onClick={addVariant}>
            + Add Variant
          </button>
          <button className="btn btn-primary" type="button" onClick={onSubmit} disabled={saving}>
            {saving ? "Saving..." : editingProductId ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

