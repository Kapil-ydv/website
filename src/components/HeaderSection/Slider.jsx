import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
// ——— Constants ———
const SECTION_ID = "template--15265873625193__1621243260e1af0c20";
const SUBTITLE = "New Arrivals";
const BUTTON_TEXT = "Shop Now";
const FOOTER_TEXT = "The ReCotton Tee";
const ASPECT_RATIO = "2.16";
const ASPECT_RATIO_MOBILE = "1.0";
const BTN_COLOR = "#000";
const BTN_COLOR_HOVER = "#FFF";
const MOBILE_HEIGHT = 750;
const MOBILE_WIDTH = 750;
const DESKTOP_HEIGHT = 1125;
const DESKTOP_WIDTH = 2430;
const AUTOPLAY_DELAY_MS = 4000;
const TRANSITION_SPEED_MS = 1000;

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
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={slide.images.mobile.srcSet}
              width={MOBILE_WIDTH}
              height={MOBILE_HEIGHT}
            />
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
          </picture>
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
          <div className="m-richtext__subtitle m-slide__subtitle m:text-black h5">
            {slide.subtitle}
          </div>
          <h2 className="m-richtext__title m-slide__title m:text-black h1">
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h2>
          <div className="m-richtext__button m-slide__button m:display-flex m:flex-wrap m:items-center m:justify-start">
            {slide.buttonHref.startsWith("http") ? (
              <a
                className="m-slide__button-first m-button m-button--secondary"
                href={slide.buttonHref}
                target="_blank"
                rel="noreferrer"
              >
                {BUTTON_TEXT}
              </a>
            ) : (
              <button
                type="button"
                className="m-slide__button-first m-button m-button--secondary"
                onClick={() => navigate(slide.buttonHref)}
              >
                {BUTTON_TEXT}
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        className="m-slider__footer m-slider__footer--end container-fluid m:flex m:items-center m:justify-end m:text-black"
        style={{ "--btn-color": BTN_COLOR }}
      >
        <span>{FOOTER_TEXT}</span>
        <span>|</span>
        {slide.footerLink.startsWith("http") ? (
          <a className="m-button m-button--link" href={slide.footerLink}>
            {BUTTON_TEXT}
          </a>
        ) : (
          <button
            type="button"
            className="m-button m-button--link"
            onClick={() => navigate(slide.footerLink)}
          >
            {BUTTON_TEXT}
          </button>
        )}
      </div>
    </div>
  );
}

// ——— Main component ———
function Slider() {
  const navigate = useNavigate();
  const paginationRef = useRef(null);
  const [slides, setSlides] = useState([]);

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
    const fetchSlides = async () => {
      try {
        const res = await fetch("https://website-backend-bot8.vercel.app/api/slider");
        if (!res.ok) return;
        const data = await res.json();
        setSlides(
          data.map((slide) => ({
            ...slide,
           
            subtitle: slide.subtitle || SUBTITLE,
          })),
        );
      } catch (err) {
        // silent fail – UI just won't show slider data if API fails
        console.error("Failed to load slider data", err);
      }
    };

    fetchSlides();
  }, []);

  return (
    <section
      className="m-section m-slider m-slideshow-section m-slider--adapt m-slider--content-stack sf-home__slideshow"
      data-section-id={SECTION_ID}
      data-section-type="slider"
      id={`m-slider-${SECTION_ID}`}
      style={{ "--data-autoplay-speed": `${AUTOPLAY_DELAY_MS / 1000}s` }}
    >
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
            {slides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <SlideContent
                  slide={slide}
                  sectionId={SECTION_ID}
                  navigate={navigate}
                />
              </SwiperSlide>
            ))}
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
