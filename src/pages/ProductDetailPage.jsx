import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import { fetchCatalogProducts } from "../redux/actions";
import { isInternalFreeSizeLabel } from "../utils/internalFreeSize";

/** Same catalog → detail shape as `mapCatalogProduct` in Product.jsx */
function mapCatalogProduct(p, index) {
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
  const hasDiscount =
    discountNumber != null && discountNumber > 0 && discountNumber < priceNumber;

  const sizeSet = new Set();
  (p.variants || []).forEach((v) => {
    (v.sizes || []).forEach((s) => {
      const sz = s && (s.size ?? s);
      if (sz != null && sz !== "" && !isInternalFreeSizeLabel(sz)) {
        sizeSet.add(String(sz));
      }
    });
  });
  const sizeOptions = Array.from(sizeSet).map((s) => ({ value: s, label: s }));

  return {
    productId: p._id || p.id || index + 1,
    variantId: `${p._id || index + 1}-v1`,
    handle:
      p.slug ||
      String(p.name || `product-${index + 1}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
    title: p.name || "Product",
    name: p.name || "Product",
    mainImage: { src: firstImage, srcSet: firstImage },
    hoverImage: { src: secondImage || firstImage, srcSet: secondImage || firstImage },
    images:
      firstVariant && Array.isArray(firstVariant.images)
        ? firstVariant.images
        : [firstImage].filter(Boolean),
    priceRegular: `₹${priceNumber}`,
    priceSale: hasDiscount ? `₹${discountNumber}` : "",
    onSale: hasDiscount,
    description: p.description || "",
    colorOptions: Array.isArray(p.variants)
      ? p.variants
          .filter((v) => typeof v.color === "string" && v.color.trim().length > 0)
          .slice(0, 6)
          .map((v) => ({ value: v.color, label: v.color, color: v.colorCode || "" }))
      : [],
    colors: Array.isArray(p.variants)
      ? p.variants
          .filter((v) => typeof v.color === "string" && v.color.trim().length > 0)
          .slice(0, 6)
          .map((v) => ({ name: v.color, backgroundColor: v.colorCode || "#111" }))
      : [],
    variants: Array.isArray(p.variants) ? p.variants : [],
    sizeOptions,
    sizeChartImage: p.sizeChartImage || "",
    sizeChartTitle: String(p.sizeChartTitle ?? "").trim(),
    sizeGuide: p.sizeGuide || null,
    atcLabel: "Select options",
    tag: p.isFeatured ? "New" : null,
    animationOrder: index + 1,
    firstImageLoading: "eager",
    firstImagePriority: "high",
  };
}

function normHandle(v) {
  return decodeURIComponent(String(v ?? "").trim()).toLowerCase();
}

function truncateBreadcrumbTitle(text, maxLen = 52) {
  const s = String(text ?? "").trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, maxLen - 1)}…`;
}

const BREADCRUMB_SEP = (
  <span aria-hidden="true" className="m-breadcrumb--separator">
    <svg
      className="m-svg-icon--small m-rlt-reverse-x"
      fill="currentColor"
      stroke="currentColor"
      viewBox="0 0 256 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
    </svg>
  </span>
);

function ProductDetailPageContent({ handleParam, addToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const urlHandle = normHandle(handleParam);
  const fromState = location.state?.product;
  const stateMatches =
    fromState &&
    (normHandle(fromState.handle || fromState.slug) === urlHandle ||
      String(fromState.productId || fromState._id || fromState.id || "") ===
        String(handleParam || "").trim());

  const [product, setProduct] = useState(stateMatches ? fromState : null);
  const [loading, setLoading] = useState(!stateMatches);
  const [notFound, setNotFound] = useState(false);

  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/AllProducts");
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    const st = location.state?.product;
    const stOk =
      st &&
      (normHandle(st.handle || st.slug) === urlHandle ||
        String(st.productId || st._id || st.id || "") ===
          String(handleParam || "").trim());
    if (stOk) {
      setProduct(st);
      setLoading(false);
      setNotFound(false);
      return undefined;
    }

    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const raw = String(handleParam || "").trim();
        const apiResponse = await fetchCatalogProducts({
          query: raw,
          page: "1",
          limit: "80",
        });
        const data = Array.isArray(apiResponse?.items)
          ? apiResponse.items
          : Array.isArray(apiResponse)
            ? apiResponse
            : [];
        const match = data.find((p) => {
          const slug = normHandle(p?.slug);
          const id = String(p?._id || p?.id || "");
          return slug === urlHandle || id === raw;
        });
        if (cancelled) return;
        if (match) {
          setProduct(mapCatalogProduct(match, 0));
          setNotFound(false);
        } else {
          setProduct(null);
          setNotFound(true);
        }
      } catch {
        if (!cancelled) {
          setProduct(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleParam, urlHandle, location.state, location.key]);

  if (loading) {
    return (
      <main id="MainContent" role="main" className="template-product-main">
        <div className="shopify-section" id="shopify-section-product-detail">
          <div className="m-page-header m-page-header--template-page m:text-center m-scroll-trigger animate--fade-in-up">
            <div className="container">
              <h1 className="m-page-header__title">Product</h1>
            </div>
          </div>
          <div
            className="container-fluid m-section-my"
            style={{ padding: "48px 16px", textAlign: "center", color: "#64748b" }}
          >
            Loading…
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main id="MainContent" role="main" className="template-product-main">
        <div className="shopify-section" id="shopify-section-product-detail">
          <div className="m-page-header m-page-header--template-page m:text-center m-scroll-trigger animate--fade-in-up">
            <div className="container">
              <h1 className="m-page-header__title">Product</h1>
            </div>
          </div>
          <div className="container-fluid m-section-my m:text-center" style={{ padding: "48px 16px" }}>
            <p style={{ marginBottom: 16, color: "#334155" }}>Product not found.</p>
            <button
              type="button"
              className="m-button m-button--secondary"
              onClick={() => navigate("/AllProducts")}
            >
              Shop all products
            </button>
          </div>
        </div>
      
      </main>
    );
  }

  return (
    <main
      id="MainContent"
      role="main"
      className="template-product-main"
      style={{ paddingBottom: 48 }}
    >
      <div className="shopify-section" id="shopify-section-product-detail">
        <div className="m-page-header m-page-header--template-page m:text-center m-scroll-trigger animate--fade-in-up" style={{ paddingTop: 12, paddingBottom: 8 }}>
          <nav
            aria-label="breadcrumbs"
            className="m-breadcrumb m:w-full "
            role="navigation"
          >
            <div className="container">
              <div className="m-breadcrumb--wrapper m:flex m:items-center m:justify-center">
                <button
                  type="button"
                  className="m-breadcrumb--item"
                  title="Back to the home page"
                  onClick={() => navigate("/")}
                >
                  Home
                </button>
                {BREADCRUMB_SEP}
                <button
                  type="button"
                  className="m-breadcrumb--item"
                  title="All products"
                  onClick={() => navigate("/AllProducts")}
                >
                  All products
                </button>
                {BREADCRUMB_SEP}
                <span className="m-breadcrumb--item-current m-breadcrumb--item">
                  {truncateBreadcrumbTitle(product.title)}
                </span>
              </div>
            </div>
          </nav>
        </div>
        <div className="container-fluid m-section-my m-section-py">
          <QuickViewModal
            variant="page"
            isOpen
            product={product}
            onClose={goBack}
            onAddToCart={addToCart}
          />
        </div>
      </div>
    </main>
  );
}

/** Remount when `:handle` changes so product state never flashes the previous item. */
const ProductDetailPage = (props) => {
  const { handle } = useParams();

  useEffect(() => {
    document.body.classList.add("template-product");
    return () => {
      document.body.classList.remove("template-product");
    };
  }, []);

  return (
    <>
      <ProductDetailPageContent key={handle} handleParam={handle} {...props} />
   
    </>
  );
};

export default ProductDetailPage;
