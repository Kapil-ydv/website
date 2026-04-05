import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { useDispatch, useSelector } from "react-redux";
import { fetchSliderSlides } from "../../redux/actions";

/**
 * Cloudinary: width-based srcset + high-quality defaults so mobile/retina get enough pixels.
 * Already-transformed URLs (comma in first path segment) are left unchanged.
 */
function buildSliderResponsiveImage(url) {
  if (!url || typeof url !== "string") {
    return { src: url, srcSet: url };
  }
  const trimmed = url.trim();
  const m = trimmed.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^?]+)(\?.*)?$/i,
  );
  if (!m) {
    return { src: trimmed, srcSet: trimmed };
  }
  const [, prefix, pathPart, query = ""] = m;
  const firstSegment = pathPart.split("/")[0] ?? "";
  if (firstSegment.includes(",")) {
    return { src: trimmed, srcSet: trimmed };
  }
  const suffix = `${pathPart}${query}`;
  const tfm = "f_auto,q_auto:best";
  const sized = (w) => `${prefix}${tfm},w_${w},c_limit/${suffix}`;
  const widths = [640, 828, 1080, 1200, 1536, 1920, 2560];
  const srcSet = widths.map((w) => `${sized(w)} ${w}w`).join(", ");
  return { src: sized(1920), srcSet };
}

// ——— Constants ———
const SECTION_ID = "template--15265873625193__1621243260e1af0c20";

const BUTTON_TEXT = "Shop Now";
const FOOTER_TEXT = "The ReCotton Tee";
const ASPECT_RATIO = "2.16";
/** Mobile: taller frame (~square) so the hero fills the screen better than the wide 2.16 strip. */
const ASPECT_RATIO_MOBILE = "1";
const BTN_COLOR = "#000";
const BTN_COLOR_HOVER = "#FFF";
const DESKTOP_HEIGHT = 1125;
const DESKTOP_WIDTH = 2430;
const AUTOPLAY_DELAY_MS = 4000;
const TRANSITION_SPEED_MS = 1000;

function shopNowPath(slide) {
  const raw = slide?.categoryId;
  if (raw != null && raw !== "" && Number.isFinite(Number(raw))) {
    return `/AllProducts?categoryId=${encodeURIComponent(String(raw))}`;
  }
  return "/AllProducts";
}

function SlideContent({ slide, sectionId, navigate }) {
  return (
    <div
      className="m-slide m-slide--middle-left m-slide--text-large"
      data-slide={slide.id}
      data-slide-type="slider_item"
    >
      <div
        className="m-slide__media"
        style={{
          "--aspect-ratio": ASPECT_RATIO,
          "--aspect-ratio-mobile": ASPECT_RATIO_MOBILE,
        }}
      >
        <div className="m-slide__bg">
          <img
            alt={`Slider ${sectionId} - slide ${slide.id + 1}`}
            src={slide.images.desktop.src}
            srcSet={slide.images.desktop.srcSet}
            sizes="100vw"
            width={DESKTOP_WIDTH}
            height={DESKTOP_HEIGHT}
            loading={slide.loading}
            fetchPriority={slide.fetchPriority}
          />
        </div>
      </div>

      <div
        className="m-slide__wrapper container-fluid m-slide-animate--fade-in-up"
        style={{
          "--btn-color": BTN_COLOR,
          "--btn-color-hover": BTN_COLOR_HOVER,
        }}
      >
        <div className="m-slide__content m-richtext m:text-left">
          {/* Small label text: subtitle (1–2 lines) */}
          <div className="m-richtext__subtitle m-slide__subtitle m:text-black h5">
            {slide.title}
          </div>
          {/* Big heading text: title string (e.g. "New Arrivals") */}
          <h2 className="m-richtext__title m-slide__title m:text-black h1">
            {Array.isArray(slide.subtitle) ? (
              <>
                {slide.subtitle[0]}
                {slide.subtitle[1] ? (
                  <>
                    <br />
                    {slide.subtitle[1]}
                  </>
                ) : null}
              </>
            ) : (
              slide.subtitle
            )}
         
          </h2>
          <div className="m-richtext__button m-slide__button m:display-flex m:flex-wrap m:items-center m:justify-start">
            <button
              type="button"
              className="m-slide__button-first m-button m-button--secondary"
              onClick={() => navigate(shopNowPath(slide))}
            >
              {BUTTON_TEXT}
            </button>
          </div>
        </div>
      </div>

      <div
        className="m-slider__footer m-slider__footer--end container-fluid m:flex m:items-center m:justify-end m:text-black"
        style={{ "--btn-color": BTN_COLOR }}
      >
        <span>{FOOTER_TEXT}</span>
        <span>|</span>

        <button
          type="button"
          className="m-button m-button--link"
          onClick={() => navigate(shopNowPath(slide))}
        >
          {BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
}

// ——— Main component ———
function Slider() {
  const navigate = useNavigate();
  const paginationRef = useRef(null);
  const dispatch = useDispatch();
  // In current Redux setup, slider is just an array of slide objects
  const slides = useSelector((state) => state.slider || []);

  const handleSwiperInit = (swiper) => {
    setTimeout(() => {
      if (paginationRef.current && swiper.pagination) {
        swiper.pagination.el = paginationRef.current;
        swiper.pagination.init();
        swiper.pagination.render();
        swiper.pagination.update();
      }
    }, 0);
  };

  useEffect(() => {
    dispatch(fetchSliderSlides());
  }, [dispatch]);

  return (
    <section
      className="m-section m-slider m-slideshow-section m-slider--adapt m-slider--content-stack sf-home__slideshow home-hero-slider-fit"
      data-section-id={SECTION_ID}
      data-section-type="slider"
      id={`m-slider-${SECTION_ID}`}
      style={{ "--data-autoplay-speed": `${AUTOPLAY_DELAY_MS / 1000}s` }}
    >
      <style>{`
        /* Full width on all breakpoints; top anchor keeps baked-in headline/heads in frame. */
        #m-slider-${SECTION_ID} .m-slide__bg img {
          display: block;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center top !important;
        }
        @media (max-width: 767px) {
          #m-slider-${SECTION_ID} .container-full,
          #m-slider-${SECTION_ID} .m-slider-wrapper {
            max-width: none !important;
            width: 100% !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          /*
           * Theme sets .m-slider--adapt .m-slide__media { height: 100% } with no fixed swiper height,
           * so the media box stays very short on mobile. Let aspect-ratio define height instead.
           */
          #m-slider-${SECTION_ID}.m-slider--adapt .m-slide__media {
            height: auto !important;
            aspect-ratio: var(--aspect-ratio-mobile, 1);
          }
          /* Reduce layout “breaks”: fade slides + auto height can flash or misalign. */
          #m-slider-${SECTION_ID} .swiper,
          #m-slider-${SECTION_ID} .swiper-container {
            overflow: hidden !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          #m-slider-${SECTION_ID} .swiper-wrapper {
            width: 100% !important;
          }
          #m-slider-${SECTION_ID} .swiper-slide {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          #m-slider-${SECTION_ID} .m-slide {
            width: 100% !important;
            overflow: hidden;
          }
          #m-slider-${SECTION_ID} .swiper,
          #m-slider-${SECTION_ID} .swiper-container,
          #m-slider-${SECTION_ID} .swiper-wrapper,
          #m-slider-${SECTION_ID} .swiper-slide {
            height: auto !important;
          }
        }
      `}</style>
      <div className="container-full">
        <div
          className="m-slider-wrapper m:block m-slider-controls--show-pagination m-slider-controls--pagination-right"
          data-section-id={SECTION_ID}
        >
          <Swiper
            className="swiper-container"
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop
            speed={TRANSITION_SPEED_MS}
            slidesPerView={1}
            autoplay={{
              delay: AUTOPLAY_DELAY_MS,
              disableOnInteraction: true,
            }}
            pagination={{
              clickable: true,
              bulletClass: "m-dot",
              bulletActiveClass: "m-dot--active",
            }}
            onSwiper={handleSwiperInit}
          >
            {slides.map((slide) => {
              const imageUrl = slide.images; // API se aata hua single URL
              const { src, srcSet } = buildSliderResponsiveImage(imageUrl);
              const mappedSlide = {
                ...slide,
                images: {
                  desktop: { src, srcSet },
                },
              };

              const key = slide.id ?? slide._id;

              return (
                <SwiperSlide key={key}>
                  <SlideContent
                    slide={mappedSlide}
                    sectionId={SECTION_ID}
                    navigate={navigate}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div
            className="m-slider-controls m-slider-controls--absolute m-slider-controls--show-pagination m-slider-controls--pagination-right m-slider-controls--middle-right"
            style={{ "--swiper-controls-color": "#222222" }}
          >
            <div className="m-slider-controls__wrapper">
              <div
                ref={paginationRef}
                className="swiper-pagination m:w-full m-dot-circle m-dot-circle--dark swiper-pagination--vertical"
                aria-label="Slider pagination"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Slider;
