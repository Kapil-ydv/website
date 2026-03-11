import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MSelect from "./Common/MSelect";
import QuickViewModal from "./QuickViewModal";
import productsData from "../data/productsData";

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const Product = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [page] = useState(1); // current page (chunk)
  const [limit] = useState(20); // items per chunk
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Fetch homepage grid products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/products?page=${page}&limit=${limit}`,
        );
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch products", res.status);
          return;
        }
        const data = await res.json();
        // API returns { items: [...], pagination: {...} }
        setProducts(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching products", err);
      }
    };

    fetchProducts();
  }, [page, limit]);

  const openQuickView = (cardProduct) => {
    if (!cardProduct) return;

    const handle =
      cardProduct.href &&
      cardProduct.href.replace(/^.*\//, "").replace(/\.html$/, "");

    const fullProduct =
      handle && Array.isArray(productsData)
        ? productsData.find((p) => p.handle === handle)
        : null;

    if (fullProduct) {
      setQuickViewProduct(fullProduct);
    } else {
      const mainImage = {
        src: cardProduct.mainImage?.src,
        srcSet: cardProduct.mainImage?.srcSet,
      };
      const hoverImage = cardProduct.hoverImage && {
        src: cardProduct.hoverImage?.src,
        srcSet: cardProduct.hoverImage?.srcSet,
      };

      setQuickViewProduct({
        productId: cardProduct.id,
        variantId: cardProduct.id,
        handle,
        title: cardProduct.name,
        url: `/${cardProduct.href}`,
        productUrl: `/${cardProduct.href}`,
        mainImage,
        hoverImage,
        priceRegular: cardProduct.price?.regular,
        priceSale: cardProduct.price?.sale,
        onSale: cardProduct.price?.onSale,
        description: cardProduct.description,
        colorOptions: (cardProduct.colors || []).map((c) => ({
          value: c.name,
          label: c.name,
          color: c.backgroundColor,
        })),
        atcLabel: "Select options",
        tag: null,
        animationOrder: 1,
        firstImageLoading: "lazy",
        firstImagePriority: "low",
      });
    }

    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  return (
    <>
      <section
          id="m-section--template--15265873625193__162251092958fcda7c"
          className="m-section m-product-tabs m:block sf-home__product-tab m-product-tabs--select m-gradient m-color-default"
        >
          <m-product-tabs
            id="template--15265873625193__162251092958fcda7c"
            data-section-type="product-tabs"
            data-enable-slider="false"
            data-mobile-disable-slider="false"
            data-button-type="link"
          >
            <div className="container-fluid m-section-my m-section-py">
              <div className="m-section__header m:text-center">
                <div className="m-section__heading  m-scroll-trigger animate--fade-in-up">
                  <h2 className="h3">You are in&nbsp;</h2>
                  <MSelect
                    name="collection"
                    defaultValue="0"
                    options={[
                      { value: "0", label: "best sellers" },
                      { value: "1", label: "new arrivals" },
                    ]}
                  />
                </div>
              </div>

              <div className="m-product-tabs__content">
                <div
                  id="product-tabs-162251092958fcda7c-0"
                  data-index={0}
                  data-url="/zh/collections/best-sellers-fashion-2024"
                  data-total-pages={1}
                  data-page={1}
                data-total-items={products.length}
                  data-enable-slide="false"
                >
                  <div className="m-product-list m-slider-control-hover-inside m-mixed-layout  m-mixed-layout--mobile-grid m-mixed-layout--mobile-scroll">
                    <div className="m-mixed-layout__wrapper">
                      <div
                        className="m-mixed-layout__inner m:grid m:grid-2-cols md:m:grid-3-cols lg:m:grid-4-cols xl:m:grid-5-cols"
                        data-products-container
                      >
                      {products.map((product, index) => (
                        <div key={product.id} className="m:column">
                          <div
                            className="m-product-card m-product-card--style-1 m-product-card--show-second-img m-scroll-trigger animate--fade-in-up"
                            style={{
                              "--animation-order": String(index + 1),
                            }}
                          >
                            <div className="m-product-card__media">
                              <a
                                className="m-product-card__link m:block m:w-full"
                                href={product.href}
                                aria-label={product.name}
                              >
                                <div className="m-product-card__main-image">
                                  <img
                                    src={product.mainImage.src}
                                    alt={product.mainImage.alt}
                                    srcSet={product.mainImage.srcSet}
                                    width={product.mainImage.width}
                                    height={product.mainImage.height}
                                    loading="lazy"
                                    fetchPriority="low"
                                    className="m:w-full m:h-full"
                                    sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                                  />
                                </div>

                                {product.hoverImage && (
                                  <div className="m-product-card__hover-image">
                                    <img
                                      src={product.hoverImage.src}
                                      alt={product.hoverImage.alt}
                                      srcSet={product.hoverImage.srcSet}
                                      width={product.hoverImage.width}
                                      height={product.hoverImage.height}
                                      loading="lazy"
                                      fetchPriority="low"
                                      className="m:w-full m:h-full"
                                      sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                                    />
                                  </div>
                                )}
                              </a>

                              {/* Hover top-right actions: wishlist + quick view (desktop only, UI only) */}
                              <div className="m-product-card__action m-product-card__action--top m-product-card__addons m:display-flex">
                                {/* Wishlist icon */}
                                <button
                                  type="button"
                                  className="m-tooltip m-button--icon m-wishlist-button m-tooltip--left m-tooltip--style-1"
                                  aria-label="Add to wishlist"
                                >
                                  <span className="m-tooltip-icon m:block">
                                    <svg
                                      className="m-svg-icon--medium"
                                      viewBox="0 0 15 13"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M13.1929 1.1123C13.8492 1.67741 14.2867 2.35189 14.5054 3.13574C14.7242 3.90137 14.7333 4.63965 14.5328 5.35059C14.3323 6.06152 13.9859 6.6722 13.4937 7.18262L8.70857 12.0498C8.4169 12.3415 8.07055 12.4873 7.66951 12.4873C7.26846 12.4873 6.92211 12.3415 6.63044 12.0498L1.84529 7.18262C1.3531 6.6722 1.00675 6.06152 0.806225 5.35059C0.605704 4.62142 0.614819 3.87402 0.833569 3.1084C1.05232 2.34277 1.48982 1.67741 2.14607 1.1123C2.92992 0.456055 3.8505 0.173503 4.90779 0.264648C5.98331 0.337565 6.90388 0.756836 7.66951 1.52246C8.43513 0.756836 9.34659 0.337565 10.4039 0.264648C11.4794 0.173503 12.4091 0.456055 13.1929 1.1123Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </span>
                                  <span className="m-tooltip__content m-wishlist-button-text">
                                    Add to wishlist
                                  </span>
                                </button>

                                {/* Quick view icon */}
                                <button
                                  type="button"
                                  className="m-tooltip m-button--icon m-product-quickview-button m-spinner-button m-tooltip--left m-tooltip--style-1"
                                  data-product-url={product.href}
                                  aria-label="Quick view"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openQuickView(product);
                                  }}
                                >
                                  <span className="m-spinner-icon">
                                    <svg
                                      className="animate-spin m-svg-icon--medium"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        cx={12}
                                        cy={12}
                                        r={10}
                                        stroke="none"
                                        strokeWidth={4}
                                      />
                                      <path
                                        fill="none"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      />
                                    </svg>
                                  </span>
                                  <span className="m-tooltip-icon m:block">
                                    <svg
                                      className="m-svg-icon--medium"
                                      viewBox="0 0 17 11"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M8.64216 2.3623C9.49893 2.3623 10.219 2.66309 10.8023 3.26465C11.4039 3.84798 11.7047 4.56803 11.7047 5.4248C11.7047 6.26335 11.4039 6.9834 10.8023 7.58496C10.219 8.16829 9.49893 8.45996 8.64216 8.45996C7.80362 8.45996 7.08357 8.16829 6.48201 7.58496C5.89867 6.9834 5.60701 6.26335 5.60701 5.4248C5.60701 5.13314 5.64346 4.85059 5.71638 4.57715C5.95336 4.70475 6.19945 4.76855 6.45466 4.76855C6.87393 4.76855 7.2294 4.62272 7.52107 4.33105C7.83096 4.02116 7.98591 3.65658 7.98591 3.2373C7.98591 2.9821 7.92211 2.736 7.79451 2.49902C8.06794 2.40788 8.3505 2.3623 8.64216 2.3623ZM16.4351 5.01465C16.4898 5.14225 16.5172 5.27897 16.5172 5.4248C16.5172 5.57064 16.4898 5.70736 16.4351 5.83496C15.6695 7.29329 14.594 8.46908 13.2086 9.3623C11.8232 10.2373 10.301 10.6748 8.64216 10.6748C7.54841 10.6748 6.49112 10.4743 5.47029 10.0732C4.46768 9.65397 3.57445 9.08887 2.7906 8.37793C2.00675 7.64876 1.35961 6.80111 0.849194 5.83496C0.794507 5.70736 0.767163 5.57064 0.767163 5.4248C0.767163 5.27897 0.794507 5.14225 0.849194 5.01465C1.61482 3.55632 2.69034 2.38965 4.07576 1.51465C5.46117 0.621419 6.98331 0.174805 8.64216 0.174805C10.301 0.174805 11.8232 0.621419 13.2086 1.51465C14.594 2.38965 15.6695 3.55632 16.4351 5.01465Z"
                                        fill="currentColor"
                                      />
                                    </svg>
                                  </span>
                                  <span className="m-tooltip__content " data-atc-text data-revert-text>
                                    Quick view
                                  </span>
                                </button>
                              </div>

                              {/* Desktop select options button below image */}
                              <div className="m-product-card__action m:hidden lg:m:block">
                                <div className="m-product-card__action-wrapper">
                                  <a
                                    className="m:w-full m-button m-button--white"
                                    href={product.href}
                                    aria-label="Select options"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openQuickView(product);
                                    }}
                                  >
                                    <span>Select options</span>
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="m-product-card__content m:text-left">
                              <div className="m-product-card__info">
                                <h3 className="m-product-card__title">
                                  <a
                                    href={product.href}
                                    className="m-product-card__name"
                                  >
                                    {product.name}
                                  </a>
                                </h3>

                                <div className="m-product-card__price">
                                  <div
                                    className={`m-price m:inline-flex m:items-center m:flex-wrap${
                                      product.price.onSale
                                        ? " m-price--on-sale"
                                        : ""
                                    }`}
                                  >
                                    <div className="m-price__regular">
                                      <span className="m:visually-hidden m:visually-hidden--inline">
                                        正常价格
                                      </span>
                                      <span className="m-price-item m-price-item--regular ">
                                        {product.price.regular}
                                      </span>
                                    </div>

                                    {product.price.onSale && (
                                    <div className="m-price__sale">
                                      <span className="m:visually-hidden m:visually-hidden--inline">
                                        销售价格
                                      </span>
                                      <span className="m-price-item m-price-item--sale m-price-item--last ">
                                          {product.price.sale}
                                      </span>
                                      <span className="m:visually-hidden m:visually-hidden--inline">
                                        正常价格
                                      </span>
                                      <s className="m-price-item m-price-item--regular">
                                          {product.price.regular}
                                      </s>
                                    </div>
                                    )}
                                      </div>
                                    </div>

                                {product.colors?.length ? (
                                  <div className="m-product-option m-product-option--color m:flex-wrap m:items-center m:justify-start">
                                    <div className="m-product-option--content m:inline-flex m:flex-wrap">
                                      {product.colors.map((color) => (
                                        <div
                                          key={color.name}
                                          className="m-product-option--node m-tooltip m-tooltip--top"
                                        >
                                        <div className="m-product-option--swatch">
                                          <label
                                            className="m-product-option--node__label"
                                            data-option-position={1}
                                            data-option-type="color"
                                              data-value={color.name}
                                            style={{
                                                backgroundColor:
                                                  color.backgroundColor,
                                            }}
                                          >
                                              {color.name}
                                          </label>
                                        </div>
                                        <span className="m-tooltip__content">
                                            {color.name}
                                        </span>
                                      </div>
                                      ))}
                                        </div>
                                      </div>
                                ) : null}
                                        </div>

                              <div className="m-product-card__content-footer">
                                <div className="m-product-card__description">
                                  {product.description}
                                </div>
                              </div>
                              </div>
                                </div>
                              </div>
                      ))}
                            </div>
                          </div>
                        </div>

                  <div className="m-product-tabs__load-more m:text-center m-scroll-trigger animate--fade-in-up">
                    <Link
                      className="m-button m-button--secondary"
                      to="/AllProducts"
                    >
                      <span>Shop All Products</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </m-product-tabs>
        </section>
        <QuickViewModal
          isOpen={isQuickViewOpen}
          product={quickViewProduct}
          onClose={closeQuickView}
          onAddToCart={addToCart}
        />
    </>
  );
};

export default Product;
