import React, { useState, useEffect } from "react";
import {
  addToCartMongo,
  addToWishlistMongo,
  fetchWishlistList,
  removeWishlistMongo,
} from "../redux/actions";
import { getUserId } from "../utils/userId";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * Pure React Quick View modal. No server fetch, no HTML content, no DOM interception.
 * Props: isOpen, product (full product from productsData), onClose, onAddToCart.
 */
const QuickViewModal = ({ isOpen, product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const userId = getUserId();
  const navigate = useNavigate();

  const token = (() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  })();
  const isLoggedIn = Boolean(token);

  const norm = (v) => String(v ?? "").trim().toLowerCase();

  useEffect(() => {
    const updateMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobileView(window.innerWidth < 768);
    };
    updateMobile();
    window.addEventListener("resize", updateMobile);
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    setImageIndex(0);
    setShowFullDescription(false);
    if (product.colorOptions?.length) {
      const first = product.colorOptions[0];
      setSelectedColor(first?.label ?? first?.value);
    } else {
      setSelectedColor(null);
    }
    if (product.sizeOptions?.length) {
      setSelectedSize(product.sizeOptions[0].value);
    } else {
      setSelectedSize(null);
    }
    setShowSizeChart(false);
  }, [product]);

  const resolveProductId = (p) =>
    String(p?.productId ?? p?._id ?? p?.id ?? p?.handle ?? "");

  const toPriceNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const s = String(v);
    const m = s.match(/-?\d+(\.\d+)?/);
    const n = m ? Number(m[0]) : NaN;
    return Number.isFinite(n) ? n : 0;
  };

  // Wishlist state for this product (loaded when modal opens)
  useEffect(() => {
    let mounted = true;
    if (!isOpen || !product) return undefined;

    // Prevent wishlist fetches for guests; require login first.
    if (!isLoggedIn) {
      setIsWishlisted(false);
      setWishlistLoading(false);
      return undefined;
    }

    const pid = resolveProductId(product);
    if (!pid) return undefined;

    setWishlistLoading(true);
    fetchWishlistList(userId)
      .then((res) => {
        if (!mounted) return;
        const items = Array.isArray(res?.items) ? res.items : [];
        const ids = new Set(items.map((it) => String(it.productId)));
        setIsWishlisted(ids.has(pid));
      })
      .catch(() => {
        if (!mounted) return;
        setIsWishlisted(false);
      })
      .finally(() => {
        if (!mounted) return;
        setWishlistLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, product, userId, isLoggedIn]);

  const toggleWishlist = async () => {
    if (!product) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const productId = resolveProductId(product);
    if (!productId) return;

    const wasIn = isWishlisted;
    setIsWishlisted(!wasIn);
    setWishlistLoading(true);

    try {
      if (wasIn) {
        await removeWishlistMongo({ userId, productId });
      } else {
        const name = product?.title || product?.name || "Product";
        const slug = product?.handle || product?.slug || "";
        const price = toPriceNumber(product?.priceSale || product?.priceRegular || product?.price);
        const image = product?.mainImage?.src || product?.imageSrc || product?.image || "";
        await addToWishlistMongo({ userId, productId, name, slug, price, image });
      }
    } catch {
      // revert
      setIsWishlisted(wasIn);
    } finally {
      setWishlistLoading(false);
    }
  };

  // When color changes on a catalog product, default size to that variant's first size
  useEffect(() => {
    if (!product) return;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    if (!variants.length) return;
    const first = product.colorOptions?.[0];
    const color = selectedColor || (first?.label ?? first?.value ?? null);
    const colorStr = String(color ?? "");
    const v =
      variants.find((vv) => vv && norm(vv.color) === norm(colorStr)) ||
      variants[0];
    if (v && Array.isArray(v.sizes) && v.sizes.length) {
      const firstInStock =
        v.sizes.find((s) => {
          const st = Number(s?.stock ?? 0);
          const sz = s?.size ?? s;
          return sz != null && String(sz) !== "" && st > 0;
        }) || v.sizes[0];
      const firstSize = firstInStock?.size ?? firstInStock;
      if (firstSize != null) {
        setSelectedSize(String(firstSize));
      }
    }

    // When color changes, start carousel from first image
    setImageIndex(0);
  }, [product, selectedColor]);

  // Derive active variant based on selected color when catalog variants are present
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const firstOpt = product?.colorOptions?.[0];
  const resolvedColor = selectedColor || (firstOpt?.label ?? firstOpt?.value ?? null);
  const resolvedColorStr = String(resolvedColor ?? "");
  const activeVariant =
    variants.find((v) => v && norm(v.color) === norm(resolvedColorStr)) ||
    (variants.length ? variants[0] : null);

  // If active variant changes, reset carousel index
  useEffect(() => {
    setImageIndex(0);
  }, [resolvedColorStr]);

  const mainSrc = product?.mainImage?.src || product?.imageSrc || "";
  const hoverSrc = product?.hoverImage?.src || "";

  const fromData = Array.isArray(activeVariant?.images) && activeVariant.images.length
    ? activeVariant.images
    : product?.images?.length
      ? product.images
      : [...new Set([mainSrc, hoverSrc].filter(Boolean))];

  const images =
    Array.isArray(fromData) && fromData.length ? fromData : mainSrc ? [mainSrc] : [];
  const currentImage = images[imageIndex] ?? images[0] ?? mainSrc;
  const price = product?.priceSale || product?.priceRegular || product?.price || "";
  const hasMultipleImages = images.length > 1;

  const selectedStock = (() => {
    if (!activeVariant || !Array.isArray(activeVariant.sizes) || !selectedSize) return null;
    const found = activeVariant.sizes.find((s) => String(s?.size ?? s) === String(selectedSize));
    if (!found || typeof found !== "object") return null;
    const st = Number(found.stock);
    return Number.isFinite(st) ? st : null;
  })();
  const isOutOfStock = selectedStock != null ? selectedStock <= 0 : false;
  const maxQty = selectedStock != null ? Math.max(0, selectedStock) : null;

  // Clamp quantity when stock changes / size changes
  useEffect(() => {
    if (maxQty == null) return;
    setQuantity((q) => {
      const next = Math.max(1, Number(q) || 1);
      return Math.min(next, Math.max(1, maxQty));
    });
  }, [maxQty]);

  if (!isOpen || !product) return null;

  const sizeChartSrc = String(product?.sizeChartImage || "").trim();
  const sizeChartLabel =
    String(product?.sizeChartTitle || "").trim() || "Size chart";

  const goPrev = () => setImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  const goNext = () => setImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      onClose?.();
      return;
    }

    if (isOutOfStock) return;
    if (maxQty != null && quantity > maxQty) {
      setQuantity(Math.max(1, maxQty));
      return;
    }
    const rawPid = product.productId ?? product.id ?? product._id;
    const pidForVariant =
      rawPid != null && rawPid !== "" ? String(rawPid).trim() : "";

    const trimmedVariantId =
      product.variantId != null && product.variantId !== ""
        ? String(product.variantId).trim()
        : "";
    const activeVariantIdStr =
      activeVariant?._id != null && activeVariant._id !== ""
        ? String(activeVariant._id).trim()
        : "";

    let effectiveVariantId = "";
    if (trimmedVariantId) {
      effectiveVariantId = trimmedVariantId;
    } else if (activeVariantIdStr) {
      effectiveVariantId = activeVariantIdStr;
    } else if (pidForVariant) {
      effectiveVariantId = `qv-${pidForVariant}-${String(resolvedColor || "c")}-${String(selectedSize || "s")}`;
    }
    if (!effectiveVariantId && pidForVariant) {
      effectiveVariantId = `${pidForVariant}-v1`;
    }

    const cartProduct = {
      productId: pidForVariant,
      variantId: effectiveVariantId,
      title: product.title,
      priceSale: product.priceSale || price,
      priceRegular: product.priceRegular || price,
      mainImage: product.mainImage || { src: mainSrc },
      // include variant selection + stock cap for legacy/in-memory cart
      color: resolvedColor || null,
      size: selectedSize || null,
      maxStock: maxQty != null ? Math.max(0, Number(maxQty) || 0) : null,
      variants: Array.isArray(product.variants) ? product.variants : [],
    };
    if (!pidForVariant || !effectiveVariantId) {
      toast.error("Missing product id — cannot add to cart");
      return;
    }
    // First, insert into MongoDB cart collection via backend API
    try {
      const numericPrice = Number(
        String(product.priceSale || product.priceRegular || product.price || "")
          .replace(/[^\d.]/g, ""),
      );
      const payload = {
        userId,
        productId: pidForVariant,
        variantId: effectiveVariantId,
        name: product.title || "",
        slug: product.handle || product.slug || "",
        price: Number.isFinite(numericPrice) ? numericPrice : 0,
        color: resolvedColor || null,
        size: selectedSize || null,
        quantity,
        image: mainSrc || (Array.isArray(images) && images[0]) || "",
      };

      await addToCartMongo(payload);
    } catch (e) {
      toast.error(e?.message || "Could not add to cart");
      return;
    }

    // Preserve existing behaviour: update frontend cart via onAddToCart
    if (onAddToCart && cartProduct.productId && cartProduct.variantId) {
      onAddToCart(cartProduct, quantity);
    }
    onClose();
  };

  return (
    <>
      <style>{`
        .quickview-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .quickview-scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobileView ? 10 : 20,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        className="quickview-scrollbar-hide"
        style={{
          position: "relative",
          backgroundColor: "#fff",
          maxWidth: 960,
          width: "100%",
          maxHeight: isMobileView ? "94vh" : "90vh",
          overflowY: "auto",
          borderRadius: isMobileView ? 10 : 12,
          padding: isMobileView ? "14px 14px 18px" : 44,
          boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: isMobileView ? 34 : 40,
            height: isMobileView ? 34 : 40,
            border: "none",
            background: "transparent",
            fontSize: isMobileView ? 24 : 28,
            cursor: "pointer",
            color: "#333",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobileView ? 16 : 28,
            alignItems: "flex-start",
            flexDirection: isMobileView ? "column" : "row",
          }}
        >
          {/* Image + carousel */}
          <div
            style={{
              flex: isMobileView ? "1 1 100%" : "0 0 400px",
              width: isMobileView ? "100%" : undefined,
              maxWidth: "100%",
              minWidth: isMobileView ? 0 : 280,
              position: "relative",
            }}
          >
            {currentImage && (
              <>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: isMobileView ? "4 / 5" : "3 / 4",
                    borderRadius: isMobileView ? 8 : 10,
                    overflow: "hidden",
                    background: "#f5f5f5",
                  }}
                >
                  <img
                    src={currentImage}
                    alt={product.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      objectFit: "cover",
                    }}
                  />
                </div>
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Previous image"
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: isMobileView ? 36 : 44,
                        height: isMobileView ? 36 : 44,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        fontSize: isMobileView ? 18 : 22,
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next image"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: isMobileView ? 36 : 44,
                        height: isMobileView ? 36 : 44,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        fontSize: isMobileView ? 18 : 22,
                        color: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      }}
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            )}
            {hasMultipleImages && (
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImageIndex(i)}
                    style={{
                      width: isMobileView ? 50 : 60,
                      height: isMobileView ? 50 : 60,
                      padding: 0,
                      border: imageIndex === i ? "2px solid #111" : "1px solid #ddd",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info - scrollable so more content is visible */}
          <div
            className={isMobileView ? undefined : "quickview-scrollbar-hide"}
            style={{
              flex: "1 1 400px",
              minWidth: isMobileView ? 0 : 280,
              maxHeight: isMobileView ? "unset" : "min(70vh, 560px)",
              overflowY: isMobileView ? "visible" : "auto",
              paddingRight: isMobileView ? 0 : 8,
              width: isMobileView ? "100%" : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobileView ? 22 : 26,
                  lineHeight: isMobileView ? 1.2 : 1.25,
                  fontWeight: 600,
                  color: "#111",
                  flex: 1,
                }}
              >
                {product.title}
              </h2>
              {/* Heart / wishlist icon — red when wishlisted */}
              <button
                type="button"
                onClick={toggleWishlist}
                disabled={wishlistLoading}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                style={{
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  border: "1px solid #e5e7eb",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: wishlistLoading ? "wait" : "pointer",
                  opacity: wishlistLoading ? 0.6 : 1,
                  transition: "border-color 0.15s, background 0.15s",
                  marginTop: 4,
                }}
              >
                <svg
                  viewBox="0 0 15 13"
                  fill={isWishlisted ? "#ef4444" : "none"}
                  stroke={isWishlisted ? "#ef4444" : "#333"}
                  strokeWidth={isWishlisted ? 0 : 0.4}
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: 18, height: 16, transition: "fill 0.15s, stroke 0.15s" }}
                >
                  <path d="M13.1929 1.1123C13.8492 1.67741 14.2867 2.35189 14.5054 3.13574C14.7242 3.90137 14.7333 4.63965 14.5328 5.35059C14.3323 6.06152 13.9859 6.6722 13.4937 7.18262L8.70857 12.0498C8.4169 12.3415 8.07055 12.4873 7.66951 12.4873C7.26846 12.4873 6.92211 12.3415 6.63044 12.0498L1.84529 7.18262C1.3531 6.6722 1.00675 6.06152 0.806225 5.35059C0.605704 4.62142 0.614819 3.87402 0.833569 3.1084C1.05232 2.34277 1.48982 1.67741 2.14607 1.1123C2.92992 0.456055 3.8505 0.173503 4.90779 0.264648C5.98331 0.337565 6.90388 0.756836 7.66951 1.52246C8.43513 0.756836 9.34659 0.337565 10.4039 0.264648C11.4794 0.173503 12.4091 0.456055 13.1929 1.1123Z" />
                  <path d="M12.564 6.25293C13.0927 5.70605 13.357 5.04069 13.357 4.25684C13.357 3.45475 13.0289 2.74382 12.3726 2.12402C11.8258 1.68652 11.1877 1.49512 10.4586 1.5498C9.74763 1.60449 9.13695 1.89616 8.62654 2.4248L7.66951 3.38184L6.71248 2.4248C6.20206 1.89616 5.58227 1.60449 4.8531 1.5498C4.14216 1.49512 3.51326 1.68652 2.96638 2.12402C2.31013 2.74382 1.98201 3.45475 1.98201 4.25684C1.98201 5.04069 2.24633 5.70605 2.77498 6.25293L7.58748 11.1201C7.64216 11.193 7.69685 11.193 7.75154 11.1201L12.564 6.25293Z" fill={isWishlisted ? "#ef4444" : "#555"} />
                </svg>
              </button>
            </div>
            <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: isMobileView ? 20 : 22, fontWeight: 600, color: "#111" }}>{price}</span>
              {product.onSale && product.priceRegular && product.priceSale && (
                <span style={{ fontSize: 15, color: "#888", textDecoration: "line-through" }}>
                  {product.priceRegular}
                </span>
              )}
              {product.tag && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 4,
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                  }}
                >
                  {product.tag}
                </span>
              )}
            </div>

            {product.description && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  About this product
                </div>
                {showFullDescription ? (
                  <>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: "#555",
                        lineHeight: 1.45,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {product.description}
                    </p>
                    {String(product.description).trim().length > 60 && (
                      <button
                        type="button"
                        onClick={() => setShowFullDescription(false)}
                        style={{
                          marginTop: 6,
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          color: "#111",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        View less
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 15,
                        color: "#555",
                        lineHeight: 1.35,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {product.description}
                    </p>
                    {String(product.description).trim().length > 60 && (
                      <button
                        type="button"
                        onClick={() => setShowFullDescription(true)}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: 0,
                          color: "#111",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        View more
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* {product.url && (
              <a
                href={product.url}
                style={{ fontSize: 15, color: "#333", textDecoration: "underline", marginBottom: 18, display: "inline-block" }}
              >
                View full details →
              </a>
            )} */}

            {sizeChartSrc && (
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  {sizeChartLabel}
                </button>
              </div>
            )}

            {product.colorOptions?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: "#333" }}>
                  Color: {selectedColor || product.colorOptions[0]?.label || product.colorOptions[0]?.value}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {product.colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedColor(opt.label ?? opt.value)}
                      title={opt.label}
                      aria-label={opt.label}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border:
                          (selectedColor || "") === String(opt.label ?? opt.value)
                            ? "2px solid #333"
                            : "1px solid #ddd",
                        padding: 0,
                        cursor: "pointer",
                        backgroundColor: opt.color || "#f5f5f5",
                        boxSizing: "border-box",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size options: prefer active variant sizes when available, otherwise fall back to product.sizeOptions */}
            {(() => {
              const variantSizes =
                activeVariant && Array.isArray(activeVariant.sizes)
                  ? activeVariant.sizes
                  : null;
              const sizeOptions =
                variantSizes && variantSizes.length
                  ? variantSizes.map((s) => {
                      const v = s && (s.size ?? s);
                      const st = Number(s?.stock ?? 0);
                      return { value: String(v), label: String(v), stock: Number.isFinite(st) ? st : null };
                    })
                  : product.sizeOptions || [];
              if (!sizeOptions.length) return null;
              return (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: "#333" }}>
                  Size: {sizeOptions.find((s) => s.value === selectedSize)?.label || sizeOptions[0]?.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      color: isOutOfStock ? "#b91c1c" : "#166534",
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: isOutOfStock ? "#ef4444" : "#16a34a",
                        display: "inline-block",
                      }}
                    />
                    {isOutOfStock ? "Out of stock" : "In stock"}
                    {/* {selectedStock != null ? (
                      <span style={{ color: "#64748b", fontWeight: 600 }}>
                        (left: {selectedStock})
                      </span>
                    ) : null} */}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSize(opt.value)}
                      title={opt.label}
                      aria-label={opt.label}
                      disabled={opt.stock != null ? opt.stock <= 0 : false}
                      style={{
                        minWidth: 44,
                        height: isMobileView ? 40 : 44,
                        padding: "0 14px",
                        borderRadius: 4,
                        border: selectedSize === opt.value ? "2px solid #333" : "1px solid #ddd",
                        background: (opt.stock != null && opt.stock <= 0) ? "#f1f5f9" : (selectedSize === opt.value ? "#f5f5f5" : "#fff"),
                        cursor: (opt.stock != null && opt.stock <= 0) ? "not-allowed" : "pointer",
                        fontSize: 14,
                        fontWeight: 500,
                        color: (opt.stock != null && opt.stock <= 0) ? "#94a3b8" : "#333",
                        opacity: (opt.stock != null && opt.stock <= 0) ? 0.85 : 1,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              );
            })()}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: "#333" }}>
                Quantity
              </div>
              {/* {maxQty != null && maxQty > 0 && (
                <div style={{ marginTop: -6, marginBottom: 10, fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                  Max available: {maxQty}
                </div>
              )} */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "fit-content",
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1))}
                  aria-label="Decrease"
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "#f5f5f5",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={maxQty != null ? Math.max(1, maxQty) : undefined}
                  value={quantity}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (isNaN(v) || v < 1) return;
                    if (maxQty != null) {
                      setQuantity(Math.min(v, Math.max(1, maxQty)));
                      return;
                    }
                    setQuantity(v);
                  }}
                  style={{
                    width: 48,
                    height: 40,
                    border: "none",
                    borderLeft: "1px solid #ddd",
                    borderRight: "1px solid #ddd",
                    textAlign: "center",
                    fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => {
                      const next = (Number(q) || 1) + 1;
                      if (maxQty != null) return Math.min(next, Math.max(1, maxQty));
                      return next;
                    })
                  }
                  aria-label="Increase"
                  disabled={maxQty != null ? quantity >= Math.max(1, maxQty) : false}
                  style={{
                    width: 40,
                    height: 40,
                    border: "none",
                    background: "#f5f5f5",
                    cursor: maxQty != null && quantity >= Math.max(1, maxQty) ? "not-allowed" : "pointer",
                    fontSize: 18,
                    opacity: maxQty != null && quantity >= Math.max(1, maxQty) ? 0.5 : 1,
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                width: "100%",
                padding: isMobileView ? "13px 18px" : "14px 24px",
                backgroundColor: isOutOfStock ? "#9ca3af" : "#111",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: isMobileView ? 15 : 16,
                fontWeight: 600,
                cursor: isOutOfStock ? "not-allowed" : "pointer",
                opacity: isOutOfStock ? 0.9 : 1,
              }}
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
      </div>

      {showSizeChart && sizeChartSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={sizeChartLabel}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            backgroundColor: "rgba(0,0,0,0.88)",
          }}
          onClick={() => setShowSizeChart(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "min(920px, 100%)",
              maxHeight: "min(90vh, 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSizeChart(false)}
              aria-label="Close size chart"
              style={{
                alignSelf: "flex-end",
                marginBottom: 8,
                border: "none",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                width: 40,
                height: 40,
                borderRadius: "50%",
                fontSize: 22,
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <img
              src={sizeChartSrc}
              alt={sizeChartLabel}
              style={{
                maxWidth: "100%",
                maxHeight: "calc(90vh - 56px)",
                objectFit: "contain",
                borderRadius: 8,
                background: "#fff",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default QuickViewModal;
