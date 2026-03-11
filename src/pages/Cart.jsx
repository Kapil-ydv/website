import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import productsData from "../data/productsData";

const FREE_SHIPPING_GOAL = 300;
const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Australia"];
const US_STATES = ["Alabama", "Alaska", "Arizona", "California", "Florida", "Texas", "New York", "Washington", "Other"];
const RECOMMEND_PER_PAGE = 3;

function parsePrice(str) {
  if (!str || typeof str !== "string") return 0;
  const num = parseFloat(str.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

const NoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7.86641 17.2082H4.375C4.20924 17.2082 4.05027 17.1424 3.93306 17.0252C3.81585 16.908 3.75 16.749 3.75 16.5832V13.0918C3.75008 12.9263 3.81582 12.7675 3.93281 12.6504L13.5672 3.01604C13.6844 2.89892 13.8433 2.83313 14.009 2.83313C14.1747 2.83313 14.3336 2.89892 14.4508 3.01604L17.9422 6.50511C18.0593 6.6223 18.1251 6.78121 18.1251 6.9469C18.1251 7.11259 18.0593 7.2715 17.9422 7.3887L8.30781 17.0254C8.19069 17.1424 8.03195 17.2082 7.86641 17.2082Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.25 5.33325L15.625 9.70825" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShippingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.625 6.58325H17.9516C18.0761 6.58319 18.1978 6.62035 18.3011 6.68995C18.4044 6.75955 18.4845 6.85842 18.5312 6.97388L19.625 9.70825" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.125 11.5833H14.625" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.25 17.2083C16.2855 17.2083 17.125 16.3688 17.125 15.3333C17.125 14.2977 16.2855 13.4583 15.25 13.4583C14.2145 13.4583 13.375 14.2977 13.375 15.3333C13.375 16.3688 14.2145 17.2083 15.25 17.2083Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 17.2083C7.53553 17.2083 8.375 16.3688 8.375 15.3333C8.375 14.2977 7.53553 13.4583 6.5 13.4583C5.46447 13.4583 4.625 14.2977 4.625 15.3333C4.625 16.3688 5.46447 17.2083 6.5 17.2083Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14.625 9.70825H19.625V14.7083C19.625 14.874 19.5592 15.033 19.4419 15.1502C19.3247 15.2674 19.1658 15.3333 19 15.3333H17.125" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4.625 15.3333H2.75C2.58424 15.3333 2.42527 15.2674 2.30806 15.1502C2.19085 15.033 2.125 14.874 2.125 14.7083V5.95825C2.125 5.79249 2.19085 5.63352 2.30806 5.51631C2.42527 5.3991 2.58424 5.33325 2.75 5.33325H14.625V13.5653" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CouponIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M7.875 4.70825V15.9583" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.25 13.395C2.25015 13.251 2.29998 13.1115 2.39108 13.0001C2.48218 12.8886 2.60896 12.812 2.75 12.7833C3.31514 12.6685 3.82324 12.3619 4.18819 11.9154C4.55314 11.4689 4.75251 10.9099 4.75251 10.3333C4.75251 9.75657 4.55314 9.19763 4.18819 8.75112C3.82324 8.30462 3.31514 7.99801 2.75 7.88325C2.60896 7.85446 2.48218 7.77787 2.39108 7.66642C2.29998 7.55496 2.25015 7.41548 2.25 7.27153V5.33325C2.25 5.16749 2.31585 5.00852 2.43306 4.89131C2.55027 4.7741 2.70924 4.70825 2.875 4.70825H17.875C18.0408 4.70825 18.1997 4.7741 18.3169 4.89131C18.4342 5.00852 18.5 5.16749 18.5 5.33325V7.27153C18.4998 7.41548 18.45 7.55496 18.3589 7.66642C18.2678 7.77787 18.141 7.85446 18 7.88325C17.4349 7.99801 16.9268 8.30462 16.5618 8.75112C16.1969 9.19763 15.9975 9.75657 15.9975 10.3333C15.9975 10.9099 16.1969 11.4689 16.5618 11.9154C16.9268 12.3619 17.4349 12.6685 18 12.7833C18.141 12.812 18.2678 12.8886 18.3589 13.0001C18.45 13.1115 18.4998 13.251 18.5 13.395V15.3333C18.5 15.499 18.4342 15.658 18.3169 15.7752C18.1997 15.8924 18.0408 15.9583 17.875 15.9583H2.875C2.70924 15.9583 2.55027 15.8924 2.43306 15.7752C2.31585 15.658 2.25 15.499 2.25 15.3333V13.395Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#facc15">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const DiscountBadgeIcon = () => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: "50%", background: "#16a34a", color: "#fff", flexShrink: 0 }}>
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
  </span>
);

const ScrollTopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const BreadcrumbArrow = () => (
  <svg width="12" height="12" fill="currentColor" viewBox="0 0 256 512" style={{ margin: "0 6px", verticalAlign: "middle" }}>
    <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
  </svg>
);

const containerStyle = { maxWidth: 1200, margin: "0 auto", padding: "0 16px" };
const gridCols = "minmax(0, 2fr) minmax(80px, 1fr) minmax(120px, 1fr) minmax(80px, 1fr)";

export default function Cart({ cartItems = [], removeFromCart, updateCartQuantity, addToCart }) {
  const [openAddon, setOpenAddon] = useState("note");
  const [noteText, setNoteText] = useState("");
  const [shippingCountry, setShippingCountry] = useState("United States");
  const [shippingProvince, setShippingProvince] = useState("Alabama");
  const [shippingPostal, setShippingPostal] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [countdown, setCountdown] = useState(4 * 60 + 4);
  const [recommendPage, setRecommendPage] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const products = useMemo(
    () => (Array.isArray(productsData) ? productsData : []),
    []
  );
  const cartVariantIds = useMemo(() => new Set((cartItems || []).map((i) => i.variantId)), [cartItems]);
  const recommendations = useMemo(
    () => products.filter((p) => p.variantId && !cartVariantIds.has(p.variantId)).slice(0, 6),
    [products, cartVariantIds]
  );
  const totalRecPages = Math.max(1, Math.ceil(recommendations.length / RECOMMEND_PER_PAGE));
  const recSlice = recommendations.slice(recommendPage * RECOMMEND_PER_PAGE, (recommendPage + 1) * RECOMMEND_PER_PAGE);

  const subtotal = cartItems.reduce((sum, i) => sum + parsePrice(i.price) * (i.quantity || 1), 0);
  const subtotalStr = `$${subtotal.toFixed(2)}`;
  const needMore = Math.max(0, FREE_SHIPPING_GOAL - subtotal);
  const progressPct = Math.min(100, (subtotal / FREE_SHIPPING_GOAL) * 100);

  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const countdownStr = `${Math.floor(countdown / 60)} m ${countdown % 60} s`;
  const toggleAddon = (key) => setOpenAddon((prev) => (prev === key ? null : key));

  const handleAddRecommendation = (product) => {
    if (!addToCart || !product?.variantId) return;
    const mainImage = product.mainImage?.src || product.mainImage || "";
    addToCart(
      {
        ...product,
        mainImage: typeof mainImage === "string" ? { src: mainImage } : mainImage,
      },
      1
    );
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <main role="main" id="MainContent" style={{ paddingBottom: 80, background: "#fff" }}>
      {/* Page header */}
      <div style={{ padding: "28px 0 20px", textAlign: "center", borderBottom: "1px solid #e5e7eb" }}>
        <div style={containerStyle}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#111" }}>Shopping Cart</h1>
          <nav role="navigation" aria-label="breadcrumbs" style={{ marginTop: 12, fontSize: 14, color: "#64748b" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }} title="Back to the home page">
                Home
              </Link>
              <BreadcrumbArrow />
              <span style={{ color: "#334155", fontWeight: 500 }}>Your Shopping Cart</span>
            </div>
          </nav>

          {/* Promo: countdown + shipping goal + progress bar */}
          {cartItems.length > 0 && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 15, color: "#b91c1c", fontWeight: 500 }}>
                🔥 These products are limited, checkout within <strong>{countdownStr}</strong>
              </p>
              {needMore > 0 && (
                <p style={{ margin: "8px 0 0", fontSize: 15, color: "#334155" }}>
                  Buy <strong>${needMore.toFixed(2)}</strong> more to enjoy FREE Shipping
                </p>
              )}
              <div style={{ marginTop: 10, height: 12, background: "#e5e7eb", borderRadius: 6, overflow: "visible", position: "relative", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: "#facc15", borderRadius: 6, transition: "width 0.3s ease" }} />
                {progressPct > 0 && progressPct < 100 && (
                  <span style={{ position: "absolute", top: "50%", left: `${progressPct}%`, transform: "translate(-50%, -50%)" }}>
                    <StarIcon />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ ...containerStyle, paddingTop: 24 }}>
        <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%" }}>
          {/* Cart table header */}
          {cartItems.length > 0 && (
            <div
              id="MinimogCartHeader"
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: 16,
                padding: "16px 0",
                borderBottom: "1px solid #e5e7eb",
                fontSize: 13,
                fontWeight: 600,
                color: "#64748b",
                alignItems: "center",
              }}
            >
              <div>Product</div>
              <div>Price</div>
              <div>Quantity</div>
              <div style={{ textAlign: "right" }}>Total</div>
            </div>
          )}

          {/* Cart body */}
          <div id="MinimogCartBody" style={{ borderBottom: cartItems.length > 0 ? "1px solid #e5e7eb" : "none" }}>
            {cartItems.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#334155", marginBottom: 12 }}>Your cart is currently empty.</h3>
                <Link to="/" style={{ color: "#0f172a", textDecoration: "underline", fontWeight: 500 }}>
                  Back to shopping
                </Link>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {cartItems.map((item) => (
                  <div
                    key={item.variantId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: gridCols,
                      gap: 16,
                      alignItems: "center",
                      padding: "20px 0",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", background: "#f1f5f9", flexShrink: 0 }}>
                        {item.image && <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>{item.title}</div>
                        {(item.color || item.size) && (
                          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                            {item.color && `Color: ${item.color}`}
                            {item.color && item.size && " · "}
                            {item.size && `Size: ${item.size}`}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart?.(item.variantId)}
                          style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: 0 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, color: "#334155" }}>{item.price}</div>
                    <div>
                      <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden" }}>
                        <button type="button" onClick={() => updateCartQuantity?.(item.variantId, (item.quantity || 1) - 1)} style={{ width: 36, height: 36, border: "none", background: "#f8fafc", cursor: "pointer", fontSize: 16 }} aria-label="Decrease">−</button>
                        <span style={{ minWidth: 40, textAlign: "center", fontSize: 14, fontWeight: 500 }}>{item.quantity || 1}</span>
                        <button type="button" onClick={() => updateCartQuantity?.(item.variantId, (item.quantity || 1) + 1)} style={{ width: 36, height: 36, border: "none", background: "#f8fafc", cursor: "pointer", fontSize: 16 }} aria-label="Increase">+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>
                      ${(parsePrice(item.price) * (item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customers also bought - reference layout: image left, name+price row, dropdown+Add row */}
          {cartItems.length > 0 && recommendations.length > 0 && (
            <div style={{ marginTop: 32, paddingBottom: 28, borderBottom: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: "#111" }}>
                Customers also bought with "{cartItems[0]?.title}"
              </h4>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "#334155", display: "flex", alignItems: "center", gap: 8 }}>
                <DiscountBadgeIcon />
                You will get <strong>10% OFF</strong> on each product
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                {recSlice.map((p) => {
                  const imgSrc = typeof p.mainImage === "string" ? p.mainImage : (p.mainImage?.src || "");
                  const priceStr = p.priceSale || p.priceRegular || p.price;
                  return (
                    <div
                      key={p.variantId}
                      style={{
                        display: "flex",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        overflow: "hidden",
                        padding: 14,
                        background: "#fff",
                        minHeight: 0,
                      }}
                    >
                      <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", background: "#f3f4f6", flexShrink: 0 }}>
                        {imgSrc && <img src={imgSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, marginLeft: 12, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", lineHeight: 1.3 }}>{p.title}</span>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", flexShrink: 0 }}>{priceStr}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                            <select
                              style={{
                                flex: 1,
                                minWidth: 0,
                                padding: "8px 10px",
                                fontSize: 13,
                                border: "1px solid #d1d5db",
                                borderRadius: 6,
                                background: "#fff",
                                color: "#374151",
                              }}
                            >
                              {(p.colorOptions && p.colorOptions.length > 0)
                                ? (p.colorOptions.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  )))
                                : (<option value="">Default</option>)}
                            </select>
                            <button
                              type="button"
                              onClick={() => handleAddRecommendation(p)}
                              style={{
                                padding: "8px 16px",
                                fontSize: 13,
                                fontWeight: 600,
                                background: "#111",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setRecommendPage((p) => Math.max(0, p - 1))}
                  disabled={recommendPage === 0}
                  style={{ width: 34, height: 34, border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: recommendPage === 0 ? "default" : "pointer", opacity: recommendPage === 0 ? 0.5 : 1, fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <span style={{ fontSize: 13, color: "#64748b", minWidth: 32, textAlign: "center" }}>
                  {recommendPage + 1}/{totalRecPages}
                </span>
                <button
                  type="button"
                  onClick={() => setRecommendPage((p) => Math.min(totalRecPages - 1, p + 1))}
                  disabled={recommendPage >= totalRecPages - 1}
                  style={{ width: 34, height: 34, border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", cursor: recommendPage >= totalRecPages - 1 ? "default" : "pointer", opacity: recommendPage >= totalRecPages - 1 ? 0.5 : 1, fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
            </div>
          )}

          {/* Footer: left = checkout (uses empty space), right = addon panel (Note / Shipping / Coupon) */}
          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-start", flexWrap: "wrap", gap: 24, width: "100%" }}>
            {/* Left: tabs + subtotal + payment buttons - sits in the empty space */}
            <div style={{ flex: "1 1 320px", maxWidth: 420, minWidth: 280, background: "#fafafa", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {[
                  { key: "note", label: "Note", Icon: NoteIcon },
                  { key: "shipping", label: "Shipping", Icon: ShippingIcon },
                  { key: "coupon", label: "Coupon", Icon: CouponIcon },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAddon(key)}
                    aria-pressed={openAddon === key}
                    aria-label={key === "note" ? "Add note for seller" : key === "shipping" ? "Estimate shipping" : "Add discount code"}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "12px 18px",
                      minWidth: 68,
                      border: openAddon === key ? "2px solid #111" : "1px solid #d1d5db",
                      borderRadius: 8,
                      background: openAddon === key ? "#fff" : "#f1f5f9",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      color: openAddon === key ? "#111" : "#475569",
                      boxShadow: openAddon === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >
                    <Icon />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Subtotal</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>{subtotalStr}</span>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px" }}>Taxes and shipping calculated at checkout</p>
              <button type="submit" name="checkout" style={{ width: "100%", padding: "15px 20px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 14 }} aria-label="Proceed to checkout">
                CHECK OUT
              </button>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 10px", textAlign: "center" }}>or pay with</p>
              <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                <button type="button" aria-label="Check out with Shop Pay" style={{ flex: 1, minWidth: 0, padding: "12px 16px", background: "#5a31f4", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700 }}>shop</span> Pay
                </button>
                <button type="button" aria-label="Check out with Google Pay" style={{ flex: 1, minWidth: 0, padding: "12px 16px", background: "#000", color: "#fff", border: "none", borderRadius: 8, fontWeight: 500, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  G Pay
                </button>
              </div>
            </div>

            {/* Right: Add note for seller / Shipping / Coupon panel - uses space next to checkout */}
            {openAddon && (
              <div style={{ flex: "1 1 280px", maxWidth: 380, minWidth: 260, background: "#fafafa", borderRadius: 12, padding: 24, border: "1px solid #e5e7eb", alignSelf: "flex-start" }}>
                {openAddon === "note" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 15, fontWeight: 600, color: "#111" }}>
                      <NoteIcon />
                      Add note for seller
                    </div>
                    <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Special instructions for seller" rows={4} aria-label="Special instructions for seller" style={{ width: "100%", padding: 14, fontSize: 14, border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", minHeight: 100 }} />
                    <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "1px solid #334155", borderRadius: 8, background: "#fff", color: "#334155", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "none", borderRadius: 8, background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Save</button>
                    </div>
                  </>
                )}
                {openAddon === "shipping" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 15, fontWeight: 600, color: "#111" }}>
                      <ShippingIcon />
                      Estimate shipping rates
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Country</label>
                      <select value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} aria-label="Country" style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box", background: "#fff" }}>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Province</label>
                      <select value={shippingProvince} onChange={(e) => setShippingProvince(e.target.value)} aria-label="Province" style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box", background: "#fff" }}>{US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>Postal/Zip Code</label>
                      <input type="text" value={shippingPostal} onChange={(e) => setShippingPostal(e.target.value)} placeholder="e.g. 12345" aria-label="Postal or Zip code" style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid #cbd5e1", borderRadius: 8, boxSizing: "border-box", background: "#fff" }} />
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "1px solid #334155", borderRadius: 8, background: "#fff", color: "#334155", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "none", borderRadius: 8, background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Calculate</button>
                    </div>
                  </>
                )}
                {openAddon === "coupon" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 15, fontWeight: 600, color: "#111" }}>
                      <CouponIcon />
                      Add a discount code
                    </div>
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter discount or gift card code" aria-label="Discount code" style={{ width: "100%", padding: "14px", fontSize: 14, border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 16, boxSizing: "border-box", background: "#fff" }} />
                    <div style={{ display: "flex", gap: 12 }}>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "1px solid #334155", borderRadius: 8, background: "#fff", color: "#334155", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                      <button type="button" onClick={() => setOpenAddon(null)} style={{ flex: 1, padding: "12px 20px", border: "none", borderRadius: 8, background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Apply</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Scroll to top - bottom right */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
          }}
        >
          <ScrollTopIcon />
        </button>
      )}
    </main>
  );
}
