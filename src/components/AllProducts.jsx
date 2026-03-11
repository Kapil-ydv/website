import React, { useEffect, useState, useCallback } from "react";
import QuickViewModal from "./QuickViewModal";
import ProductGrid from "./ProductGrid";
import CollectionFilters from "./CollectionFilters";
import productsData from "../data/productsData";

const AllProducts = ({ addToCart }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewContent, setQuickViewContent] = useState(null);
  const [isLoadingQuickView, setIsLoadingQuickView] = useState(false);

  const closeQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
    setQuickViewContent(null);
    setIsLoadingQuickView(false);
    document.body.style.overflow = "";
  }, []);

  useEffect(() => {
    // Handle quick view button clicks - simple and direct approach
    const handleQuickViewClick = (event) => {
      // Check if clicked element or its parent is a quick view button
      const button = event.target.closest(".m-product-quickview-button");
      if (!button) return;

      event.preventDefault();
      event.stopPropagation();

      const productHandle = button.getAttribute("data-product-handle");
      const productUrl = button.getAttribute("data-product-url");

      if (!productHandle && !productUrl) {
        console.warn("No product handle or URL found on button");
        return;
      }

      // Get product card element
      const productCard = button.closest(".m-product-card");
      if (!productCard) {
        console.warn("Product card not found");
        return;
      }

      // Extract product information from the card
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

      // Description / material from card
      const descriptionEl = productCard.querySelector(
        ".m-product-card__description",
      );
      const description = descriptionEl?.textContent?.trim() || "";

      // Compare-at price (strikethrough when on sale)
      const saleBlock = productCard.querySelector(".m-price__sale");
      const compareAtEl = saleBlock?.querySelector("s.m-price-item--regular");
      const compareAtPrice = compareAtEl?.textContent?.trim() || "";
      const isOnSale = !!compareAtPrice;

      // Color options from pcard-swatch
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

      // Try multiple sources for product URL
      const cardHref =
        cardLinkEl?.getAttribute("href") ||
        titleLinkEl?.getAttribute("href") ||
        "";

      const resolvedUrlRaw =
        productUrl ||
        cardHref ||
        (productHandle ? `/products/${productHandle}` : "");

      // Normalize URL - remove ../ prefix and ensure it starts with /
      let resolvedUrl = resolvedUrlRaw.replace(/^\.\.\//, "/");
      if (!resolvedUrl.startsWith("/") && !resolvedUrl.startsWith("http")) {
        resolvedUrl = `/${resolvedUrl}`;
      }

      console.log("Product URL sources:", {
        productUrl,
        cardHref,
        productHandle,
        resolvedUrl,
      });

      // Use full product from productsData if found (so Add to cart has variantId)
      const fullProduct = Array.isArray(productsData)
        ? productsData.find((p) => p.handle === productHandle)
        : null;
      setQuickViewProduct(
        fullProduct || {
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
        }
      );
      setIsQuickViewOpen(true);
      setIsLoadingQuickView(true);
      setQuickViewContent(null);
      document.body.style.overflow = "hidden";

      // Fetch product quick view content
      const loadQuickViewContent = async () => {
        try {
  

          // Try to use theme's fetchSection if available
          if (
            typeof window.fetchSection === "function" &&
            window.MinimogSettings
          ) {
            const baseUrl = window.MinimogSettings.base_url || "/";
            let productPath = resolvedUrl;

            // Normalize URL
            if (!productPath.startsWith("/")) {
              productPath = `/${productPath}`;
            }

            // Remove .html extension if present
            productPath = productPath.replace(/\.html$/, "");

            // Construct full URL
            const fullUrl = productPath.startsWith(baseUrl)
              ? productPath
              : `${baseUrl.replace(/\/$/, "")}${productPath}`;

            console.log("Fetching quick view from:", fullUrl);

            try {
              const html = await window.fetchSection("product-quickview", {
                url: fullUrl,
              });

              console.log("fetchSection returned:", html);

              const modalContent = html.querySelector(
                "#MainProduct-quick-view__content",
              );

              if (modalContent) {
                console.log("Quick view content found!");
                setQuickViewContent(modalContent.innerHTML);
                setIsLoadingQuickView(false);

                // Re-execute scripts in the content
                setTimeout(() => {
                  const contentElement = document.querySelector(
                    "#quick-view-modal-content",
                  );
                  if (contentElement) {
                    contentElement
                      .querySelectorAll("script")
                      .forEach((oldScript) => {
                        const newScript = document.createElement("script");
                        Array.from(oldScript.attributes).forEach((attr) => {
                          newScript.setAttribute(attr.name, attr.value);
                        });
                        newScript.appendChild(
                          document.createTextNode(oldScript.innerHTML),
                        );
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                      });
                  }
                }, 100);
                return;
              } else {
                console.warn(
                  "Quick view content not found in fetchSection result",
                );
              }
            } catch (fetchError) {
              console.error("fetchSection error:", fetchError);
            }
          }

          // Fallback: Fetch product page HTML directly
          console.log("Trying direct fetch for:", resolvedUrl);
          let fetchUrl = resolvedUrl;

          // Ensure URL is absolute or relative properly
          if (!fetchUrl.startsWith("http") && !fetchUrl.startsWith("/")) {
            fetchUrl = `/${fetchUrl}`;
          }

          // Remove .html extension
          fetchUrl = fetchUrl.replace(/\.html$/, "");

          const response = await fetch(fetchUrl);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const htmlText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, "text/html");

          // Try multiple selectors for quick view content
          let quickViewSection = doc.querySelector(
            "#MainProduct-quick-view__content",
          );

          if (!quickViewSection) {
            quickViewSection = doc.querySelector('[id*="quick-view"]');
          }

          if (!quickViewSection) {
            // Try to find product form or product info section
            quickViewSection = doc
              .querySelector("form[action*='/cart/add']")
              ?.closest("div");
          }

          if (quickViewSection) {
            console.log("Quick view content found via direct fetch!");
            setQuickViewContent(quickViewSection.innerHTML);
            setIsLoadingQuickView(false);
          } else {
            console.warn("Quick view section not found in HTML");
            throw new Error("Quick view content not found");
          }
        } catch (error) {
          console.error("Error loading quick view:", error);
          setIsLoadingQuickView(false);
          // Keep modal open with basic info
        }
      };

      loadQuickViewContent().catch(() => {
        setIsLoadingQuickView(false);
      });
    };

    // Attach event listener using event delegation
    document.addEventListener("click", handleQuickViewClick, true);

    // Handle Escape key to close modal
    const handleEscape = (event) => {
      if (event.key === "Escape" && isQuickViewOpen) {
        closeQuickView();
      }
    };
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleQuickViewClick, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isQuickViewOpen, closeQuickView]);

  return (
    <>
      <section
        className="facest-filters-section"
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
            >
              <div className="m-sidebar--content">
                <h3 className="m-sidebar--title">Filters</h3>
                <div className="m-sidebar--close xl:m:hidden">
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
                </div>
                <div className="m-filter--wrapper m:flex m:flex-col m-storefront--enabled">
                  <link
                    href="../cdn/shop/t/10/assets/component-image-card0d9f.css?v=38157965861074991861739161024"
                    rel="stylesheet"
                    type="text/css"
                    media="all"
                  />
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
                    <button className="m-sidebar--open m:flex m:items-center">
                      <span>Filter</span>
                      <svg
                        className="m-svg-icon--small"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path d="M441.9 167.3l-19.8-19.8c-4.7-4.7-12.3-4.7-17 0L224 328.2 42.9 147.5c-4.7-4.7-12.3-4.7-17 0L6.1 167.3c-4.7 4.7-4.7 12.3 0 17l209.4 209.4c4.7 4.7 12.3 4.7 17 0l209.4-209.4c4.7-4.7 4.7-12.3 0-17z" />
                      </svg>
                    </button>
                    <button className="m-sortby--open md:m:hidden m:flex m:items-center">
                      <span data-sortby-option>Best selling</span>
                      <svg
                        className="m-svg-icon--small"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                      >
                        <path d="M441.9 167.3l-19.8-19.8c-4.7-4.7-12.3-4.7-17 0L224 328.2 42.9 147.5c-4.7-4.7-12.3-4.7-17 0L6.1 167.3c-4.7 4.7-4.7 12.3 0 17l209.4 209.4c4.7 4.7 12.3 4.7 17 0l209.4-209.4c4.7-4.7 4.7-12.3 0-17z" />
                      </svg>
                    </button>
                  </div>
                  <div className="m-toolbar--right m:flex m:flex-1 m:items-center m:justify-end md:m:justify-between">
                    <div
                      className="m-toolbar--sortby m:hidden md:m:block"
                      data-toolbar-sorting
                    >
                      <div className="m-select-component">
                        <select
                          name="sort_by"
                          aria-describedby="a11y-refresh-page-message"
                          className="js-selectNative"
                        >
                          <option value="manual" data-index={0}>
                            Featured
                          </option>
                          <option
                            value="best-selling"
                            selected="selected"
                            data-index={1}
                          >
                            Best selling
                          </option>
                          <option value="title-ascending" data-index={2}>
                            Alphabetically, A-Z
                          </option>
                          <option value="title-descending" data-index={3}>
                            Alphabetically, Z-A
                          </option>
                          <option value="price-ascending" data-index={4}>
                            Price, low to high
                          </option>
                          <option value="price-descending" data-index={5}>
                            Price, high to low
                          </option>
                          <option value="created-ascending" data-index={6}>
                            Date, old to new
                          </option>
                          <option value="created-descending" data-index={7}>
                            Date, new to old
                          </option>
                        </select>
                        <div
                          className="m-select-custom js-selectCustom"
                          aria-hidden="true"
                        >
                          <div className="m-select-custom--trigger">
                            <span className="m-select-custom--trigger-text" />
                            <span className="m-select-custom--trigger-icon">
                              <svg
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                              >
                                <path d="M441.9 167.3l-19.8-19.8c-4.7-4.7-12.3-4.7-17 0L224 328.2 42.9 147.5c-4.7-4.7-12.3-4.7-17 0L6.1 167.3c-4.7 4.7-4.7 12.3 0 17l209.4 209.4c4.7 4.7 12.3 4.7 17 0l209.4-209.4c4.7-4.7 4.7-12.3 0-17z" />
                              </svg>
                            </span>
                          </div>
                          <div className="m-select-custom--options m-select-custom--options-">
                            <div
                              className="m-select-custom--option"
                              data-value="manual"
                            >
                              Featured
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="best-selling"
                            >
                              Best selling
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="title-ascending"
                            >
                              Alphabetically, A-Z
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="title-descending"
                            >
                              Alphabetically, Z-A
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="price-ascending"
                            >
                              Price, low to high
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="price-descending"
                            >
                              Price, high to low
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="created-ascending"
                            >
                              Date, old to new
                            </div>
                            <div
                              className="m-select-custom--option"
                              data-value="created-descending"
                            >
                              Date, new to old
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="m-toolbar--column-switcher m:flex">
                      <button
                        className="m:flex m-tooltip m-tooltip--top"
                        data-column={1}
                        aria-label="1-column"
                      >
                        <svg
                          className="m-svg-icon--small"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 12.5 9.5"
                        >
                          <path
                            id="Rectangle"
                            d="M12.5.75a.76.76 0 01-.75.75h-11A.76.76 0 010 .75.76.76 0 01.75 0h11a.76.76 0 01.75.75z"
                            className="cls-1"
                          />
                          <path
                            id="Rectangle-2"
                            d="M12.5 4.75a.76.76 0 01-.75.75h-11A.76.76 0 010 4.75.76.76 0 01.75 4h11a.76.76 0 01.75.75z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-3"
                            d="M12.5 8.75a.76.76 0 01-.75.75h-11A.76.76 0 010 8.75.76.76 0 01.75 8h11a.76.76 0 01.75.75z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                        </svg>
                        <span className="m-tooltip__content">List</span>
                      </button>
                      <button
                        className="m:flex m-tooltip m-tooltip--top"
                        data-column={2}
                        aria-label="2-column"
                      >
                        <svg
                          className="m-svg-icon--small"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 5.5 12.5"
                        >
                          <path
                            id="Rectangle"
                            d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                            className="cls-1"
                          />
                          <path
                            id="Rectangle-2"
                            d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                        </svg>
                        <span className="m-tooltip__content">2 columns</span>
                      </button>
                      <button
                        className="m:hidden md:m:flex m-tooltip m-tooltip--top"
                        data-column={3}
                        aria-label="3-column"
                      >
                        <svg
                          className="m-svg-icon--small"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 9.5 12.5"
                        >
                          <path
                            id="Rectangle"
                            d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                            className="cls-1"
                          />
                          <path
                            id="Rectangle-2"
                            d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-3"
                            d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                        </svg>
                        <span className="m-tooltip__content">3 columns</span>
                      </button>
                      <button
                        className="m:hidden md:m:flex m-tooltip m-tooltip--top"
                        data-column={4}
                        aria-label="4-column"
                      >
                        <svg
                          className="m-svg-icon--small"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 13.5 12.5"
                        >
                          <path
                            id="Rectangle"
                            d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                            className="cls-1"
                          />
                          <path
                            id="Rectangle-2"
                            d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-3"
                            d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-4"
                            d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                        </svg>
                        <span className="m-tooltip__content">4 columns</span>
                      </button>
                      <button
                        className="m:hidden lg:m:flex m-tooltip m-tooltip--top"
                        data-column={5}
                        aria-label="5-column"
                      >
                        <svg
                          className="m-svg-icon--small"
                          fill="currentColor"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 17.5 12.5"
                        >
                          <path
                            id="Rectangle"
                            d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                            className="cls-1"
                          />
                          <path
                            id="Rectangle-2"
                            d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-3"
                            d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-4"
                            d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                          <path
                            id="Rectangle-5"
                            d="M16.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"
                            className="cls-1"
                            data-name="Rectangle"
                          />
                        </svg>
                        <span className="m-tooltip__content">5 columns</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="ActiveFacets"
                className="m-active-facets m:flex m:flex-wrap m:items-center m-scroll-trigger animate--fade-in-up"
              ></div>
              <ProductGrid products={productsData} addToCart={addToCart} />
              <div className="m-collection--pagination m:text-center m-scroll-trigger animate--fade-in-up">
                <div className="m-pagination">
                  <span className="page current">1</span>{" "}
                  <span className="page">
                    <a href="all-products4658.html?page=2" title>
                      2
                    </a>
                  </span>{" "}
                  <span className="page">
                    <a href="all-products9ba9.html?page=3" title>
                      3
                    </a>
                  </span>{" "}
                  <span className="deco">…</span>{" "}
                  <span className="page">
                    <a href="all-products9683.html?page=18" title>
                      18
                    </a>
                  </span>{" "}
                  <span className="next">
                    <a href="all-products4658.html?page=2" title>
                      »
                    </a>
                  </span>
                </div>
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
      <m-recently-viewed
        id="m-section--template--15265873330281__recent-viewed"
        data-section-type="recently-viewed"
        data-section-id="template--15265873330281__recent-viewed"
        data-products-to-show={8}
        data-products-per-row={5}
        data-enable-slider="true"
        data-mobile-disable-slider="false"
        data-show-pagination="false"
        data-show-navigation="false"
        data-url="/search?section_id=template--15265873330281__recent-viewed&type=product&q="
      >
        <div className="container-fluid m-section-my m-section-py">
          <div className="m-section__header m:text-left">
            <h2 className="m-section__heading h3 m-scroll-trigger animate--fade-in-up">
              Recently Viewed Products
            </h2>
          </div>
          <div className="m-product-list m-slider-control-hover-inside m:relative m-mixed-layout ">
            <div className="m-mixed-layout__wrapper swiper-container">
              <div
                className="m-mixed-layout__inner m:grid m-cols-5 m:grid-2-cols md:m:grid-3-cols lg:m:grid-3-cols xl:m:grid-5-cols swiper-wrapper"
                data-products-container
              />
            </div>
            <div className="m-slider-controls m-slider-controls--bottom-center m-slider-controls--absolute m:hidden">
              <div className="m-slider-controls__wrapper"></div>
            </div>
          </div>
        </div>
      </m-recently-viewed>

      <QuickViewModal
        isOpen={isQuickViewOpen}
        product={quickViewProduct}
        content={quickViewContent}
        loading={isLoadingQuickView}
        onClose={closeQuickView}
        onAddToCart={addToCart}
      />
    </>
  );
};

export default AllProducts;
