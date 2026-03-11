import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const ALL_PRODUCTS_PATH = "/AllProducts";
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "https://website-backend-bot8.vercel.app";

const ShopCatogries = () => {
  const [categories, setCategories] = useState([]);

  const totalSlides = categories.length;
  const getPerView = () => {
    if (typeof window === "undefined") return 1;
    if (window.innerWidth >= 768) return 4; // desktop/tablet: 4 cards visible
    return 1; // mobile: 1 card visible
  };

  const [perView, setPerView] = useState(getPerView);
  const [page, setPage] = useState(0); // page = starting index

  // total distinct starting positions for step-1 scrolling
  const pages = useMemo(() => (totalSlides > 0 ? totalSlides : 1), [totalSlides]);

  // Fetch categories from backend API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) {
          // eslint-disable-next-line no-console
          console.error("Failed to fetch categories", res.status);
          return;
        }
        const data = await res.json();
        console.log(data ,'datadata');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching categories", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const updateLayout = () => {
      setPerView(getPerView());
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    if (totalSlides === 0) {
      setPage(0);
      return;
    }
    setPage((p) => Math.min(p, pages - 1));
  }, [pages, totalSlides]);

  const visibleCategories = useMemo(() => {
    if (totalSlides === 0) return [];
    const result = [];
    for (let i = 0; i < perView; i += 1) {
      const index = (page + i) % totalSlides;
      result.push(categories[index]);
    }
    return result;
  }, [page, perView, totalSlides, categories]);

  return (
    <>
      <section
        className="m-section m-collection-list m-collection-list--grid sf-home__collection-list m-collection-list--template--15265873625193__16225316461d1cff80 m-gradient m-color-default"
        data-container="container-fluid"
        data-hover-effect="scaling-up"
        data-section-id="template--15265873625193__16225316461d1cff80"
        data-section-type="collection-list"
        id="m-collection-list-template--15265873625193__16225316461d1cff80"
        style={{
          "--section-padding-bottom": "0px",
          "--section-padding-top": "100px",
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
            <div className="m-collection-list__header-container container-fluid">
              <div className="m-section__header m:text-left">
                <h2 className="m-section__heading h3 m-scroll-trigger animate--fade-in-up">
                  Shop by Categories
                </h2>
                <div className="m-collection-list__controls m-collection-list__controls--top">
                  <div className="m-slider-controls m-slider-controls--bottom-left m-slider-controls--show-nav m-slider-controls--show-pagination m-slider-controls--pagination-fraction m-slider-controls--group ">
                    <div className="m-slider-controls__wrapper">
                      <button
                        aria-label="Previous"
                        type="button"
                        className="m-slider-controls__button m-slider-controls__button-prev swiper-button-prev "
                        onClick={() =>
                          setPage((p) => (p - 1 + pages) % pages)
                        }
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
                        {totalSlides > 0 ? `${page + 1} / ${totalSlides}` : "0 / 0"}
                      </div>
                      <button
                        aria-label="Next"
                        type="button"
                        className="m-slider-controls__button m-slider-controls__button-next swiper-button-next "
                        onClick={() =>
                          setPage((p) => (p + 1) % pages)
                        }
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
                  <div className="m-mixed-layout__wrapper swiper-container swiper--equal-height">
                    <div className="m-mixed-layout__inner m:grid md:m:grid-3-cols xl:m:grid-3-cols swiper-wrapper">
                      {visibleCategories.map((category) => (
                        <div key={category.id} className="m:column swiper-slide">
                          <div
                            className="m-collection-card m-collection-card--inside m-scroll-trigger animate--fade-in-up"
                            data-cascade=""
                            style={{
                              "--animation-order": category.animationOrder,
                            }}
                          >
                            <div className="m-collection-card__inner m-hover-box m-hover-box--scale-up">
                              <Link
                                aria-label={category.ariaLabel}
                                className="m-collection-card__image m:block m:w-full m:blocks-radius"
                                to={ALL_PRODUCTS_PATH}
                              >
                                <div className={category.img.wrapperClassName || undefined}>
                                  <img
                                    alt=""
                                    className={category.img.imgClassName}
                                    fetchPriority="low"
                                    height={category.img.height}
                                    loading="lazy"
                                    sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                                    src={category.img.src}
                                    srcSet={category.img.srcSet}
                                    width={category.img.width}
                                  />
                                </div>
                              </Link>
                              <div className="m-collection-card__info m:text-left">
                                <h3 className="m-collection-card__title">
                                  <Link
                                    className="m-collection-card__link m:block"
                                    to={ALL_PRODUCTS_PATH}
                                  >
                                    {category.title}
                                  </Link>
                                </h3>
                                <p className="m-collection-card__product-count">
                                  {category.count}
                                </p>
                                <Link
                                  aria-label={category.ctaAriaLabel}
                                  className="m-button m-button--white m:justify-center m:items-center"
                                  to={ALL_PRODUCTS_PATH}
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