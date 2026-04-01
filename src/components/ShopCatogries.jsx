import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchShopCategories } from "../redux/actions";

const ALL_PRODUCTS_PATH = "/AllProducts";

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
    if (window.innerWidth >= 768) return 4; // desktop/tablet: 4 cards visible
    return 1; // mobile: 1 card visible
  };

  const [perView, setPerView] = useState(getPerView);
  const [page, setPage] = useState(0); // page = starting index
  const isMobile = perView === 1;
  const scrollRef = useRef(null);

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
    const cardWidth = isMobile
      ? el.clientWidth * 0.88
      : el.clientWidth / Math.max(perView, 1);
    el.scrollBy({
      left: direction * cardWidth,
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
      `}</style>
      <section
        className="m-section m-collection-list m-collection-list--grid sf-home__collection-list m-collection-list--template--15265873625193__16225316461d1cff80 m-gradient m-color-default"
        data-container="container-fluid"
        data-hover-effect="scaling-up"
        data-section-id="template--15265873625193__16225316461d1cff80"
        data-section-type="collection-list"
        id="m-collection-list-template--15265873625193__16225316461d1cff80"
        style={{
          "--section-padding-bottom": "0px",
          "--section-padding-top": isMobile ? "56px" : "100px",
        }}
      >
        <div
          className="m-collection-list__container m-section-my m-section-py"
          style={{
            "--column-gap": "40px",
            "--column-gap-mobile": "16px",
            "--items": "4",
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
            data-items="4"
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
                      className="m-mixed-layout__inner swiper-wrapper"
                      style={{
                        display: "flex",
                        flexWrap: "nowrap",
                        gap: isMobile ? 12 : 16,
                        padding: isMobile ? "0 8px" : "0 12px",
                      }}
                    >
                      {rootCategories.map((category, index) => (
                        <div
                          key={category.id ?? index}
                          className="m:column swiper-slide"
                          style={{
                            flex: isMobile
                              ? "0 0 88%"
                              : `0 0 ${100 / Math.max(1, perView)}%`,
                            maxWidth: isMobile
                              ? "88%"
                              : `${100 / Math.max(1, perView)}%`,
                            scrollSnapAlign: "start",
                          }}
                        >
                          <div
                            className="m-collection-card m-collection-card--inside m-scroll-trigger animate--fade-in-up"
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
                                      "--aspect-ratio": "3/4",
                                    }}
                                  >
                                    <img
                                      alt={category.title}
                                      className="m:w-full m:h-full"
                                      fetchPriority="low"
                                      height={1269}
                                      loading="lazy"
                                      sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
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
                                    fontSize: isMobile ? "1rem" : undefined,
                                    marginTop: isMobile ? 8 : undefined,
                                  }}
                                >
                                  <Link
                                    className="m-collection-card__link m:block"
                                    to={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(category)}`}
                                  >
                                    {category.title}
                                  </Link>
                                </h3>
                                {/* 
                                  Count remove: category.count wali line display nahi hogi.
                                  (Future me wapas chahiye ho to yahan uncomment kar dena.)
                                */}
                                {/* <p
                                  className="m-collection-card__product-count"
                                  style={{ fontSize: isMobile ? 13 : undefined }}
                                >
                                  {category.count}
                                </p> */}
                                <Link
                                  aria-label={
                                    category.ctaAriaLabel ??
                                    `Shop category ${category.title}`
                                  }
                                  className="m-button m-button--white m:justify-center m:items-center"
                                  to={`${ALL_PRODUCTS_PATH}?categoryId=${categoryIdQuery(category)}`}
                                  style={{
                                    minHeight: isMobile ? 38 : undefined,
                                    width: isMobile ? "100%" : undefined,
                                  }}
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
