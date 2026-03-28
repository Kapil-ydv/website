import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  createCatalogProduct,
  deleteCatalogProduct,
  fetchMasterCategories,
  fetchCatalogProductById,
  updateCatalogProduct,
  uploadImagesToCloudinary,
} from "../../redux/actions";

function normalizeHexInput(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";
  const noHash = v.replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(noHash)) return `#${noHash.toUpperCase()}`;
  return v;
}

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
  sizes: [],
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
  const [sizeChartFile, setSizeChartFile] = useState(null);
  const [sizeChartDragOver, setSizeChartDragOver] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const fileUrlCacheRef = useRef(new Map());
  const sizeChartFileInputRef = useRef(null);

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
    sizeChartImage: "",
    sizeChartTitle: "Size chart",
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

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      for (const url of fileUrlCacheRef.current.values()) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
      fileUrlCacheRef.current.clear();
    };
  }, []);

  const getPreviewUrl = (file) => {
    if (!file) return "";
    const key = `${file.name}|${file.size}|${file.lastModified}`;
    const existing = fileUrlCacheRef.current.get(key);
    if (existing) return existing;
    const created = URL.createObjectURL(file);
    fileUrlCacheRef.current.set(key, created);
    return created;
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
              : [],
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
        sizeChartImage: p?.sizeChartImage != null ? String(p.sizeChartImage) : "",
        sizeChartTitle: p?.sizeChartTitle != null ? String(p.sizeChartTitle) : "Size chart",
        variants: loadedVariants,
      });
      setSizeChartFile(null);

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

  const categorySelectTree = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const byOrder = (a, b) =>
      (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
      (Number(a.id) || 0) - (Number(b.id) || 0);
    const isRoot = (c) =>
      c == null || c.parentId == null || c.parentId === undefined;
    const roots = list.filter(isRoot).sort(byOrder);
    const childrenOf = (pid) =>
      list
        .filter((c) => Number(c.parentId) === Number(pid))
        .sort(byOrder);
    return roots.map((r) => ({
      root: r,
      children: childrenOf(r.id ?? r._id),
    }));
  }, [categories]);

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
        i === variantIdx
          ? { ...v, sizes: [...(v.sizes || []), { size: "", stock: 0 }] }
          : v,
      ),
    }));
  };

  const removeSize = (variantIdx, sizeIdx) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx
          ? { ...v, sizes: (v.sizes || []).filter((_, s) => s !== sizeIdx) }
          : v,
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
              sizes: (v.sizes || []).map((s, si) =>
                si === sizeIdx ? { ...s, ...patch } : s,
              ),
            }
          : v,
      ),
    }));
  };

  const removeUploadedImage = (variantIdx, imageUrl) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx
          ? { ...v, images: (v.images || []).filter((u) => u !== imageUrl) }
          : v,
      ),
    }));
    showToast("info", "Image removed from this product (not deleted from Cloudinary)");
  };

  const removePendingFile = (variantIdx, fileKey) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => {
        if (i !== variantIdx) return v;
        const nextFiles = (v.imageFiles || []).filter((f) => {
          const k = `${f?.name}|${f?.size}|${f?.lastModified}`;
          return k !== fileKey;
        });
        return { ...v, imageFiles: nextFiles };
      }),
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
          showToast("error", "Each variant requires color and colorCode");
        } else if (!Array.isArray(invalid.sizes) || invalid.sizes.length === 0) {
          setError("Each variant requires at least one size");
          showToast("error", "Each variant requires at least one size");
        } else {
          setError("Each size requires size value");
          showToast("error", "Each size requires size value");
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
            colorCode: normalizeHexInput(v.colorCode),
            sizes: v.sizes.map((s) => ({
              size: s.size,
              stock: Number(s.stock || 0),
            })),
            images,
          };
        }),
      );

      let sizeChartImage = String(form.sizeChartImage || "").trim();
      if (sizeChartFile) {
        const chartUrls = await uploadImagesToCloudinary([sizeChartFile]);
        if (chartUrls[0]) sizeChartImage = chartUrls[0];
      }

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
        sizeChartImage,
        sizeChartTitle: String(form.sizeChartTitle || "").trim() || "Size chart",
      };

      if (editingProductId) {
        await updateCatalogProduct(editingProductId, payload);
        setSuccess("Product updated successfully");
        showToast("success", "Product updated successfully");
        setSizeChartFile(null);
      } else {
        await createCatalogProduct(payload);
        setSuccess("Product created successfully");
        showToast("success", "Product created successfully");
        setSizeChartFile(null);
        resetToCreateMode();
      }
    } catch (e) {
      setError(editingProductId ? "Failed to update product" : "Failed to create product");
      showToast(
        "error",
        (editingProductId ? "Failed to update product" : "Failed to create product") +
          (e?.message ? `: ${e.message}` : ""),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section">
      {!!toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            zIndex: 9999,
            minWidth: 260,
            maxWidth: 420,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            fontSize: 13,
            color:
              toast.type === "success"
                ? "var(--accent3)"
                : toast.type === "error"
                  ? "var(--accent2)"
                  : "var(--text)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{toast.type}</div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setToast(null)}
              style={{ padding: "4px 8px", height: 28 }}
            >
              Close
            </button>
          </div>
          <div style={{ marginTop: 6, color: "var(--text)" }}>{toast.message}</div>
        </div>
      )}
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
              {categorySelectTree.map(({ root, children }) =>
                children.length === 0 ? (
                  <option key={root.id} value={root.id}>
                    {root.title}
                  </option>
                ) : (
                  <optgroup key={root.id} label={root.title}>
                    <option value={root.id}>{root.title} (parent)</option>
                    {children.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.title}
                      </option>
                    ))}
                  </optgroup>
                ),
              )}
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

        <div
          style={{
            marginTop: 8,
            marginBottom: 8,
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 14,
            background: "var(--surface)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>Size chart (optional)</div>
          <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "var(--muted, #666)", lineHeight: 1.45 }}>
            Upload an image for the size guide. It appears in the store quick view for this product only. Save the product to apply changes.
          </p>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Chart title</label>
            <input
              className="form-input"
              value={form.sizeChartTitle}
              onChange={(e) =>
                setForm((p) => ({ ...p, sizeChartTitle: e.target.value }))
              }
              placeholder="Size chart"
            />
          </div>

          <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
            Chart image
          </label>
          <input
            ref={sizeChartFileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && String(f.type || "").startsWith("image/")) setSizeChartFile(f);
              e.target.value = "";
            }}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                sizeChartFileInputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setSizeChartDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setSizeChartDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget)) setSizeChartDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setSizeChartDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f && String(f.type || "").startsWith("image/")) setSizeChartFile(f);
            }}
            onClick={() => sizeChartFileInputRef.current?.click()}
            style={{
              border: `2px dashed ${sizeChartDragOver ? "#111" : "var(--border)"}`,
              borderRadius: 12,
              padding: "22px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: sizeChartDragOver ? "rgba(0,0,0,0.04)" : "var(--bg, #fafafa)",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <div style={{ fontSize: 13, color: "#444", marginBottom: 10, fontWeight: 500 }}>
              {sizeChartDragOver ? "Drop image here" : "Drag & drop an image here"}
            </div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>or</div>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={(e) => {
                e.stopPropagation();
                sizeChartFileInputRef.current?.click();
              }}
              style={{
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Browse files
            </button>
            <div style={{ marginTop: 12, fontSize: 11.5, color: "#999" }}>
              PNG, JPG, WebP — max depends on your upload limit
            </div>
          </div>

          {(sizeChartFile || form.sizeChartImage) && (
            <div style={{ marginTop: 16 }}>
              {sizeChartFile && (
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--accent3, #15803d)",
                    marginBottom: 10,
                    fontWeight: 600,
                  }}
                >
                  New file: {sizeChartFile.name}
                </div>
              )}
              {!sizeChartFile && form.sizeChartImage && (
                <div style={{ fontSize: 12.5, color: "#666", marginBottom: 10 }}>
                  Current chart is saved. Upload a new image to replace it.
                </div>
              )}
              <div className="form-label" style={{ marginBottom: 6 }}>
                Preview
              </div>
              <img
                src={sizeChartFile ? getPreviewUrl(sizeChartFile) : form.sizeChartImage}
                alt="Size chart preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 220,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  objectFit: "contain",
                  background: "#fff",
                  display: "block",
                }}
              />
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setForm((p) => ({ ...p, sizeChartImage: "" }));
                    setSizeChartFile(null);
                    if (sizeChartFileInputRef.current) sizeChartFileInputRef.current.value = "";
                  }}
                >
                  Remove chart
                </button>
              </div>
            </div>
          )}
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
                      const hex = normalizeHexInput(e.target.value);
                      const suggested = colorNameFromHex(hex);
                      setVariant(idx, {
                        colorCode: hex,
                        ...(suggested
                          ? { color: suggested, colorAuto: true }
                          : { colorAuto: true }),
                      });
                    }}
                    aria-label="Pick color"
                    style={{ padding: 6, height: 42 }}
                  />
                  <input
                    className="form-input"
                    value={v.colorCode}
                    onChange={(e) => {
                      const hex = normalizeHexInput(e.target.value);
                      const suggested = colorNameFromHex(hex);
                      setVariant(idx, {
                        colorCode: hex,
                        ...(suggested
                          ? { color: suggested, colorAuto: true }
                          : { colorAuto: true }),
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
                      showToast("success", `Uploaded ${uploaded.length} image(s)`);
                    } finally {
                      setUploadingVariantIndex(null);
                    }
                  }}
                >
                  {uploadingVariantIndex === idx ? "Uploading..." : "Add image"}
                </button>
              </div>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {!!(v.imageFiles || []).length && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                      Pending uploads: {(v.imageFiles || []).length}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {(v.imageFiles || []).map((f) => {
                        const k = `${f?.name}|${f?.size}|${f?.lastModified}`;
                        return (
                          <div
                            key={k}
                            style={{
                              width: 86,
                              border: "1px solid var(--border)",
                              borderRadius: 10,
                              overflow: "hidden",
                              background: "var(--surface)",
                            }}
                          >
                            <div style={{ width: "100%", height: 64, background: "#111" }}>
                              <img
                                src={getPreviewUrl(f)}
                                alt={f?.name || "Pending upload"}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                            <div style={{ padding: 6, display: "grid", gap: 6 }}>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "var(--muted)",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={f?.name}
                              >
                                {f?.name || "image"}
                              </div>
                              <button
                                type="button"
                                className="btn btn-danger"
                                style={{ padding: "6px 8px", height: 30 }}
                                onClick={() => removePendingFile(idx, k)}
                                disabled={uploadingVariantIndex === idx}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!!(v.images || []).length && (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>
                      Uploaded images: {(v.images || []).length}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {(v.images || []).map((url) => (
                        <div
                          key={url}
                          style={{
                            width: 86,
                            border: "1px solid var(--border)",
                            borderRadius: 10,
                            overflow: "hidden",
                            background: "var(--surface)",
                          }}
                          title={url}
                        >
                          <div style={{ width: "100%", height: 64, background: "#111" }}>
                            <img
                              src={url}
                              alt="Variant"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ padding: 6, display: "grid", gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ padding: "6px 8px", height: 30 }}
                              onClick={() => removeUploadedImage(idx, url)}
                              disabled={saving || uploadingVariantIndex === idx}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                      Note: “Remove” only removes the URL from this product. Deleting from Cloudinary needs backend support (explained below).
                    </div>
                  </div>
                )}
              </div>
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
                  disabled={!Array.isArray(v.sizes) || v.sizes.length === 0}
                >
                  Apply to all
                </button>
              </div>
              {(!Array.isArray(v.sizes) || v.sizes.length === 0) && (
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  No sizes added yet. Click “+ Add Size” to create at least one size.
                </div>
              )}
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
                    disabled={!Array.isArray(v.sizes) || v.sizes.length === 0}
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

