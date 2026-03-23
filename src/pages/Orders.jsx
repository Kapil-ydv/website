import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders } from "../redux/actions";
import { getUserId } from "../utils/userId";

function formatINR(n) {
  const num = Number(n || 0);
  if (!isFinite(num)) return "₹0";
  return `₹${num.toFixed(0)}`;
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso || "");
  }
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return "green";
  if (s === "cancelled") return "red";
  if (s === "shipped") return "blue";
  return "slate";
}

function paymentTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid") return "green";
  if (s === "failed") return "red";
  if (s === "cod") return "amber";
  return "slate";
}

const toneStyles = {
  slate: { bg: "#f1f5f9", border: "#e2e8f0", text: "#0f172a" },
  green: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
  red: { bg: "#fff1f2", border: "#fecdd3", text: "#9f1239" },
  blue: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  amber: { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
};

export default function Orders() {
  const userId = getUserId();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    listOrders({ userId })
      .then((res) => {
        if (!mounted) return;
        setItems(Array.isArray(res?.items) ? res.items : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load orders");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const empty = useMemo(() => !loading && !items.length, [loading, items]);

  return (
    <main style={{ background: "#fff" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "18px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, color: "#64748b", textTransform: "uppercase" }}>
              Account
            </div>
            <h1 style={{ margin: "2px 0 0", fontSize: 26, fontWeight: 950, color: "#0f172a" }}>Your orders</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{ ...btn, ...btnGhost }}>
              Continue shopping
            </Link>
            <Link to="/cart" style={{ ...btn, ...btnGhost }}>
              View cart
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 16px 90px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ color: "#64748b", fontWeight: 800 }}>
            {loading ? "Loading…" : `${items.length} order${items.length === 1 ? "" : "s"}`}
          </div>
          <button type="button" onClick={() => window.location.reload()} style={{ ...btn, ...btnGhost }}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ ...panel, padding: 18, color: "#64748b", fontWeight: 800 }}>
            Loading your orders…
          </div>
        ) : error ? (
          <div style={{ ...panel, padding: 18, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b", fontWeight: 900 }}>
            {error}
          </div>
        ) : empty ? (
          <div style={{ ...panel, padding: 18, color: "#64748b", fontWeight: 800 }}>
            No orders yet.
            <div style={{ marginTop: 10 }}>
              <Link to="/AllProducts" style={{ ...btn, ...btnPrimary }}>
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {items.map((o) => {
              const status = String(o.status || "created").toUpperCase();
              const pay = String(o.paymentStatus || "pending").toUpperCase();
              const statusStyle = toneStyles[statusTone(o.status)] || toneStyles.slate;
              const payStyle = toneStyles[paymentTone(o.paymentStatus)] || toneStyles.slate;
              const itemCount = Array.isArray(o.items) ? o.items.length : 0;
              const preview = (o.items || []).slice(0, 5);
              return (
                <div key={o._id} style={{ ...panel, padding: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 900, letterSpacing: 0.6 }}>
                        ORDER ID
                      </div>
                      <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 13, wordBreak: "break-all" }}>
                        {o._id}
                      </div>
                      <div style={{ marginTop: 3, color: "#64748b", fontWeight: 800, fontSize: 11 }}>
                        Placed on {formatDate(o.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ ...badge(statusStyle), textTransform: "uppercase" }}>{status}</span>
                      <span style={{ ...badge(payStyle), textTransform: "uppercase" }}>{pay}</span>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 900, letterSpacing: 0.6 }}>
                          TOTAL
                        </div>
                        <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 14 }}>
                          {formatINR(o.total)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                      {o.couponCode ? (
                        <span style={{ marginLeft: 10, fontWeight: 900, color: "#0f172a" }}>
                          Coupon: {o.couponCode}
                        </span>
                      ) : null}
                    </div>
                    <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                      Shipping: {formatINR(o.shipping)} • Discount: {formatINR(o.discount)}
                    </div>
                  </div>

                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {preview.slice(0, 3).map((it, idx) => (
                      <div key={it.cartItemId || `${it.productId}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: "#f1f5f9", overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0 }}>
                          {it?.image ? <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                        </div>
                        <div style={{ minWidth: 0, maxWidth: 180 }}>
                          <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 12, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {it.name}
                          </div>
                          <div style={{ color: "#64748b", fontSize: 11, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            Qty {it.quantity}{it.size ? ` • ${it.size}` : ""}{it.color ? ` • ${it.color}` : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                    {itemCount > 3 ? (
                      <div style={{ padding: "8px 10px", borderRadius: 999, border: "1px dashed #cbd5e1", color: "#64748b", fontWeight: 950, background: "#fafafa", fontSize: 12 }}>
                        +{itemCount - 3} more items
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const panel = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
};

const btn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: 900,
  fontSize: 13,
  border: "1px solid transparent",
  cursor: "pointer",
};

const btnGhost = {
  background: "#fff",
  borderColor: "#e5e7eb",
  color: "#0f172a",
};

const btnPrimary = {
  background: "#111",
  borderColor: "#111",
  color: "#fff",
};

const badge = (tone) => ({
  padding: "4px 8px",
  borderRadius: 999,
  border: `1px solid ${tone.border}`,
  background: tone.bg,
  color: tone.text,
  fontWeight: 950,
  fontSize: 10,
  letterSpacing: 0.6,
});

