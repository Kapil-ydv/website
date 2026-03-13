import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSliderSlides, createSliderSlide } from "../../redux/actions";

function SlidesAdminSection() {
  const [slides, setSlides] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [slideForm, setSlideForm] = useState({
    title: "",
    subtitleLine1: "",
    subtitleLine2: "",
    image: "",
    status: "Active",
    order: "",
  });

  const reduxSlides = useSelector((state) => state.slider);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSliderSlides());
  }, [dispatch]);

  // Helper: normalise image URL from different backend shapes
  const getSlideImage = (slide) => {
    // New API: `images` is a direct URL string
    if (typeof slide.images === "string" && slide.images) return slide.images;
    // Older shape: images.desktop.src
    if (slide.images?.desktop?.src) return slide.images.desktop.src;
    // Fallbacks
    if (slide.image) return slide.image;
    return "";
  };

  useEffect(() => {
    if (reduxSlides && reduxSlides.length > 0) {
      setSlides(
        reduxSlides.map((slide) => ({
          id: slide.id || slide._id,
          // backend: title = "New Arrivals" (string), subtitle = ["line1", "line2"]
          title: slide.title || "",
          subtitle: Array.isArray(slide.subtitle)
            ? slide.subtitle
            : [slide.subtitle || "", ""],
          image: getSlideImage(slide),
          status: "Active",
          order: slide.id || slide._id,
        })),
      );
    }
  }, [reduxSlides]);

  const addSlide = async () => {
    try {
      setUploading(true);
      setUploadError("");

      let imageUrl = slideForm.image;

      // If a file was chosen, upload it now (on submit)
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "ecommerce_upload");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dv6jjaeho/image/upload",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();
        if (!data.secure_url && !data.url) {
          throw new Error("No URL returned from server");
        }
        imageUrl = data.secure_url || data.url;
      }
      const payload = {
        title: slideForm.title,
        subtitle: [slideForm.subtitleLine1, slideForm.subtitleLine2],
        imageUrl,
      };

      // Call shared API helper; throws on error.
      const saved = await createSliderSlide(payload);

      const newSlide = {
        id: saved.id,
        title: saved.title,
        subtitle: saved.subtitle,
        image: saved.images?.desktop?.src || imageUrl,
        status: slideForm.status,
        order: saved.id,
      };

      // If API call was successful, update UI and clear form/modal
      setSlides((prev) => [...prev, newSlide]);
      setModalOpen(false);
      setImageFile(null);
      setSlideForm({
        title: "",
        subtitleLine1: "",
        subtitleLine2: "",
        image: "",
        status: "Active",
        order: "",
      });
    } catch (err) {
      setUploadError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const deleteSlide = (id) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Frontend guard: only allow image/* files
    if (!file.type.startsWith("image/")) {
      setUploadError("Only image files are allowed");
      return;
    }

    // Store file for later upload on submit
    setImageFile(file);
    setUploadError("");

    // Optional: show local preview before upload
    const previewUrl = URL.createObjectURL(file);
    setSlideForm((prev) => ({ ...prev, image: previewUrl }));
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <div className="section-title">Banner Slides</div>
          <div className="section-desc">Manage homepage carousel slides</div>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setModalOpen(true)}
        >
          + Add Slide
        </button>
      </div>

      <div className="slides-grid">
        {slides.map((s) => (
          <div className="slide-card" key={s.id}>
            {s.image && (
              <img
                className="slide-img"
                src={s.image}
                alt={
                  s.title ||
                  (Array.isArray(s.subtitle)
                    ? `${s.subtitle[0] || ""} ${s.subtitle[1] || ""}`.trim()
                    : "")
                }
              />
            )}
            <div className="slide-body">
              <div className="slide-title">
                {Array.isArray(s.subtitle) &&
                  (s.subtitle[0] || s.subtitle[1]) && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginBottom: 4,
                      }}
                    >
                      {s.subtitle[0]}
                      <br />
                      {s.subtitle[1]}
                    </div>
                  )}
                <div>{s.title}</div>
              </div>
              <div className="slide-meta">
                <span className="status-pill status-active">{s.status}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="action-btn action-del"
                    type="button"
                    onClick={() => deleteSlide(s.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="slide-order">Order: #{s.order}</div>
            </div>
          </div>
        ))}
        <div className="slide-card add-card" onClick={() => setModalOpen(true)}>
          <div className="add-icon">+</div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Add New Slide</div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Slide</div>
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
                  value={slideForm.title}
                  onChange={(e) =>
                    setSlideForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="e.g. New Arrivals"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle Line 1</label>
                <input
                  className="form-input"
                  value={slideForm.subtitleLine1}
                  onChange={(e) =>
                    setSlideForm((p) => ({
                      ...p,
                      subtitleLine1: e.target.value,
                    }))
                  }
                  placeholder="e.g. New Arrivals"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtitle Line 2</label>
                <input
                  className="form-input"
                  value={slideForm.subtitleLine2}
                  onChange={(e) =>
                    setSlideForm((p) => ({
                      ...p,
                      subtitleLine2: e.target.value,
                    }))
                  }
                  placeholder="e.g. Drop 01"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Image</label>
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
                {uploading && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 6,
                    }}
                  >
                    Uploading image...
                  </div>
                )}
                {uploadError && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--accent2)",
                      marginTop: 6,
                    }}
                  >
                    {uploadError}
                  </div>
                )}
              </div>
              {slideForm.image && (
                <div
                  style={{
                    marginBottom: 16,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={slideForm.image}
                    alt="preview"
                    style={{ width: "100%", height: 140, objectFit: "cover" }}
                    onError={(e) => {
                      // eslint-disable-next-line no-param-reassign
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={slideForm.status}
                    onChange={(e) =>
                      setSlideForm((p) => ({ ...p, status: e.target.value }))
                    }
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    className="form-input"
                    type="number"
                    value={slideForm.order}
                    onChange={(e) =>
                      setSlideForm((p) => ({ ...p, order: e.target.value }))
                    }
                    placeholder="1, 2, 3..."
                  />
                </div>
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
                onClick={addSlide}
              >
                Add Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SlidesAdminSection;
