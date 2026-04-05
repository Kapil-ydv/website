import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  addToCartMongo,
  addToWishlistMongo,
  fetchWishlistList,
  removeWishlistMongo,
} from "../redux/actions";
import { getUserId } from "../utils/userId";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ProductSizeGuideModal from "./ProductSizeGuideModal";
import { hasSizeGuideContent } from "../utils/sizeGuide";
import {
  filterPublicSizeOptionEntries,
  formatSizeForCustomerDisplay,
  getInternalOrLegacyNoPublicSizeStock,
  resolveCartSizePayload,
} from "../utils/internalFreeSize";

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

  // iOS Safari: overflow:hidden alone often breaks position:fixed + portal modals.
  // Lock scroll with position:fixed on body and restore scroll position on close.
  // Depends only on isOpen so parent re-renders (new product object identity) do not thrash the lock.
  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return undefined;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      html.style.overflow = prev.htmlOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

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
      const opts = product.sizeOptions.filter(
        (o) => o && formatSizeForCustomerDisplay(o.value || o.label),
      );
      setSelectedSize(
        opts[0]?.value != null ? String(opts[0].value) : null,
      );
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
      const publicOpts = filterPublicSizeOptionEntries(v.sizes);
      if (publicOpts.length) {
        const pick =
          publicOpts.find((o) => o.stock != null && o.stock > 0) || publicOpts[0];
        if (pick?.value != null) setSelectedSize(String(pick.value));
      } else {
        setSelectedSize(null);
      }
    } else if (v) {
      setSelectedSize(null);
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
    if (!activeVariant) return null;
    const szList = Array.isArray(activeVariant.sizes) ? activeVariant.sizes : [];
    const publicOpts = filterPublicSizeOptionEntries(szList);
    if (publicOpts.length === 0) {
      return getInternalOrLegacyNoPublicSizeStock(activeVariant);
    }
    if (!selectedSize) return null;
    const found = szList.find((s) => String(s?.size ?? s) === String(selectedSize));
    if (!found || typeof found !== "object") return null;
    const st = Number(found.stock);
    return Number.isFinite(st) ? Math.max(0, st) : null;
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

  const portalEl =
    typeof document !== "undefined" ? document.body : null;

  const sizeChartSrc = String(product?.sizeChartImage || "").trim();
  const sizeChartLabel = String(product?.sizeChartTitle || "").trim();
  const hasStructuredSizeGuide = hasSizeGuideContent(product?.sizeGuide);
  const showSizeGuideEntry =
    hasStructuredSizeGuide || Boolean(sizeChartSrc);

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
    const rawVariantSizes = Array.isArray(activeVariant?.sizes)
      ? activeVariant.sizes
      : [];
    const publicSizeOpts = filterPublicSizeOptionEntries(rawVariantSizes);
    const needsSize = publicSizeOpts.length > 0;
    if (needsSize && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const cartLineSize = resolveCartSizePayload(
      activeVariant,
      selectedSize,
      publicSizeOpts,
    );
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
      size: cartLineSize,
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

  const closeIconSvg = (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block", pointerEvents: "none" }}
    >
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );

  const modalTree = (
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
          zIndex: 2147483000,
          display: "flex",
          alignItems: isMobileView ? "flex-end" : "center",
          justifyContent: "center",
          padding: isMobileView ? 0 : 20,
          backgroundColor: isMobileView ? "rgba(15,23,42,0.45)" : "rgba(0,0,0,0.6)",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
      <div
        className={isMobileView ? undefined : "quickview-scrollbar-hide"}
        style={{
          position: "relative",
          backgroundColor: "#fff",
          maxWidth: 960,
          width: "100%",
          maxHeight: isMobileView ? "min(92dvh, 92vh)" : "90vh",
          ...(isMobileView
            ? {
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                height: "min(92dvh, 92vh)",
                borderRadius: "20px 20px 0 0",
                padding: 0,
                boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
              }
            : {
                overflowY: "auto",
                borderRadius: 12,
                padding: 44,
                boxShadow: "0 12px 48px rgba(0,0,0,0.2)",
              }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobileView ? (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              minHeight: 52,
              paddingLeft: 16,
              paddingRight: "max(12px, env(safe-area-inset-right, 0px))",
              paddingTop: "max(8px, env(safe-area-inset-top, 0px))",
              paddingBottom: 8,
              borderBottom: "1px solid #f1f5f9",
              background: "#fff",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 44,
                height: 44,
                padding: 0,
                border: "1px solid #e2e8f0",
                borderRadius: "50%",
                background: "#f8fafc",
                cursor: "pointer",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {closeIconSvg}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              padding: 0,
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.98)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              cursor: "pointer",
              color: "#1a1a1a",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {closeIconSvg}
          </button>
        )}

        <div
          style={{
            flex: isMobileView ? 1 : undefined,
            minHeight: isMobileView ? 0 : undefined,
            overflowY: isMobileView ? "auto" : "visible",
            WebkitOverflowScrolling: isMobileView ? "touch" : undefined,
          }}
        >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobileView ? 0 : 28,
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
              ...(isMobileView ? { background: "#f8fafc" } : {}),
            }}
          >
            {currentImage && (
              <>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    borderRadius: isMobileView ? 0 : 10,
                    overflow: "hidden",
                    background: "#f1f5f9",
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
                      objectPosition: "center",
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
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                  ...(isMobileView ? { padding: "0 16px 12px" } : {}),
                }}
              >
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
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
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
              boxSizing: "border-box",
              ...(isMobileView
                ? {
                    padding: "16px 16px 0",
                    background: "#fff",
                  }
                : {}),
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: isMobileView ? 16 : 14,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobileView ? 20 : 26,
                  lineHeight: isMobileView ? 1.3 : 1.25,
                  fontWeight: 700,
                  color: "#0f172a",
                  flex: 1,
                  letterSpacing: isMobileView ? "-0.02em" : undefined,
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
                  width: isMobileView ? 44 : 40,
                  height: isMobileView ? 44 : 40,
                  border: "1px solid #e2e8f0",
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: wishlistLoading ? "wait" : "pointer",
                  opacity: wishlistLoading ? 0.6 : 1,
                  transition: "border-color 0.15s, background 0.15s",
                  marginTop: isMobileView ? 0 : 4,
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
            <div
              style={{
                marginBottom: isMobileView ? 20 : 18,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: isMobileView ? 22 : 22,
                  fontWeight: 700,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                }}
              >
                {price}
              </span>
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
              <div style={{ marginBottom: isMobileView ? 18 : 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#94a3b8",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  About this product
                </div>
                {showFullDescription ? (
                  <>
                    <p
                      style={{
                        margin: 0,
                        fontSize: isMobileView ? 15 : 15,
                        color: "#475569",
                        lineHeight: 1.55,
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
                        color: "#475569",
                        lineHeight: 1.5,
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

            {showSizeGuideEntry && (
              <div style={{ marginBottom: isMobileView ? 16 : 12 }}>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  style={{
                    border: isMobileView ? "1px solid #e2e8f0" : "none",
                    background: isMobileView ? "#f8fafc" : "transparent",
                    padding: isMobileView ? "12px 16px" : 0,
                    borderRadius: isMobileView ? 12 : 0,
                    width: isMobileView ? "100%" : "auto",
                    textAlign: isMobileView ? "center" : "left",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#2563eb",
                    textDecoration: isMobileView ? "none" : "underline",
                    cursor: "pointer",
                    display: isMobileView ? "block" : "inline",
                    boxSizing: "border-box",
                  }}
                >
                  {sizeChartLabel || "Size guide"}
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
                  ? filterPublicSizeOptionEntries(variantSizes)
                  : (product.sizeOptions || []).filter(
                      (o) =>
                        o && formatSizeForCustomerDisplay(o.value || o.label),
                    );

              const stockStatusRow = (
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
                  </span>
                </div>
              );

              if (sizeOptions.length) {
                return (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 10, color: "#333" }}>
                      Size: {sizeOptions.find((s) => s.value === selectedSize)?.label || sizeOptions[0]?.label}
                    </div>
                    {stockStatusRow}
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
              }

              if (selectedStock != null) {
                return <div style={{ marginBottom: 14 }}>{stockStatusRow}</div>;
              }

              return null;
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

            <div
              style={{
                position: isMobileView ? "sticky" : "static",
                bottom: 0,
                marginTop: isMobileView ? 20 : 0,
                marginLeft: isMobileView ? -16 : 0,
                marginRight: isMobileView ? -16 : 0,
                padding: isMobileView
                  ? "12px 16px max(16px, env(safe-area-inset-bottom, 0px))"
                  : 0,
                background: isMobileView ? "#fff" : "transparent",
                borderTop: isMobileView ? "1px solid #f1f5f9" : "none",
                zIndex: 3,
              }}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{
                  width: "100%",
                  padding: isMobileView ? "15px 20px" : "14px 24px",
                  backgroundColor: isOutOfStock
                    ? "#94a3b8"
                    : isMobileView
                      ? "#0f172a"
                      : "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: isMobileView ? 12 : 8,
                  fontSize: isMobileView ? 16 : 16,
                  fontWeight: 600,
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                  opacity: isOutOfStock ? 0.95 : 1,
                  boxShadow: isMobileView ? "0 4px 14px rgba(15,23,42,0.15)" : "none",
                }}
              >
                {isOutOfStock ? "Out of stock" : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>

      {showSizeChart && hasStructuredSizeGuide && (
        <ProductSizeGuideModal
          isOpen={showSizeChart}
          onClose={() => setShowSizeChart(false)}
          title={sizeChartLabel}
          sizeGuide={product.sizeGuide}
        />
      )}
      {showSizeChart && !hasStructuredSizeGuide && sizeChartSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={sizeChartLabel || "Size chart"}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483100,
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
              alt={sizeChartLabel || "Size chart"}
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

  return portalEl ? createPortal(modalTree, portalEl) : null;
};

export default QuickViewModal;
