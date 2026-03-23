import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createCheckout,
  fetchCartMongo,
  listAddresses,
  saveAddress,
  deleteAddress,
  validateCoupon,
  estimateShippingRates,
  listAvailableCoupons,
  validateCartStock,
  updateCartQtyMongo,
} from "../redux/actions";
import { getUserId } from "../utils/userId";

function formatINR(n) {
  const num = Number(n || 0);
  if (!isFinite(num)) return "₹0";
  return `₹${num.toFixed(0)}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const userId = getUserId();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [outOfStockInfo, setOutOfStockInfo] = useState(null); // { name?, color?, size? }
  const [items, setItems] = useState([]);

  const [note, setNote] = useState(() => {
    try {
      return localStorage.getItem("aka_cart_note") || "";
    } catch {
      return "";
    }
  });
  const [couponCode, setCouponCode] = useState(() => {
    try {
      return localStorage.getItem("aka_coupon_code") || "";
    } catch {
      return "";
    }
  });
  const [couponStatus, setCouponStatus] = useState(null); // { valid, code, discount }
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLabel, setAddressLabel] = useState("Home");
  const [isDefaultAddress, setIsDefaultAddress] = useState(true);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [shipPreview, setShipPreview] = useState(null); // { shipping, etaDays }
  const [shipLoading, setShipLoading] = useState(false);

  const subtotal = useMemo(() => {
    return (items || []).reduce((sum, it) => {
      const price = Number(it?.price || 0);
      const qty = Number(it?.quantity || 1);
      return sum + (isFinite(price) ? price : 0) * (isFinite(qty) ? qty : 1);
    }, 0);
  }, [items]);

  const discountPreview = Number(couponStatus?.discount || 0);
  const shippingPreview = Number(shipPreview?.shipping || 0);
  const totalPreview = Math.max(0, subtotal + shippingPreview - discountPreview);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchCartMongo(userId)
      .then((res) => {
        if (!mounted) return;
        setItems(Array.isArray(res?.items) ? res.items : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load cart");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    listAvailableCoupons({ userId, limit: 12 })
      .then((res) => {
        if (!mounted) return;
        setAvailableCoupons(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => {
        if (!mounted) return;
        setAvailableCoupons([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Auto-apply saved coupon (if any) once subtotal is known
    if (!couponCode) return;
    if (!subtotal) return;
    validateCoupon({ userId, code: couponCode, subtotal })
      .then((res) => setCouponStatus(res))
      .catch(() => setCouponStatus(null));
  }, [couponCode, subtotal]);

  useEffect(() => {
    let mounted = true;
    setAddrLoading(true);
    setAddrError("");
    listAddresses({ userId })
      .then((res) => {
        if (!mounted) return;
        const list = Array.isArray(res?.items) ? res.items : [];
        setSavedAddresses(list);
        const def = list.find((a) => a?.isDefault) || list[0];
        if (def && def._id) {
          setSelectedAddressId(String(def._id));
          setCustomerName(def.name || "");
          setPhone(def.phone || "");
          setAddress1(def.address1 || "");
          setCity(def.city || "");
          setState(def.state || "");
          setPincode(def.pincode || "");
          setAddressLabel(def.label || "Home");
          setIsDefaultAddress(Boolean(def.isDefault));
        }
      })
      .catch((e) => {
        if (!mounted) return;
        setAddrError(e?.message || "Failed to load addresses");
      })
      .finally(() => {
        if (!mounted) return;
        setAddrLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aka_cart_note", note || "");
    } catch {
      // ignore
    }
  }, [note]);

  useEffect(() => {
    // Keep shipping preview fresh when pincode changes (basic)
    if (!pincode) return;
    setShipLoading(true);
    estimateShippingRates({
      country: "India",
      province: state,
      postalCode: pincode,
      subtotal,
    })
      .then((res) => setShipPreview(res))
      .catch(() => setShipPreview(null))
      .finally(() => setShipLoading(false));
  }, [pincode, state, subtotal]);

  const handleSelectAddress = (id) => {
    const found = savedAddresses.find((a) => String(a?._id) === String(id));
    setSelectedAddressId(String(id || ""));
    if (!found) return;
    setCustomerName(found.name || "");
    setPhone(found.phone || "");
    setAddress1(found.address1 || "");
    setCity(found.city || "");
    setState(found.state || "");
    setPincode(found.pincode || "");
    setAddressLabel(found.label || "Home");
    setIsDefaultAddress(Boolean(found.isDefault));
    setShowAddressForm(false);
  };

  const startNewAddress = () => {
    setSelectedAddressId("");
    setAddressLabel("Home");
    setIsDefaultAddress(savedAddresses.length === 0);
    setCustomerName("");
    setPhone("");
    setAddress1("");
    setCity("");
    setState("");
    setPincode("");
    setShowAddressForm(true);
  };

  const startEditAddress = (id) => {
    handleSelectAddress(id);
    setShowAddressForm(true);
  };

  async function handleSaveAddress() {
    setAddrError("");
    try {
      const res = await saveAddress({
        userId,
        addressId: selectedAddressId || undefined,
        label: addressLabel,
        name: customerName,
        phone,
        address1,
        city,
        state,
        pincode,
        isDefault: isDefaultAddress,
      });
      const saved = res?.item;
      const listRes = await listAddresses({ userId });
      const list = Array.isArray(listRes?.items) ? listRes.items : [];
      setSavedAddresses(list);
      if (saved?._id) setSelectedAddressId(String(saved._id));
      setShowAddressForm(false);
    } catch (e) {
      setAddrError(e?.message || "Failed to save address");
    }
  }

  async function handleDeleteAddress() {
    setAddrError("");
    try {
      if (!selectedAddressId) return;
      await deleteAddress({ userId, addressId: selectedAddressId });
      const listRes = await listAddresses({ userId });
      const list = Array.isArray(listRes?.items) ? listRes.items : [];
      setSavedAddresses(list);
      const def = list.find((a) => a?.isDefault) || list[0];
      if (def && def._id) {
        handleSelectAddress(String(def._id));
      } else {
        setSelectedAddressId("");
        setShowAddressForm(true);
      }
    } catch (e) {
      setAddrError(e?.message || "Failed to delete address");
    }
  }

  async function applyCoupon() {
    setError("");
    setCouponStatus(null);
    try {
      const res = await validateCoupon({ userId, code: couponCode, subtotal });
      setCouponStatus(res);
      try {
        localStorage.setItem("aka_coupon_code", String(res?.code || couponCode || ""));
      } catch {
        // ignore
      }
    } catch (e) {
      setCouponStatus(null);
      setError(e?.message || "Invalid coupon");
    }
  }

  async function placeOrder() {
    setError("");
    setOutOfStockInfo(null);
    try {
      if (!items.length) {
        setError("Your cart is empty.");
        return;
      }

      // Pre-check stock before attempting checkout (better UX)
      try {
        const stockRes = await validateCartStock({ userId });
        const list = Array.isArray(stockRes?.items) ? stockRes.items : [];
        const ok = Boolean(stockRes?.ok);
        if (!ok) {
          // Auto-reduce qty if needed, then block checkout so user can review
          const reducibles = list.filter((r) => r && r.needsQtyReduce && r.cartItemId && r.suggestedQty != null);
          if (reducibles.length) {
            await Promise.all(
              reducibles.map((r) =>
                updateCartQtyMongo({
                  userId,
                  cartItemId: String(r.cartItemId),
                  quantity: Math.max(1, Number(r.suggestedQty) || 1),
                }).catch(() => null),
              ),
            );
            const refreshed = await fetchCartMongo(userId);
            const refreshedItems = Array.isArray(refreshed?.items) ? refreshed.items : [];
            setItems(refreshedItems);
          }

          setError("Some items are out of stock or quantity is too high. Cart updated—please review and try again.");
          return;
        }
      } catch {
        // If validation fails (server down), continue to checkout (server will still enforce)
      }

      const shippingAddress = {
        name: customerName,
        phone,
        address1,
        city,
        state,
        pincode,
      };

      const res = await createCheckout({
        userId,
        paymentMethod,
        note,
        couponCode,
        shippingAddress,
      });

      const orderId = res?.order?._id || res?.orderId;
      navigate(`/order-success${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`);
    } catch (e) {
      const msg = e?.message || "Checkout failed";
      // Backend returns: "Out of stock: ProductName (Color/Size)"
      if (typeof msg === "string" && msg.toLowerCase().startsWith("out of stock:")) {
        const m = msg.match(/^Out of stock:\s*(.*?)\s*\((.*?)\/(.*?)\)\s*$/i);
        if (m) {
          setOutOfStockInfo({
            name: (m[1] || "").trim(),
            color: (m[2] || "").trim(),
            size: (m[3] || "").trim(),
          });
        } else {
          setOutOfStockInfo({ name: "", color: "", size: "" });
        }
      }
      setError(msg);
    }
  }

  return (
    <main style={{ background: "#fff", padding: "28px 16px 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Checkout</h1>
          <Link to="/cart" style={{ color: "#0f172a", textDecoration: "underline", fontWeight: 600 }}>
            Back to cart
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fafafa" }}>
            Loading your cart…
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 0.75fr)", gap: 18, alignItems: "start" }}>
            <section style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, background: "#fff" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#111827" }}>Shipping details</h2>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <label style={labelStyle}>Saved addresses</label>
                  <button type="button" onClick={startNewAddress} style={smallGhostBtn}>
                    + Add new address
                  </button>
                </div>

                {addrLoading ? (
                  <div style={{ padding: 10, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fafafa", color: "#64748b", fontWeight: 800 }}>
                    Loading addresses…
                  </div>
                ) : savedAddresses.length ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginTop: 10 }}>
                    {savedAddresses.map((a) => {
                      const active = String(a?._id) === String(selectedAddressId);
                      return (
                        <button
                          key={a._id}
                          type="button"
                          onClick={() => handleSelectAddress(String(a._id))}
                          style={{
                            textAlign: "left",
                            borderRadius: 14,
                            border: active ? "2px solid #111" : "1px solid #e5e7eb",
                            background: active ? "#fff" : "#fafafa",
                            padding: 12,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 950, color: "#0f172a" }}>{a.label || "Address"}</span>
                                {a.isDefault ? (
                                  <span style={{ fontSize: 12, fontWeight: 900, color: "#166534", background: "#dcfce7", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 999 }}>
                                    Default
                                  </span>
                                ) : null}
                              </div>
                              <div style={{ marginTop: 6, color: "#0f172a", fontWeight: 800, fontSize: 13 }}>
                                {a.name} • {a.phone}
                              </div>
                              <div style={{ marginTop: 4, color: "#64748b", fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
                                {a.address1}
                                <br />
                                {a.city}, {a.state} {a.pincode}
                              </div>
                            </div>
                            <div style={{ display: "grid", gap: 8, flexShrink: 0 }}>
                              <span style={{ width: 18, height: 18, borderRadius: 999, border: active ? "6px solid #111" : "2px solid #cbd5e1", boxSizing: "border-box", marginLeft: "auto" }} />
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditAddress(String(a._id));
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  startEditAddress(String(a._id));
                                }
                              }}
                              style={{ fontWeight: 900, fontSize: 13, color: "#111", textDecoration: "underline" }}
                            >
                              Edit
                            </span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAddressId(String(a._id));
                                handleDeleteAddress();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  setSelectedAddressId(String(a._id));
                                  handleDeleteAddress();
                                }
                              }}
                              style={{ fontWeight: 900, fontSize: 13, color: "#b91c1c", textDecoration: "underline" }}
                            >
                              Delete
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ marginTop: 10, padding: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fafafa", color: "#64748b", fontWeight: 800 }}>
                    No saved addresses yet. Add one to continue.
                  </div>
                )}

                {addrError ? (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 800 }}>
                    {addrError}
                  </div>
                ) : null}
              </div>

              {showAddressForm && (
                <div style={{ marginTop: 14, border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    <div style={{ fontWeight: 950, color: "#0f172a" }}>
                      {selectedAddressId ? "Edit address" : "Add new address"}
                    </div>
                    <button type="button" onClick={() => setShowAddressForm(false)} style={{ ...smallGhostBtn, padding: "10px 12px" }}>
                      Close
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                    <input value={addressLabel} onChange={(e) => setAddressLabel(e.target.value)} placeholder="Label (Home/Office)" style={inputStyle} />
                    <label style={{ ...inlineRowStyle, ...inputStyle, display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
                      <input type="checkbox" checked={isDefaultAddress} onChange={(e) => setIsDefaultAddress(e.target.checked)} />
                      <span style={{ fontWeight: 900, color: "#0f172a" }}>Set as default</span>
                    </label>
                    <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" style={inputStyle} />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={inputStyle} />
                    <input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Address" style={{ ...inputStyle, gridColumn: "1 / -1" }} />
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" style={inputStyle} />
                    <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" style={inputStyle} />
                    <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Pincode" style={inputStyle} />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <button type="button" onClick={handleSaveAddress} style={smallPrimaryBtn}>
                      {selectedAddressId ? "Update address" : "Save address"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAddress}
                      disabled={!selectedAddressId}
                      style={{
                        ...smallGhostBtn,
                        opacity: selectedAddressId ? 1 : 0.5,
                        cursor: selectedAddressId ? "pointer" : "not-allowed",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Note (optional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any instructions…" rows={3} style={textareaStyle} />
              </div>

              <div style={{ marginTop: 12 }}>
                <label style={labelStyle}>Coupon (optional)</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    value={couponCode}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCouponCode(v);
                      try {
                        localStorage.setItem("aka_coupon_code", String(v || ""));
                      } catch {
                        // ignore
                      }
                    }}
                    placeholder="Enter coupon code"
                    style={inputStyle}
                  />
                  <button type="button" onClick={applyCoupon} style={{ ...smallPrimaryBtn, whiteSpace: "nowrap" }}>
                    Apply
                  </button>
                </div>
                {Array.isArray(availableCoupons) && availableCoupons.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
                      Available coupons
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {availableCoupons.map((c) => {
                        const disabled = subtotal < Number(c.minSubtotal || 0);
                        const label =
                          c.type === "percent"
                            ? `${c.code} • ${c.value}% OFF`
                            : `${c.code} • ₹${c.value} OFF`;
                        return (
                          <button
                            key={c._id || c.code}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              const next = String(c.code || "");
                              setCouponCode(next);
                              try {
                                localStorage.setItem("aka_coupon_code", next);
                              } catch {
                                // ignore
                              }
                              // apply immediately for better UX
                              setTimeout(() => applyCoupon(), 0);
                            }}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 999,
                              border: "1px solid #e5e7eb",
                              background: disabled ? "#f1f5f9" : "#fff",
                              color: disabled ? "#94a3b8" : "#0f172a",
                              fontWeight: 900,
                              fontSize: 12,
                              cursor: disabled ? "not-allowed" : "pointer",
                            }}
                            title={disabled ? `Min subtotal ₹${c.minSubtotal} required` : "Click to apply"}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {couponStatus?.valid ? (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 10, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", fontWeight: 800 }}>
                    Coupon <strong>{couponStatus.code}</strong> applied — Discount {formatINR(couponStatus.discount)}
                  </div>
                ) : null}
              </div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 800, color: "#111827" }}>Payment method</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  <label style={radioRowStyle}>
                    <input type="radio" name="pay" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                    <span style={{ fontWeight: 700 }}>Cash on delivery</span>
                    <span style={{ color: "#64748b", fontSize: 13 }}>Pay when delivered</span>
                  </label>
                  <label style={{ ...radioRowStyle, opacity: 0.7 }}>
                    <input type="radio" name="pay" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
                    <span style={{ fontWeight: 700 }}>Online payment</span>
                    <span style={{ color: "#64748b", fontSize: 13 }}>Next step: Razorpay/Stripe keys</span>
                  </label>
                </div>
              </div>

              {error ? (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 600 }}>
                  {error}
                </div>
              ) : null}
            </section>

            <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 18, background: "#fafafa" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: "#111827" }}>Order summary</h2>

              {!items.length ? (
                <div style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #e5e7eb", color: "#64748b", fontWeight: 600 }}>
                  No items in cart.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {items.map((it) => (
                    <div
                      key={it._id || `${it.productId}-${it.variantId}-${it.size}-${it.color}`}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 10,
                        ...(outOfStockInfo &&
                        (outOfStockInfo.name
                          ? String(it?.name || "").toLowerCase() === String(outOfStockInfo.name || "").toLowerCase()
                          : true) &&
                        (outOfStockInfo.color
                          ? String(it?.color || "").toLowerCase() === String(outOfStockInfo.color || "").toLowerCase()
                          : true) &&
                        (outOfStockInfo.size
                          ? String(it?.size || "").toLowerCase() === String(outOfStockInfo.size || "").toLowerCase()
                          : true)
                          ? { borderColor: "#fb7185", background: "#fff1f2" }
                          : {}),
                      }}
                    >
                      <div style={{ width: 54, height: 54, borderRadius: 8, background: "#f1f5f9", overflow: "hidden", flexShrink: 0 }}>
                        {it?.image ? <img src={it.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14, lineHeight: 1.2, marginBottom: 2 }}>
                          {it?.name}
                        </div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>
                          {it?.color ? `Color: ${it.color}` : null}
                          {it?.color && it?.size ? " · " : null}
                          {it?.size ? `Size: ${it.size}` : null}
                          {" · "}
                          Qty: {it?.quantity || 1}
                        </div>
                        {outOfStockInfo &&
                        (outOfStockInfo.name
                          ? String(it?.name || "").toLowerCase() === String(outOfStockInfo.name || "").toLowerCase()
                          : true) &&
                        (outOfStockInfo.color
                          ? String(it?.color || "").toLowerCase() === String(outOfStockInfo.color || "").toLowerCase()
                          : true) &&
                        (outOfStockInfo.size
                          ? String(it?.size || "").toLowerCase() === String(outOfStockInfo.size || "").toLowerCase()
                          : true) ? (
                          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 900, color: "#be123c" }}>
                            Out of stock
                          </div>
                        ) : null}
                      </div>
                      <div style={{ fontWeight: 900, color: "#0f172a" }}>
                        {formatINR(Number(it?.price || 0) * Number(it?.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 900, color: "#0f172a" }}>
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#334155" }}>
                <span>Shipping {shipLoading ? "(…)" : ""}</span>
                <span>{formatINR(shippingPreview)}</span>
              </div>
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#334155" }}>
                <span>Discount</span>
                <span>-{formatINR(discountPreview)}</span>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontWeight: 950, color: "#0f172a" }}>
                <span>Total</span>
                <span>{formatINR(totalPreview)}</span>
              </div>

              <button
                type="button"
                onClick={placeOrder}
                disabled={!items.length}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "14px 16px",
                  border: "none",
                  borderRadius: 10,
                  cursor: items.length ? "pointer" : "not-allowed",
                  background: items.length ? "#111" : "#9ca3af",
                  color: "#fff",
                  fontWeight: 900,
                  letterSpacing: 0.2,
                }}
              >
                {paymentMethod === "online" ? "Pay & Place order" : "Place order"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 12px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  outline: "none",
  background: "#fff",
  fontSize: 14,
  boxSizing: "border-box",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 90,
  resize: "vertical",
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 800,
  color: "#111827",
  marginBottom: 6,
};

const radioRowStyle = {
  display: "grid",
  gridTemplateColumns: "16px auto",
  alignItems: "center",
  gap: 10,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
};

const inlineRowStyle = {
  padding: 0,
};

const smallPrimaryBtn = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "none",
  background: "#111",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const smallGhostBtn = {
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #111",
  background: "#fff",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
};

