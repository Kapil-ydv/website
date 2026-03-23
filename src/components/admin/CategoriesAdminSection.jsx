import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadImageToCloudinary,
  fetchShopCategories,
  saveShopCategories,
  updateShopCategory,
  deleteShopCategory,
} from "../../redux/actions";

// Separate component to render the categories table
function CategoriesTable({ categories, loading, saving, onDelete, onEdit }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th style={{ color: "#4b5563" }}>Preview</th>
            <th style={{ color: "#4b5563" }}>Title</th>
            <th style={{ color: "#4b5563" }}>Count</th>
            {/* <th style={{ color: "#4b5563" }}>Image URL</th> */}
            <th style={{ color: "#4b5563" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "var(--muted)",
                }}
              >
                Loading categories...
              </td>
            </tr>
          )}
          {!loading && categories.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "var(--muted)",
                }}
              >
                No categories yet
              </td>
            </tr>
          )}
          {!loading &&
            categories.map((c, index) => (
              <tr key={c.id ?? c._id ?? index}>
                <td>
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.title}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  )}
                </td>
                <td style={{ fontWeight: 600 }}>{c.title}</td>
                <td>{c.count}</td>

                <td>
                  <button
                    className="action-btn action-edit"
                    type="button"
                    onClick={() => onEdit(c)}
                    disabled={saving}
                    style={{ marginRight: 8 }}
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn action-del"
                    type="button"
                    onClick={() => onDelete(index)}
                    disabled={saving}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoriesAdminSection() {
  const dispatch = useDispatch();
  const reduxCategories = useSelector((state) => state.shopCategories || []);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    count: "",
    image: "",
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    count: "",
    image: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        await dispatch(fetchShopCategories());
      } catch (e) {
        setError("Unable to load categories");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [dispatch]);

  useEffect(() => {
    setCategories(Array.isArray(reduxCategories) ? reduxCategories : []);
  }, [reduxCategories]);

  const openEdit = (category) => {
    setError("");
    setEditImageFile(null);
    setEditForm({
      id: category?.id ?? null,
      title: category?.title ?? "",
      count: category?.count ?? "",
      image: category?.image ?? "",
    });
    setEditModalOpen(true);
  };

  const saveCategories = async (payload) => {
    try {
      setSaving(true);
      setError("");
      await saveShopCategories(payload);
      // Refresh so the UI gets the backend-generated numeric `id` too.
      await dispatch(fetchShopCategories());
    } catch (e) {
      setError("Failed to save categories");
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    try {
      setError("");
      if (!categoryForm.title) {
        setError("Title is required");
        return;
      }

      let imageUrl = categoryForm.image;

      // If user selected a file, upload to Cloudinary first
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      if (!imageUrl) {
        setError("Image is required");
        return;
      }

      // Send only the single new category; backend appends without replacing
      await saveCategories({
        title: categoryForm.title,
        count: categoryForm.count,
        image: imageUrl,
      });
      setModalOpen(false);
      setImageFile(null);
      setCategoryForm({ title: "", count: "", image: "" });
    } catch (e) {
      setError("Failed to upload image. Please try again.");
    }
  };

  const deleteCategory = async (index) => {
    // index is just UI reference; actual API uses the numeric `id`.
    const category = categories[index];
    if (!category?.id) return;
    try {
      setSaving(true);
      setError("");
      await deleteShopCategory(category.id);
      setEditModalOpen(false);
      setModalOpen(false);
      await dispatch(fetchShopCategories());
    } catch (e) {
      setError("Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async () => {
    try {
      setSaving(true);
      setError("");
      if (!editForm.id) {
        setError("Missing category id");
        return;
      }
      if (!editForm.title) {
        setError("Title is required");
        return;
      }

      let imageUrl = editForm.image;
      if (editImageFile) {
        imageUrl = await uploadImageToCloudinary(editImageFile);
      }
      if (!imageUrl) {
        setError("Image is required");
        return;
      }

      await updateShopCategory({
        id: editForm.id,
        title: editForm.title,
        count: editForm.count,
        image: imageUrl,
      });

      setEditModalOpen(false);
      setEditImageFile(null);
      await dispatch(fetchShopCategories());
    } catch (e) {
      setError("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <div className="section-title">Shop Categories</div>
          <div className="section-desc">
            Manage the data used in the Shop by Categories carousel
          </div>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setModalOpen(true)}
        >
          + Add Category
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            fontSize: 13,
            color: "var(--accent2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Table: shows each category with image preview, title, count and image URL */}
      <CategoriesTable
        categories={categories}
        loading={loading}
        saving={saving}
        onDelete={deleteCategory}
        onEdit={openEdit}
      />

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Category</div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  value={categoryForm.title}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. Knit Wears"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Count</label>
                <input
                  className="form-input"
                  value={categoryForm.count}
                  onChange={(e) =>
                    setCategoryForm((p) => ({ ...p, count: e.target.value }))
                  }
                  placeholder="e.g. 19"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload Image</label>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    if (!file.type.startsWith("image/")) {
                      setError("Only image files are allowed");
                      return;
                    }
                    setImageFile(file);
                    // local preview
                    const previewUrl = URL.createObjectURL(file);
                    setCategoryForm((p) => ({ ...p, image: previewUrl }));
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={addCategory}
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setEditModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Edit Category</div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setEditModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {editForm.image && (
                <img
                  src={editForm.image}
                  alt={editForm.title}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 10,
                    marginBottom: 12,
                  }}
                />
              )}

              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Category title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Count</label>
                <input
                  className="form-input"
                  value={editForm.count}
                  onChange={(e) => setEditForm((p) => ({ ...p, count: e.target.value }))}
                  placeholder="e.g. 19"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload New Image (optional)</label>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    setEditImageFile(file || null);
                  }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={submitEdit}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesAdminSection;
