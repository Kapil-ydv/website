import React from "react";

function formatINR(n) {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "₹0";
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

export default function AdminOrdersList({
  query,
  onQueryChange,
  loading,
  error,
  items,
  onRowClick,
}) {
  const colSpan = 4;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 16 }}>Orders</div>
        <div style={{ flex: "1 1 280px" }}>
          <input
            value={query}
            onChange={(e) => onQueryChange?.(e.target.value)}
            placeholder="Search by Order ID / User ID"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              background: "#fff",
              fontWeight: 800,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div className="table-wrap">
        {error ? (
          <div
            style={{
              padding: 12,
              borderBottom: "1px solid var(--border)",
              color: "#991b1b",
              fontWeight: 900,
            }}
          >
            {error}
          </div>
        ) : null}

        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>User</th>
              <th>Payment</th>
              <th style={{ textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={colSpan}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    fontWeight: 800,
                    padding: 22,
                  }}
                >
                  Loading orders…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td
                  colSpan={colSpan}
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    fontWeight: 800,
                    padding: 22,
                  }}
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              items.map((o, idx) => (
                <tr
                  key={String(o?._id || idx)}
                  onClick={() => onRowClick?.(o)}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div
                      style={{
                        fontWeight: 950,
                        color: "#0f172a",
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o?._id || "-"}
                    </div>
                    <div style={{ color: "#64748b", fontWeight: 800, fontSize: 12 }}>
                      Placed: {formatDate(o?.createdAt)}
                    </div>
                  </td>
                  <td
                    style={{
                      fontWeight: 900,
                      color: "#334155",
                      wordBreak: "break-all",
                      fontSize: 12,
                    }}
                  >
                    {o?.userId || "-"}
                  </td>
                  <td>
                    <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 12 }}>
                      {String(o?.paymentStatus || "pending").toUpperCase()}
                      <div style={{ color: "#64748b", fontWeight: 800, marginTop: 4 }}>
                        {String(o?.status || "created").toUpperCase()}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 950, color: "#0f172a", fontSize: 13, textAlign: "right" }}>
                    {formatINR(o?.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

