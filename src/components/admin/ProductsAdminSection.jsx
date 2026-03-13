import React, { useState } from "react";

const initialProducts = [
  {
    id: 1,
    name: "Premium Headphones",
    category: "Electronics",
    price: 2499,
    stock: 45,
    status: "Active",
  },
  {
    id: 2,
    name: "Leather Wallet",
    category: "Accessories",
    price: 899,
    stock: 120,
    status: "Active",
  },
  {
    id: 3,
    name: "Running Shoes",
    category: "Footwear",
    price: 3299,
    stock: 0,
    status: "Out of Stock",
  },
];

function ProductsAdminSection() {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    status: "Active",
  });

  const addProduct = () => {
    const newProduct = {
      id: Date.now(),
      ...productForm,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock, 10),
    };
    setProducts((prev) => [...prev, newProduct]);
    setModalOpen(false);
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      status: "Active",
    });
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <div className="section-title">Products</div>
          <div className="section-desc">Manage your product catalog</div>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setModalOpen(true)}
        >
          + Add Product
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
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
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td style={{ color: "var(--muted)" }}>{p.category}</td>
                <td
                  style={{
                    color: "var(--accent3)",
                    fontWeight: 600,
                  }}
                >
                  ₹{p.price?.toLocaleString()}
                </td>
                <td
                  style={{
                    color: p.stock === 0 ? "var(--accent2)" : "var(--text)",
                  }}
                >
                  {p.stock}
                </td>
                <td>
                  <span
                    className={`status-pill ${
                      p.status === "Active" ? "status-active" : "status-oos"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>
                  <button
                    className="action-btn action-del"
                    type="button"
                    onClick={() => deleteProduct(p.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Product</div>
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
                <label className="form-label">Product Name</label>
                <input
                  className="form-input"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Premium Headphones"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="e.g. Electronics, Accessories..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    className="form-input"
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, stock: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={productForm.status}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Out of Stock</option>
                </select>
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
                onClick={addProduct}
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsAdminSection;
