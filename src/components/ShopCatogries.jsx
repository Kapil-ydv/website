import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopCategories } from "../redux/actions";

const ALL_PRODUCTS_PATH = "/AllProducts";

/** Mobile: card width; horizontal centering uses measured scrollport (see useLayoutEffect) */
const MOBILE_CARD_W = "calc(64vw - 28px)";

const isRootCategory = (c) =>
  c == null || c.parentId == null || c.parentId === undefined;

const ShopCatogries = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.shopCategories || []);

  // Carousel shows top-level categories only; subcategories filter with the parent.
  const rootCategories = useMemo(() => {
    const roots = categories.filter(isRootCategory);
    roots.sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
        (Number(a.id) || 0) - (Number(b.id) || 0),
    );
    return roots;
  }, [categories]);

  const categoryIdQuery = (category) => {
    const id = category.id;
    const childIds = categories
      .filter((c) => Number(c.parentId) === Number(id))
      .map((c) => c.id);
    if (!childIds.length) return String(id);
    return [id, ...childIds].join(",");
  };

  // We use the API response directly. Expected shape:
  // { title, count, image, parentId? }
  const totalSlides = rootCategories.length;
  const getPerView = () => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 1280) return 5;
    if (window.innerWidth >= 768) return 4;
    return 1;
  };

  const [perView, setPerView] = useState(getPerView);
  const [page, setPage] = useState(0); // page = starting index
  const isMobile = perView === 1;
  const scrollRef = useRef(null);
  const scrollInnerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchShopCategories());
  }, [dispatch]);

  useEffect(() => {
    const updateLayout = () => {
      setPerView(getPerView());
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  /* Center first/last slides in the real scrollport (100vw padding breaks inside container-full). */
  useLayoutEffect(() => {
    const wrap = scrollRef.current;
    const inner = scrollInnerRef.current;
    if (!wrap || !inner) return undefined;

    const clear = () => {
      inner.style.paddingLeft = "";
      inner.style.paddingRight = "";
      wrap.style.scrollPaddingLeft = "";
      wrap.style.scrollPaddingRight = "";
    };

    if (!isMobile || totalSlides === 0) {
      clear();
      return undefined;
    }

    const syncPad = () => {
      const slide = wrap.querySelector(".swiper-slide");
      if (!slide) {
        clear();
        return;
      }
      const wrapW = wrap.clientWidth;
      const slideW = slide.getBoundingClientRect().width;
      const pad = Math.max(12, Math.round((wrapW - slideW) / 2));
      inner.style.paddingLeft = `${pad}px`;
      inner.style.paddingRight = `${pad}px`;
      wrap.style.scrollPaddingLeft = `${pad}px`;
      wrap.style.scrollPaddingRight = `${pad}px`;
    };

    syncPad();
    requestAnimationFrame(syncPad);
    const ro = new ResizeObserver(syncPad);
    ro.observe(wrap);
    window.addEventListener("resize", syncPad);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncPad);
      clear();
    };
  }, [isMobile, totalSlides, rootCategories.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;

    const updatePageFromScroll = () => {
      if (totalSlides <= 0) {
        setPage(0);
        return;
      }
      const maxScroll = Math.max(el.scrollWidth - el.clientWidth, 0);
      if (maxScroll === 0) {
        setPage(0);
        return;
      }
      const ratio = el.scrollLeft / maxScroll;
      const current = Math.round(ratio * Math.max(totalSlides - 1, 0));
      setPage(current);
    };

    updatePageFromScroll();
    el.addEventListener("scroll", updatePageFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", updatePageFromScroll);
  }, [totalSlides, perView]);

  const scrollByCard = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    let delta;
    if (isMobile) {
      const slide = el.querySelector(".swiper-slide");
      const gap = 12;
      delta = slide
        ? slide.getBoundingClientRect().width + gap
        : el.clientWidth * 0.66;
    } else {
      delta = el.clientWidth / Math.max(perView, 1);
    }
    el.scrollBy({
      left: direction * delta,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        .shop-categories-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .shop-categories-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Pure white section + cards (no theme gradient / no dark overlays) */
        #m-collection-list-template--15265873625193__16225316461d1cff80.m-section {
          background: #ffffff !important;
          background-image: none !important;
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__container,
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__wrapper,
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__content,
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-mixed-layout,
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-mixed-layout__wrapper {
          background: #ffffff;
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__header-container {
          background: #ffffff;
        }

        #m-collection-list-template--15265873625193__16225316461d1cff80 .shop-cat-card-surface {
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #fff;
          /* Tight shadow only — no large blur / no spread */
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.07);
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
          transform: translateZ(0);
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .shop-cat-card-surface:hover {
          border-color: #ebebeb;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.09);
          transform: translateY(-2px) translateZ(0);
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-hover-box__wrapper {
          background: #ffffff;
        }

        /* Footer: title + arrow in a row — long labels wrap/clamp without overlapping the button */
        #m-collection-list-template--15265873625193__16225316461d1cff80
          .m-collection-card--inside
          .m-collection-card__info {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          /* Tighter footer = smaller card; image box (--aspect-ratio) unchanged */
          padding: 6px 8px 8px !important;
          margin-top: 0 !important;
          border-top: none !important;
          background: #ffffff !important;
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-card__title {
          margin: 0 !important;
          flex: 1 1 auto !important;
          min-width: 0 !important;
          font-size: 0.8125rem !important;
          line-height: 1.25 !important;
        }
        @media screen and (min-width: 768px) {
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-card__title {
            font-size: 0.9375rem !important;
            line-height: 1.35 !important;
          }
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-card__link {
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          word-break: break-word !important;
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-card__info .shop-cat-card-cta {
          flex: 0 0 auto !important;
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          min-height: 32px !important;
          max-width: 32px !important;
          max-height: 32px !important;
          padding: 0 !important;
          margin: 0 !important;
          border-radius: 50% !important;
          border: 1px solid #e5e7eb !important;
          background: #ffffff !important;
          color: #111827 !important;
          box-shadow: none !important;
        }
        #m-collection-list-template--15265873625193__16225316461d1cff80
          .m-collection-card__info
          .shop-cat-card-cta:hover,
        #m-collection-list-template--15265873625193__16225316461d1cff80
          .m-collection-card__info
          .shop-cat-card-cta:focus-visible {
          width: 32px !important;
          height: 32px !important;
          min-height: 32px !important;
          background: #f8fafc !important;
          border-color: #d1d5db !important;
          color: #111827 !important;
        }

        /* Horizontal scroll: theme uses 130vw on .m-collection-list__content — breaks native overflow */
        @media screen and (max-width: 767px) {
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__content-container.container-full {
            padding-left: 0 !important;
            padding-right: 0 !important;
            max-width: none !important;
            width: 100% !important;
          }
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-collection-list__content {
            width: 100% !important;
            max-width: 100% !important;
            margin-right: 0 !important;
            margin-left: 0 !important;
          }
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-mixed-layout {
            overflow-x: visible;
            overflow-y: visible;
          }
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-mixed-layout__wrapper {
            width: 100%;
            max-width: 100%;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            overscroll-behavior-x: contain;
            touch-action: pan-x pinch-zoom;
          }
          #m-collection-list-template--15265873625193__16225316461d1cff80 .m-mixed-layout__inner.swiper-wrapper {
            width: max-content;
            min-width: min(100%, 100vw);
          }
          /* Heading + fraction arrows: left; only the card strip stays visually centered */
          #m-collection-list-template--15265873625193__16225316461d1cff80
            .m-collection-list__header-container
            .m-section__header {
            text-align: left !important;
          }
          #m-collection-list-template--15265873625193__16225316461d1cff80
            .m-collection-list__header-container
            .m-slider-controls__wrapper {
            justify-content: flex-start !important;
          }
        }
      `}</style>
      <section
        className="m-section m-collection-list m-collection-list--grid sf-home__collection-list m-collection-list--template--15265873625193__16225316461d1cff80 m-color-default"
        data-container="container-fluid"
        data-hover-effect="scaling-up"
        data-section-id="template--15265873625193__16225316461d1cff80"
        data-section-type="collection-list"
        id="m-collection-list-template--15265873625193__16225316461d1cff80"
        style={{
          "--section-padding-bottom": "0px",
          "--section-padding-top": isMobile ? "56px" : "100px",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          className="m-collection-list__container m-section-my m-section-py"
          style={{
            "--column-gap": "40px",
            "--column-gap-mobile": "16px",
            "--items": String(isMobile ? 1 : perView),
            "--row-gap": "40px",
            "--row-gap-mobile": "16px",
          }}
        >
          <m-collection-list
            className="m-collection-list__wrapper m:block"
            data-autoplay="false"
            data-autoplay-speed="4"
            data-enable-slider="true"
            data-expanded="true"
            data-gutter="40"
            data-items={isMobile ? 1 : perView}
            data-mobile-disable-slider="false"
            data-mobile-hide-controls="false"
            data-pagination-type="fraction"
            data-show-controls="true"
            data-total={totalSlides}
          >
            <div
              className="m-collection-list__header-container container-fluid"
              style={{ marginBottom: isMobile ? 12 : 0 }}
            >
              <div className="m-section__header m:text-left">
                <h2
                  className="m-section__heading h3 m-scroll-trigger animate--fade-in-up"
                  style={{
                    fontSize: isMobile ? "1.4rem" : undefined,
                    lineHeight: isMobile ? 1.2 : undefined,
                    marginBottom: isMobile ? 10 : undefined,
                  }}
                >
                  Shop by Categories
                </h2>
                <div className="m-collection-list__controls m-collection-list__controls--top">
                  <div className="m-slider-controls m-slider-controls--bottom-left m-slider-controls--show-nav m-slider-controls--show-pagination m-slider-controls--pagination-fraction m-slider-controls--group ">
                    <div className="m-slider-controls__wrapper">
                      <button
                        aria-label="Previous"
                        type="button"
                        className="m-slider-controls__button m-slider-controls__button-prev swiper-button-prev "
                        onClick={() => scrollByCard(-1)}
                        style={{
                          width: isMobile ? 36 : undefined,
                          height: isMobile ? 36 : undefined,
                        }}
                      >
                        <svg
                          fill="none"
                          height="20"
                          viewBox="0 0 20 20"
                          width="20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M12.5 15L7.5 10L12.5 5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                          />
                        </svg>
                      </button>
                      <div className="swiper-pagination m:w-full m-dot-circle m-dot-circle--dark">
                        <span style={{ fontSize: isMobile ? 13 : undefined }}>
                          {totalSlides > 0
                            ? `${page + 1} / ${totalSlides}`
                            : "0 / 0"}
                        </span>
                      </div>
                      <button
                        aria-label="Next"
                        type="button"
                        className="m-slider-controls__button m-slider-controls__button-next swiper-button-next "
                        onClick={() => scrollByCard(1)}
                        style={{
                          width: isMobile ? 36 : undefined,
                          height: isMobile ? 36 : undefined,
                        }}
                      >
                        <svg
                          fill="none"
                          height="20"
                          viewBox="0 0 20 20"
                          width="20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.5 15L12.5 10L7.5 5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="m-collection-list__content-container container-full">
              <div className="m-collection-list__content">
                <div className="m-mixed-layout">
                  <div
                    ref={scrollRef}
                    className="m-mixed-layout__wrapper swiper-container swiper--equal-height shop-categories-scrollbar-hide"
                    style={{
                      overflowX: "auto",
                      overflowY: "hidden",
                      scrollSnapType: "x mandatory",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    <div
                      ref={scrollInnerRef}
                      className="m-mixed-layout__inner swiper-wrapper"
                      style={{
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: isMobile ? 12 : 14,
                        ...(isMobile
                          ? { paddingTop: 0, paddingBottom: 0 }
                          : { padding: "0 12px" }),
                      }}
                    >
                      {rootCategories.map((category, index) => (
                        <div
                          key={category.id ?? index}
                          className="m:column swiper-slide"
                          style={{
                            flex: isMobile
                              ? `0 0 ${MOBILE_CARD_W}`
                              : `0 0 ${100 / Math.max(1, perView)}%`,
                            maxWidth: isMobile
                              ? MOBILE_CARD_W
                              : `${100 / Math.max(1, perView)}%`,
                            flexShrink: 0,
                            scrollSnapAlign: isMobile ? "center" : "start",
                          }}
                        >
                          <div
                            className="m-collection-card m-collection-card--inside m-scroll-trigger animate--fade-in-up shop-cat-card-surface"
                            data-cascade=""
                            style={{
                              "--animation-order":
                                category.animationOrder ?? String(index + 1),
                            }}
                          >
                            <div className="m-collection-card__inner m-hover-box m-hover-box--scale-up">
                              <Link
                                aria-label={category.ariaLabel ?? category.title}
                                className="m-collection-card__image m:block m:w-full m:blocks-radius"
                                to={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(category)}`}
                              >
                                <div
                                  className={
                                    "m-hover-box__wrapper" || undefined
                                  }
                                >
                                  <div
                                    className="m-image"
                                    style={{
                                      "--aspect-ratio": isMobile ? "1/1" : "5/6",
                                    }}
                                  >
                                    <img
                                      alt={category.title}
                                      className="m:w-full m:h-full"
                                      fetchPriority="low"
                                      height={1269}
                                      loading="lazy"
                                      sizes={
                                        isMobile
                                          ? "66vw"
                                          : "(min-width: 1280px) 19vw, (min-width: 990px) calc((100vw - 120px) / 4), (min-width: 768px) calc((100vw - 100px) / 3), 50vw"
                                      }
                                      src={category.image}
                                      style={{
                                        objectFit: "cover",
                                        objectPosition: "center",
                                      }}
                                      width={906}
                                    />
                                  </div>
                                </div>
                              </Link>
                              <div className="m-collection-card__info m:text-left">
                                <h3
                                  className="m-collection-card__title"
                                  style={{
                                    marginTop: isMobile ? 0 : undefined,
                                  }}
                                >
                                  <Link
                                    className="m-collection-card__link m:block"
                                    to={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(category)}`}
                                  >
                                    {category.title}
                                  </Link>
                                </h3>
                                <Link
                                  aria-label={
                                    category.ctaAriaLabel ??
                                    `Shop category ${category.title}`
                                  }
                                  className="m-button m-button--white m:justify-center m:items-center shop-cat-card-cta"
                                  to={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(category)}`}
                                >
                                  <svg
                                    fill="none"
                                    height="13"
                                    viewBox="0 0 14 13"
                                    width="14"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M6.78594.789062c.16406-.145833.31901-.145833.46484 0L12.9656 6.53125c.1641.14583.1641.29167 0 .4375L7.25078 12.7109c-.14583.1459-.30078.1459-.46484 0l-.54688-.5468c-.05469-.0547-.08203-.1276-.08203-.2188 0-.0911.02734-.1732.08203-.2461l4.23824-4.23826H1.15312c-.218745 0-.32812-.10938-.32812-.32813v-.76562c0-.21875.109375-.32813.32812-.32813h9.32418L6.23906 1.80078c-.14583-.16406-.14583-.31901 0-.46484l.54688-.546878z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m-collection-list>
        </div>
      </section>
    </>
  );
};

export default ShopCatogries;
