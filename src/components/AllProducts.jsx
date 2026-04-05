import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProductGrid from "./ProductGrid";
import CollectionFilters from "./CollectionFilters";
import productsData from "../data/productsData";
import {
  addToWishlistMongo,
  fetchCatalogProducts,
  fetchWishlistMongo,
  removeWishlistMongo,
  fetchRecentlyViewedMongo,
  addToRecentlyViewedMongo,
} from "../redux/actions";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserId } from "../utils/userId";
import { isInternalFreeSizeLabel } from "../utils/internalFreeSize";

const SORT_OPTIONS = [
  { value: "manual",            label: "Featured" },
  { value: "best-selling",      label: "Best selling" },
  { value: "title-ascending",   label: "Alphabetically, A-Z" },
  { value: "title-descending",  label: "Alphabetically, Z-A" },
  { value: "price-ascending",   label: "Price, low to high" },
  { value: "price-descending",  label: "Price, high to low" },
  { value: "created-ascending", label: "Date, old to new" },
  { value: "created-descending","label": "Date, new to old" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      className="m-toolbar--sortby m:hidden md:m:block"
      style={{ position: "relative", userSelect: "none" }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 14px 7px 12px",
          border: "1px solid #ddd", borderRadius: 6,
          background: "#fff", cursor: "pointer", fontSize: 13.5,
          color: "#222", fontWeight: 400,
          minWidth: 180, justifyContent: "space-between",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 2px rgba(0,0,0,0.08)" : "none",
          borderColor: open ? "#999" : "#ddd",
        }}
      >
        <span style={{ fontSize: 11, color: "#999", marginRight: 2 }}>Sort:</span>
        <span style={{ flex: 1, textAlign: "left" }}>{current.label}</span>
        <svg
          width={10} height={10} viewBox="0 0 10 10" fill="none"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M1 3L5 7L9 3" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 200,
          overflow: "hidden",
        }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "9px 14px", fontSize: 13.5, border: "none",
                background: opt.value === value ? "#f5f5f5" : "transparent",
                color: opt.value === value ? "#111" : "#444",
                fontWeight: opt.value === value ? 600 : 400,
                cursor: "pointer", transition: "background 0.12s",
              }}
              onMouseOver={e => { if (opt.value !== value) e.currentTarget.style.background = "#fafafa"; }}
              onMouseOut={e => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }}
            >
              {opt.value === value && (
                <span style={{ marginRight: 6, color: "#111" }}>✓</span>
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const AllProducts = ({ addToCart }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogPagination, setCatalogPagination] = useState(null);
  const [usingCatalogApi, setUsingCatalogApi] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [columns, setColumns] = useState(4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const userId = getUserId();

  // Derive wishlistIds from Redux store (shared with Product.jsx & WishList.jsx)
  const wishlistItems = useSelector((state) => Array.isArray(state.wishlist) ? state.wishlist : []);
  const wishlistIds = new Set(wishlistItems.map((it) => String(it.productId || it._id || "")));

  // Recently viewed from Redux (server)
  const recentlyViewedRedux = useSelector((state) => Array.isArray(state.recentlyViewed) ? state.recentlyViewed : []);

  // Map recently viewed full catalog shape → ProductCard shape (same logic as catalog grid)
  const recentlyViewed = recentlyViewedRedux.length
    ? recentlyViewedRedux.map((p, index) => {
        const firstVariant = Array.isArray(p.variants) && p.variants[0] ? p.variants[0] : null;
        const firstImage =
          firstVariant && Array.isArray(firstVariant.images) && firstVariant.images[0]
            ? firstVariant.images[0]
            : p.image || "";
        const secondImage =
          firstVariant && Array.isArray(firstVariant.images) && firstVariant.images[1]
            ? firstVariant.images[1]
            : firstImage;

        const priceNumber = Number(p.price || 0);
        const discountNumber = p.discountPrice != null ? Number(p.discountPrice) : null;
        const hasDiscount = discountNumber != null && discountNumber > 0 && discountNumber < priceNumber;

        const sizeSet = new Set();
        (p.variants || []).forEach((v) => {
          (v.sizes || []).forEach((s) => {
            const sz = s && (s.size ?? s);
            if (
              sz != null &&
              sz !== "" &&
              !isInternalFreeSizeLabel(sz)
            ) {
              sizeSet.add(String(sz));
            }
          });
        });
        const sizeOptions = Array.from(sizeSet).map((s) => ({ value: s, label: s }));

        return {
          productId: p._id || p.productId || index + 1,
          variantId: `${p._id || p.productId || index + 1}-v1`,
          handle: p.slug || String(p.name || p.title || `product-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          title: p.name || p.title || "Product",
          mainImage: { src: firstImage, srcSet: firstImage },
          hoverImage: { src: secondImage || firstImage, srcSet: secondImage || firstImage },
          images: firstVariant && Array.isArray(firstVariant.images) ? firstVariant.images : [firstImage].filter(Boolean),
          priceRegular: `₹${priceNumber}`,
          priceSale: hasDiscount ? `₹${discountNumber}` : "",
          onSale: hasDiscount,
          description: p.description || "",
          colorOptions: Array.isArray(p.variants)
            ? p.variants
                .filter((v) => typeof v.color === "string" && v.color.trim().length > 0 && v.color.length <= 12)
                .slice(0, 4)
                .map((v) => ({ value: v.color || "", label: v.color || "", color: v.colorCode || "" }))
            : [],
          variants: Array.isArray(p.variants) ? p.variants : [],
          sizeOptions,
          sizeChartImage: p.sizeChartImage || "",
          sizeChartTitle: String(p.sizeChartTitle ?? "").trim(),
          sizeGuide: p.sizeGuide || null,
          atcLabel: "Select options",
          tag: p.isFeatured ? "New" : null,
          animationOrder: index + 1,
          firstImageLoading: "lazy",
          firstImagePriority: "low",
        };
      })
    : [];

  // Fetch wishlist + recently viewed into Redux on mount
  useEffect(() => {
    dispatch(fetchWishlistMongo(userId));
    dispatch(fetchRecentlyViewedMongo(userId, 10));
  }, [dispatch, userId]);

  // Mobile filter drawer: body scroll + Escape (theme CSS hides sidebar until a class toggles display)
  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setMobileFiltersOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const close = () => {
      if (mq.matches) setMobileFiltersOpen(false);
    };
    close();
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [location.pathname]);

  const toPriceNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const s = String(v);
    const m = s.match(/-?\d+(\.\d+)?/);
    const n = m ? Number(m[0]) : NaN;
    return Number.isFinite(n) ? n : 0;
  };

  const openProductPage = useCallback(
    (product) => {
      if (!product) return;
      dispatch(addToRecentlyViewedMongo(userId, product));
      const slug =
        product.handle ||
        product.slug ||
        String(product.name || product.title || "item")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      navigate(`/products/${encodeURIComponent(slug)}`, { state: { product } });
    },
    [dispatch, userId, navigate],
  );

  useEffect(() => {
    const handleQuickViewButtonClick = (event) => {
      const button = event.target.closest(".m-product-quickview-button");
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();

      const productHandle = button.getAttribute("data-product-handle");
      const productUrl = button.getAttribute("data-product-url");

      if (!productHandle && !productUrl) {
        return;
      }

      const productCard = button.closest(".m-product-card");
      if (!productCard) {
        return;
      }

      const titleLinkEl = productCard.querySelector("a.m-product-card__name");
      const cardLinkEl = productCard.querySelector("a.m-product-card__link");
      const titleEl =
        titleLinkEl || productCard.querySelector(".m-product-card__name");
      const priceEl =
        productCard.querySelector(".m-price__sale .m-price-item--sale") ||
        productCard.querySelector(".m-price-item--regular");
      const imageEl = productCard.querySelector(
        ".m-product-card__main-image img",
      );
      const hoverImageEl = productCard.querySelector(
        ".m-product-card__hover-image img",
      );

      const title = titleEl?.textContent?.trim() || "";
      const price = priceEl?.textContent?.trim() || "";
      const imageSrc = imageEl?.getAttribute("src") || "";
      const imageAlt = imageEl?.getAttribute("alt") || title;
      const hoverSrc = hoverImageEl?.getAttribute("src") || "";
      const images = [imageSrc].concat(
        hoverSrc && hoverSrc !== imageSrc ? [hoverSrc] : [],
      );

      const descriptionEl = productCard.querySelector(
        ".m-product-card__description",
      );
      const description = descriptionEl?.textContent?.trim() || "";

      const saleBlock = productCard.querySelector(".m-price__sale");
      const compareAtEl = saleBlock?.querySelector("s.m-price-item--regular");
      const compareAtPrice = compareAtEl?.textContent?.trim() || "";
      const isOnSale = !!compareAtPrice;

      const colorOptions = [];
      const swatchContainer = productCard.querySelector(
        "[data-pcard-variant-picker]",
      );
      if (swatchContainer) {
        swatchContainer
          .querySelectorAll(".m-product-option--node__label")
          .forEach((label) => {
            const value =
              label.getAttribute("data-value") ||
              label.textContent?.trim() ||
              "";
            const labelText = label.textContent?.trim() || value;
            const bg =
              label.style?.backgroundColor ||
              label.style?.getPropertyValue?.("background-color") ||
              null;
            colorOptions.push({ value, label: labelText, color: bg });
          });
      }

      const cardHref =
        cardLinkEl?.getAttribute("href") ||
        titleLinkEl?.getAttribute("href") ||
        "";

      const resolvedUrlRaw =
        productUrl ||
        cardHref ||
        (productHandle ? `/products/${productHandle}` : "");

      let resolvedUrl = resolvedUrlRaw.replace(/^\.\.\//, "/");
      if (!resolvedUrl.startsWith("/") && !resolvedUrl.startsWith("http")) {
        resolvedUrl = `/${resolvedUrl}`;
      }

      const fullProduct = Array.isArray(productsData)
        ? productsData.find((p) => p.handle === productHandle)
        : null;
      const catalogProduct = Array.isArray(catalogProducts)
        ? catalogProducts.find((p) => p.handle === productHandle)
        : null;
      const fallbackProduct = {
        title,
        price,
        imageSrc,
        imageAlt,
        images,
        handle: productHandle,
        url: resolvedUrl,
        description,
        compareAtPrice,
        isOnSale,
        colorOptions,
      };
      const productToView = fullProduct || catalogProduct || fallbackProduct;
      dispatch(addToRecentlyViewedMongo(userId, productToView));
      const slug =
        productToView.handle ||
        productHandle ||
        String(title || "item")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      navigate(`/products/${encodeURIComponent(slug)}`, {
        state: { product: productToView },
      });
    };

    document.addEventListener("click", handleQuickViewButtonClick, true);
    return () => {
      document.removeEventListener("click", handleQuickViewButtonClick, true);
    };
  }, [catalogProducts, dispatch, navigate, userId]);


  // Load products from catalog API (DB) with filters and map into ProductCard shape
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setUsingCatalogApi(true);
        const search = new URLSearchParams(location.search);
        const fromUrl =
          search.get("category") || search.get("categoryId") || "";
        let navCategoryIds = "";
        try {
          navCategoryIds = sessionStorage.getItem("navCategoryIds") || "";
        } catch {
          navCategoryIds = "";
        }
        const categoryId = fromUrl || navCategoryIds || "";
        const minPrice = search.get("minPrice") || "";
        const maxPrice = search.get("maxPrice") || "";
        const colorsParam = search.get("colors") || "";
        const sizesParam = search.get("sizes") || "";
        const brandsParam = search.get("brands") || "";
        const availabilityParam = search.get("availability") || "";
        const sortBy = search.get("sort_by") || "created-descending";
        const pageParam = search.get("page") || "1";
        const limitParam = search.get("limit") || "40";

        const colors = colorsParam
          ? colorsParam.split(",").map((c) => c.trim()).filter(Boolean)
          : undefined;
        const sizes = sizesParam
          ? sizesParam.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;
        const brands = brandsParam
          ? brandsParam.split(",").map((b) => b.trim()).filter(Boolean)
          : undefined;
        const availability = availabilityParam
          ? availabilityParam.split(",").map((a) => a.trim()).filter(Boolean)
          : undefined;

        const apiResponse = await fetchCatalogProducts({
          categoryId,
          minPrice,
          maxPrice,
          colors,
          sizes,
          brands,
          availability,
          sortBy,
          page: pageParam,
          limit: limitParam,
        });

        const data = Array.isArray(apiResponse?.items)
          ? apiResponse.items
          : Array.isArray(apiResponse)
            ? apiResponse
            : [];

        if (!data.length) {
          setCatalogProducts([]);
          setCatalogPagination(
            apiResponse && apiResponse.pagination
              ? apiResponse.pagination
              : {
                  total: 0,
                  page: Number(pageParam) || 1,
                  limit: Number(limitParam) || 40,
                  totalPages: 0,
                },
          );
          return;
        }

        const effectivePagination =
          apiResponse && apiResponse.pagination
            ? apiResponse.pagination
            : {
                total: data.length,
                page: Number(pageParam) || 1,
                limit: Number(limitParam) || data.length,
                totalPages: 1,
              };
        // Dedupe + merge variants:
        // Legacy duplicates across categories can have the same "product identity"
        // but different `variants` payloads (e.g. colors/images). If we keep only
        // the first record, UI will show fewer colors.
        // So we merge duplicates by a logical product key and union variants.
        const normalizeStr = (v) => String(v ?? "").trim();
        const lowerTrim = (v) => normalizeStr(v).toLowerCase();
        const isDefaultColor = (c) => {
          const s = normalizeStr(c);
          if (!s) return true;
          return lowerTrim(s) === "default";
        };

        const variantColorKey = (v) => {
          const code = lowerTrim(v?.colorCode);
          const color = lowerTrim(v?.color);
          if (code) return `code:${code}`;
          if (color) return `color:${color}`;
          return "unknown";
        };

        const mergeSizes = (baseSizes, incomingSizes) => {
          const map = new Map();
          const add = (s) => {
            const sizeLabel = normalizeStr(s?.size ?? s);
            if (!sizeLabel) return;
            const k = lowerTrim(sizeLabel);
            const stock = Number(s?.stock ?? 0);
            if (!map.has(k)) {
              map.set(k, { size: sizeLabel, stock: Number.isFinite(stock) ? stock : 0 });
            } else {
              // Preserve the most optimistic stock across duplicates.
              const prev = map.get(k);
              map.set(k, { ...prev, stock: Math.max(prev.stock, Number.isFinite(stock) ? stock : 0) });
            }
          };
          (baseSizes || []).forEach(add);
          (incomingSizes || []).forEach(add);
          return Array.from(map.values());
        };

        const mergeVariants = (baseVariants, incomingVariants) => {
          const map = new Map();

          // Seed with base variants.
          (baseVariants || []).forEach((v) => {
            const k = variantColorKey(v);
            map.set(k, {
              ...v,
              images: Array.isArray(v?.images) ? Array.from(new Set(v.images.filter(Boolean))) : [],
              sizes: Array.isArray(v?.sizes) ? mergeSizes([], v.sizes) : [],
            });
          });

          // Merge incoming variants into the map.
          (incomingVariants || []).forEach((v) => {
            const k = variantColorKey(v);
            if (!map.has(k)) {
              map.set(k, {
                ...v,
                images: Array.isArray(v?.images) ? Array.from(new Set(v.images.filter(Boolean))) : [],
                sizes: Array.isArray(v?.sizes) ? mergeSizes([], v.sizes) : [],
              });
              return;
            }

            const existing = map.get(k);
            const incomingImages = Array.isArray(v?.images) ? v.images.filter(Boolean) : [];
            map.set(k, {
              ...existing,
              color: (() => {
                const existingColor = existing?.color || "";
                const incomingColor = v?.color || "";
                // Prefer the first non-"Default" label we see.
                return !isDefaultColor(incomingColor)
                  ? incomingColor
                  : isDefaultColor(existingColor)
                    ? incomingColor || existingColor
                    : existingColor;
              })(),
              colorCode: existing?.colorCode ? existing.colorCode : v?.colorCode || "",
              images: Array.from(new Set([...(existing.images || []), ...incomingImages])),
              sizes: mergeSizes(existing.sizes || [], v?.sizes || []),
            });
          });

          return Array.from(map.values());
        };

        const mergeMap = new Map();
        const productKeyOf = (p) =>
          [
            lowerTrim(p?.name),
            String(p?.price ?? 0),
            lowerTrim(p?.discountPrice ?? ""),
            lowerTrim(p?.brand),
            lowerTrim(p?.description),
          ].join("__");

        for (const p of data) {
          const key = productKeyOf(p);
          if (!mergeMap.has(key)) {
            mergeMap.set(key, { ...p, variants: Array.isArray(p?.variants) ? p.variants : [] });
          } else {
            const target = mergeMap.get(key);
            target.variants = mergeVariants(
              target?.variants || [],
              Array.isArray(p?.variants) ? p.variants : [],
            );
            mergeMap.set(key, target);
          }
        }

        const mergedData = Array.from(mergeMap.values());

        const mapped = mergedData.map((p, index) => {
          const firstVariant = Array.isArray(p.variants) && p.variants[0] ? p.variants[0] : null;
          const firstImage = firstVariant && Array.isArray(firstVariant.images) && firstVariant.images[0]
            ? firstVariant.images[0]
            : "";
          const secondImage = firstVariant && Array.isArray(firstVariant.images) && firstVariant.images[1]
            ? firstVariant.images[1]
            : firstImage;

          const priceNumber = Number(p.price || 0);
          const discountNumber = p.discountPrice != null ? Number(p.discountPrice) : null;
          const hasDiscount = discountNumber != null && discountNumber > 0 && discountNumber < priceNumber;

          // Collect unique sizes from all variants for QuickView size selector
          const sizeSet = new Set();
          (p.variants || []).forEach((v) => {
            (v.sizes || []).forEach((s) => {
              const sz = s && (s.size ?? s);
              if (
                sz != null &&
                sz !== "" &&
                !isInternalFreeSizeLabel(sz)
              ) {
                sizeSet.add(String(sz));
              }
            });
          });
          const sizeOptions = Array.from(sizeSet).map((s) => ({ value: s, label: s }));

          return {
            // Minimal fields required by ProductCard
            productId: p.id || p._id || index + 1,
            variantId: `${p._id || index + 1}-v1`,
            handle: p.slug || String(p.name || `product-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: p.name || "Product",
            // url: `/products/${p.slug || ""}`,
            // productUrl: `/products/${p.slug || ""}`,
            mainImage: {
              src: firstImage,
              srcSet: firstImage,
            },
            hoverImage: {
              src: secondImage || firstImage,
              srcSet: secondImage || firstImage,
            },
            images: firstVariant && Array.isArray(firstVariant.images) ? firstVariant.images : [firstImage, secondImage || firstImage].filter(Boolean),
            priceRegular: hasDiscount ? `₹${priceNumber}` : `₹${priceNumber}`,
            priceSale: hasDiscount ? `₹${discountNumber}` : "",
            onSale: hasDiscount,
            description: p.description || "",
            // Limit visible color dots so row doesn't overflow
            colorOptions: Array.isArray(p.variants)
              ? p.variants
                  .filter((v) => typeof v.color === "string" && v.color.length <= 12)
                  .slice(0, 4)
                  .map((v) => ({
                    value: v.color || "",
                    label: v.color || "",
                    color: v.colorCode || "",
                  }))
              : [],
            // keep original variants so card / quick view can switch by color
            variants: Array.isArray(p.variants) ? p.variants : [],
            sizeOptions,
            sizeChartImage: p.sizeChartImage || "",
            sizeChartTitle: String(p.sizeChartTitle ?? "").trim(),
            sizeGuide: p.sizeGuide || null,
            atcLabel: "Select options",
            tag: p.isFeatured ? "New" : null,
            animationOrder: index + 1,
            firstImageLoading: index < 4 ? "eager" : "lazy",
            firstImagePriority: index < 4 ? "high" : "low",
          };
        });
        setCatalogProducts(mapped);
        setCatalogPagination(effectivePagination);
      } catch {
        setCatalogProducts([]);
        setCatalogPagination(null);
        setUsingCatalogApi(false);
      }
    };
    loadCatalog();
  }, [location.search, location.key]);

  const toggleWishlist = async (product) => {
    const productId = String(product?.productId ?? product?._id ?? product?.id ?? "");
    if (!productId) return;

    const wasIn = wishlistIds.has(productId);
    setWishlistLoading(true);

    // Optimistic update in Redux
    if (wasIn) {
      dispatch({
        type: "FETCH_WISHLIST",
        payload: wishlistItems.filter((it) => String(it.productId || it._id || "") !== productId),
      });
    } else {
      dispatch({
        type: "FETCH_WISHLIST",
        payload: [
          ...wishlistItems,
          {
            productId,
            name: product?.title || product?.name || "Product",
            slug: product?.handle || product?.slug || "",
            price: toPriceNumber(product?.priceSale || product?.priceRegular || product?.price),
            image: product?.mainImage?.src || product?.imageSrc || product?.image || "",
          },
        ],
      });
    }

    try {
      if (wasIn) {
        await removeWishlistMongo({ userId, productId });
      } else {
        await addToWishlistMongo({
          userId,
          productId,
          name: product?.title || product?.name || "Product",
          slug: product?.handle || product?.slug || "",
          price: toPriceNumber(product?.priceSale || product?.priceRegular || product?.price),
          image: product?.mainImage?.src || product?.imageSrc || product?.image || "",
        });
      }
      // Refresh from server to get real _id etc.
      dispatch(fetchWishlistMongo(userId));
    } catch {
      // Revert on failure
      dispatch(fetchWishlistMongo(userId));
    } finally {
      setWishlistLoading(false);
    }
  };

  const goToPage = useCallback(
    (newPage) => {
      if (!newPage || newPage < 1) return;
      const params = new URLSearchParams(location.search);
      if (newPage === 1) {
        params.delete("page");
      } else {
        params.set("page", String(newPage));
      }
      const search = params.toString();
      navigate(
        {
          pathname: location.pathname,
          search: search ? `?${search}` : "",
        },
        { replace: false },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const sectionClass =
    `facest-filters-section collection-react${mobileFiltersOpen ? " collection-react--filters-open" : ""}`;

  return (
    <>
      <style>{`
        /* Mobile / tablet: theme sets .m-sidebar { display: none } — open drawer from React */
        @media (max-width: 1279px) {
          .collection-react.collection-react--filters-open .m-sidebar {
            display: block !important;
            --m-bg-opacity: 0.5;
          }
          .collection-react.collection-react--filters-open .m-sidebar--content {
            --m-translate-x: 0% !important;
            max-height: 100vh;
            max-height: 100dvh;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
            padding-bottom: max(12px, env(safe-area-inset-bottom, 0px));
            box-shadow: 4px 0 32px rgba(0, 0, 0, 0.18);
          }
          .collection-react-filter-footer {
            position: sticky;
            bottom: 0;
            left: 0;
            right: 0;
            margin: 16px -20px -20px;
            padding: 16px 20px calc(18px + env(safe-area-inset-bottom, 0px));
            background: #fff;
            border-top: 1px solid #ececec;
            border-radius: 16px 16px 0 0;
            box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.06);
            z-index: 2;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            text-align: center;
          }
          button.collection-react-filter-done-btn {
            display: inline-block;
            width: auto;
            min-width: 200px;
            max-width: min(280px, 100%);
            box-sizing: border-box;
            margin: 0 auto;
            vertical-align: middle;
            padding: 16px 40px;
            font-size: 17px;
            font-weight: 600;
            letter-spacing: 0.02em;
            border: none;
            border-radius: 14px;
            background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
            color: #fff;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
          }
          button.collection-react-filter-done-btn:active {
            transform: scale(0.985);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
            opacity: 0.96;
          }
          button.collection-react-filter-done-btn:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 3px;
          }
        }
      `}</style>
      <section
        className={sectionClass}
        data-section-type="collection-template"
        data-section-id="template--15265873330281__main"
        data-filters-type="storefront_filters"
        data-filters-position="leftColumn"
        data-enable-filters="true"
        data-enable-sorting="true"
        data-show-col-switchers="true"
        data-pagination-type="paginate"
        data-product-count={50}
        data-initial-column={4}
        data-view="collection"
      >
        <div className="container-fluid">
          <div className="m-collection--wrapper m-sidebar--leftColumn">
            <div
              className="m-sidebar m-scroll-trigger animate--fade-in-up"
              data-type="leftColumn"
              id="collection-filters-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              onClick={(e) => {
                if (e.target === e.currentTarget) setMobileFiltersOpen(false);
              }}
            >
              <div
                className="m-sidebar--content"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="m-sidebar--title" style={{ paddingRight: 48 }}>
                  Filters
                </h3>
                <button
                  type="button"
                  className="m-sidebar--close xl:m:hidden"
                  aria-label="Close filters"
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 8,
                    cursor: "pointer",
                    color: "#333",
                  }}
                >
                  <svg
                    className="m-svg-icon--large"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="m-filter--wrapper m:flex m:flex-col m-storefront--enabled">
                
                  <div
                
                    className="m-banner-promotion m-filter--widget"
                    style={{
                      "-webkit-order": "1",
                      "-ms-flex-order": "1",
                      order: "1",
                     
                    }}
                  >
                    <div className="m-image-card m-hover-box m-hover-box--scale-up ">
                      <div className="m-image-card__inner  m-gradient m-color-dark m:blocks-radius">
                        <div
                          className="m-image-card__img m:block m:h-full"
                          style={{
                            "--aspect-ratio": "0.6842105263157895",
                            "--aspect-ratio-mobile": "0.6842105263157895",
                          }}
                        >
                          <div className="m-media">
                            <picture className="m-media__wrapper m:block m:w-full m:h-full">
                              <img
                                src="../cdn/shop/files/collection-filter-promotioneb1f.jpg?v=1708486296&width=2000"
                                srcSet="//fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=300 300w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=400 400w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=500 500w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=600 600w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=700 700w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=800 800w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=900 900w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=1000 1000w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=1200 1200w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=1400 1400w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=1600 1600w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=1800 1800w, //fashion.minimog.co/cdn/shop/files/collection-filter-promotion.webp?v=1708486296&width=2000 2000w"
                                width={520}
                                height={760}
                                loading="lazy"
                                fetchpriority="low"
                              />
                            </picture>
                          </div>
                        </div>
                        <div
                          className="m-image-card__content  m:justify-center m:items-end  m-scroll-trigger animate--fade-in-up"
                          data-cascade
                          style={{ "--animation-order": "1" }}
                        >
                          <div className="m-richtext m-image-card__content-inner m:text-white m:text-center">
                            <p className="m-richtext__subtitle m-image-card__subheading h6 white">
                              Online Exclusive
                            </p>
                            <h3 className="m-richtext__title m-image-card__heading m:text-white h2">
                              SALE UP TO 25% OFF
                            </h3>
                            <a
                              href="#"
                              className="m-richtext__button m-button m-button--primary "
                            >
                              Shop The Sale
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CollectionFilters />
                  </div>
                </div>
                {mobileFiltersOpen && (
                  <div className="collection-react-filter-footer xl:m:hidden">
                    <button
                      type="button"
                      className="collection-react-filter-done-btn"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div
              id="CollectionProductGrid"
              className="m:flex-1"
              data-collection-id={275077791849}
            >
              <div className="m-collection-toolbar">
                <div className="m-collection-toolbar--wrapper">
                  <div className="m-toolbar--left m:flex xl:m:hidden">
                    <button
                      type="button"
                      className="m-sidebar--open m:flex m:items-center"
                      aria-expanded={mobileFiltersOpen}
                      aria-controls="collection-filters-drawer"
                      onClick={() => setMobileFiltersOpen(true)}
                      style={{
                        minHeight: 44,
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <span>Filter</span>
                      <svg className="m-svg-icon--small" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true">
                        <path d="M441.9 167.3l-19.8-19.8c-4.7-4.7-12.3-4.7-17 0L224 328.2 42.9 147.5c-4.7-4.7-12.3-4.7-17 0L6.1 167.3c-4.7 4.7-4.7 12.3 0 17l209.4 209.4c4.7 4.7 12.3 4.7 17 0l209.4-209.4c4.7-4.7 4.7-12.3 0-17z" />
                      </svg>
                    </button>
                  </div>
                  <div className="m-toolbar--right m:flex m:flex-1 m:items-center m:justify-end md:m:justify-between">
                    {/* Sort by — custom styled dropdown */}
                    <SortDropdown
                      value={new URLSearchParams(location.search).get("sort_by") || "created-descending"}
                      onChange={(val) => {
                        const p = new URLSearchParams(location.search);
                        p.set("sort_by", val);
                        p.delete("page");
                        navigate({ pathname: location.pathname, search: `?${p.toString()}` }, { replace: false });
                      }}
                    />
                    {/* Column switcher — wired to React state */}
                    <div className="m-toolbar--column-switcher m:flex">
                      {[
                        { col: 2, label: "2 columns", svg: <svg className="m-svg-icon--small" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5.5 12.5"><path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"/><path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"/></svg> },
                        { col: 3, label: "3 columns", svg: <svg className="m-svg-icon--small" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9.5 12.5"><path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"/><path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"/><path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"/></svg> },
                        { col: 4, label: "4 columns", svg: <svg className="m-svg-icon--small" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.5 12.5"><path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"/><path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"/><path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"/><path d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"/></svg> },
                        { col: 5, label: "5 columns", svg: <svg className="m-svg-icon--small" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.5 12.5"><path d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"/><path d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"/><path d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"/><path d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"/><path d="M16.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"/></svg> },
                      ].map(({ col, label, svg }) => (
                        <button
                          key={col}
                          type="button"
                          className={`m:flex m-tooltip m-tooltip--top${columns === col ? " is-active" : ""}`}
                          data-column={col}
                          aria-label={`${col}-column`}
                          onClick={() => setColumns(col)}
                          style={{ opacity: columns === col ? 1 : 0.4, transition: "opacity 0.15s" }}
                        >
                          {svg}
                          <span className="m-tooltip__content">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="ActiveFacets"
                className="m-active-facets m:flex m:flex-wrap m:items-center m-scroll-trigger animate--fade-in-up"
              ></div>
              {usingCatalogApi && !catalogProducts.length && (
                <div className="m:text-center m:py-10">
                  <p>No products found.</p>
                </div>
              )}
              <ProductGrid
                products={usingCatalogApi ? catalogProducts : productsData}
                addToCart={addToCart}
                wishlistIds={wishlistIds}
                wishlistLoading={wishlistLoading}
                onToggleWishlist={toggleWishlist}
                onQuickView={openProductPage}
                columns={columns}
              />
              <div className="m-collection--pagination m:text-center m-scroll-trigger animate--fade-in-up">
                {catalogPagination && catalogPagination.totalPages > 1 && (
                  <div className="m-pagination">
                    <button
                      type="button"
                      className="page prev"
                      disabled={catalogPagination.page <= 1}
                      onClick={() => goToPage(catalogPagination.page - 1)}
                    >
                      «
                    </button>
                    <span className="page current">{catalogPagination.page}</span>
                    <span className="deco">/</span>
                    <span className="page">{catalogPagination.totalPages}</span>
                    <button
                      type="button"
                      className="page next"
                      disabled={catalogPagination.page >= catalogPagination.totalPages}
                      onClick={() => goToPage(catalogPagination.page + 1)}
                    >
                      »
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="m-sortby-mobile ">
          <div className="m-sortby-mobile--wrapper">
            <div className="relative m-sortby-mobile--content">
              <span className="m-sortby-mobile--close">
                <svg
                  className="m-svg-icon--medium"
                  fill="currentColor"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                >
                  <path d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z" />
                </svg>
              </span>
              <span className="m-sortby-mobile--title">Sort by</span>
              <ul className="m-sortby-mobile--list">
                <li
                  className="m-sortby-mobile--item"
                  data-value="manual"
                  data-index={0}
                >
                  <span>Featured</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="best-selling"
                  data-index={1}
                >
                  <span>Best selling</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="title-ascending"
                  data-index={2}
                >
                  <span>Alphabetically, A-Z</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="title-descending"
                  data-index={3}
                >
                  <span>Alphabetically, Z-A</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="price-ascending"
                  data-index={4}
                >
                  <span>Price, low to high</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="price-descending"
                  data-index={5}
                >
                  <span>Price, high to low</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="created-ascending"
                  data-index={6}
                >
                  <span>Date, old to new</span>
                </li>
                <li
                  className="m-sortby-mobile--item"
                  data-value="created-descending"
                  data-index={7}
                >
                  <span>Date, new to old</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <div className="container-fluid m-section-my m-section-py">
          <div className="m-section__header m:text-left">
            <h2 className="m-section__heading h3 m-scroll-trigger animate--fade-in-up">
              Recently Viewed Products
            </h2>
          </div>
          <ProductGrid
            products={recentlyViewed.slice(0, 4)}
            addToCart={addToCart}
            wishlistIds={wishlistIds}
            wishlistLoading={wishlistLoading}
            onToggleWishlist={toggleWishlist}
            onQuickView={openProductPage}
          />
        </div>
      )}
 

    </>
  );
};

export default AllProducts;
