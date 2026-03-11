import React, { useEffect, useMemo, useRef, useState } from "react";

const HAPPY_CUSTOMERS = [
  {
    name: "Jared S.",
    title: "Love it so much",
    rating: 5,
    text:
      "Was I in Hawaii?! No. Did I feel like I was in Hawaii?! No, because it’s snowing outside. But, would I wear this in Hawaii ❤️",
    mainImage: {
      src: "/cdn/shop/files/img-test-timonial-03fa62.jpg?v=1709127619&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-test-timonial-03.webp?v=1709127619&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-test-timonial-03.webp?v=1709127619 248w",
    },
    product: {
      title: "Denim Jacket",
      href: "zh/products/denim-jacket.html",
      src: "/cdn/shop/files/478719501ea0.jpg?v=1708670711&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711&width=165 165w,//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711&width=360 360w,//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711&width=533 533w,//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711&width=720 720w,//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711&width=940 940w,//fashion.minimog.co/cdn/shop/files/47871950.webp?v=1708670711 1000w",
    },
  },
  {
    name: "Alyssa A.",
    title: "Love it so much",
    rating: 5,
    text: "Always getting compliments from family, friends, and strangers. 🤗 🙌",
    mainImage: {
      src: "/cdn/shop/files/img-test-timonial-01fa62.jpg?v=1709127619&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-test-timonial-01.webp?v=1709127619&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-test-timonial-01.webp?v=1709127619 248w",
    },
    product: {
      title: "Long Sleeve Shirt",
      href: "zh/products/long-sleeve-shirt.html",
      src: "/cdn/shop/files/478717726d12.jpg?v=1708497461&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=165 165w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=360 360w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=533 533w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=720 720w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=940 940w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=1066 1066w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=1500 1500w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=1780 1780w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461&width=2000 2000w,//fashion.minimog.co/cdn/shop/files/47871772.webp?v=1708497461 2000w",
    },
  },
  {
    name: "Ben B.",
    title: "Love it so much",
    rating: 5,
    text:
      "Hands down one of the best shirts I’ve ever owned. Fits great, feels amazing, seems to stay cool and is somewhat water resistant.",
    mainImage: {
      src: "/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb3a00.jpg?v=1709127960&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb.webp?v=1709127960&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb.webp?v=1709127960 248w",
    },
    product: {
      title: "The Cocoa Shirt",
      href: "zh/products/the-cocoa-shirt.html",
      src: "/cdn/shop/products/47871778e8b8.jpg?v=1708333049&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049&width=165 165w,//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049&width=360 360w,//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049&width=533 533w,//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049&width=720 720w,//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049&width=940 940w,//fashion.minimog.co/cdn/shop/products/47871778.webp?v=1708333049 1000w",
    },
  },
  {
    name: "Dean D. US",
    title: "Love it so much",
    rating: 5,
    text:
      "Was I in Hawaii?! No. Did I feel like I was in Hawaii?! No, because it’s snowing outside. But, would I wear this in Hawaii ❤️",
    mainImage: {
      src: "/cdn/shop/files/img-test-timonial-03fa62.jpg?v=1709127619&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-test-timonial-03.webp?v=1709127619&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-test-timonial-03.webp?v=1709127619 248w",
    },
    product: {
      title: "Leather handbag",
      href: "zh/products/small-bag-black.html",
      src: "/cdn/shop/products/25960e.jpg?v=1709117859&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=165 165w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=360 360w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=533 533w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=720 720w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=940 940w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859&width=1066 1066w,//fashion.minimog.co/cdn/shop/products/25.jpg?v=1709117859 1200w",
    },
  },
  {
    name: "John D.",
    title: "Love it so much",
    rating: 5,
    text: "Always getting compliments from family, friends, and strangers. 🤗 🙌",
    mainImage: {
      src: "/cdn/shop/files/img-test-timonial-01fa62.jpg?v=1709127619&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-test-timonial-01.webp?v=1709127619&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-test-timonial-01.webp?v=1709127619 248w",
    },
    product: {
      title: "Relaxed-Fit Masculine",
      href: "zh/products/relaxed-fit-masculine.html",
      src: "/cdn/shop/files/47871750b21d.jpg?v=1708498537&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=165 165w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=360 360w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=533 533w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=720 720w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=940 940w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=1066 1066w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=1500 1500w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=1780 1780w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537&width=2000 2000w,//fashion.minimog.co/cdn/shop/files/47871750.webp?v=1708498537 2000w",
    },
  },
  {
    name: "Dean J.",
    title: "Love it so much",
    rating: 5,
    text:
      "Hands down one of the best shirts I’ve ever owned. Fits great, feels amazing, seems to stay cool and is somewhat water resistant.",
    mainImage: {
      src: "/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb3a00.jpg?v=1709127960&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb.webp?v=1709127960&width=165 165w,//fashion.minimog.co/cdn/shop/files/img-testimonial-02_a64ec697-0467-4648-84cc-9ebe5c6150bb.webp?v=1709127960 248w",
    },
    product: {
      title: "Short sleeve T-shirt",
      href: "zh/products/short-sleeve-t-shirt.html",
      src: "/cdn/shop/files/47871696786c.jpg?v=1708499887&width=360",
      srcSet:
        "//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=165 165w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=360 360w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=533 533w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=720 720w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=940 940w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=1066 1066w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=1500 1500w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=1780 1780w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887&width=2000 2000w,//fashion.minimog.co/cdn/shop/files/47871696.webp?v=1708499887 2000w",
    },
  },
];

const HappyCustomers = () => {
  const totalSlides = HAPPY_CUSTOMERS.length;
  const getPerView = () =>
    typeof window !== "undefined" && window.innerWidth >= 1024 ? 3 : 1;

  const [perView, setPerView] = useState(getPerView);
  const [page, setPage] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const containerRef = useRef(null);

  const pages = useMemo(
    () => Math.max(1, Math.ceil(totalSlides / perView)),
    [perView],
  );

  useEffect(() => {
    const updateLayout = () => {
      setPerView(getPerView());
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth);
      }
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  useEffect(() => {
    setPage((p) => Math.min(p, pages - 1));
  }, [pages]);

  const translate = page * pageWidth;

  return (
    <div>
      <section
        id="m-section--template--15265873625193__testimonials_pnyUnX"
        className="m-section m-testimonials m-testimonials--layout-6 m-slider--pagination-fraction m-gradient m-color-scheme-cee058e4-58e3-46aa-9af9-219dadc79066"
        data-section-type="testimonials"
        data-section-id="template--15265873625193__testimonials_pnyUnX"
        data-container="container-fluid"
      >
        <div className="container-fluid m-section-my m-section-py">
          <div className="m-testimonials__wrapper m:text-color-body">
            <div className="m-testimonials__header m:text-left">
              <div className="m-section__header m:text-left ">
                <h2 className="m-section__heading h3 m-scroll-trigger animate--fade-in-up">
                  Happy Customers
                </h2>
              </div>
              <div className="m-slider-controls m-slider-controls--bottom-center m-slider-controls--show-nav m-slider-controls--show-pagination m-slider-controls--pagination-fraction m-slider-controls--group">
                <div className="m-slider-controls__wrapper">
                  <button
                    className="m-slider-controls__button m-slider-controls__button-prev swiper-button-prev "
                    aria-label="Previous"
                    type="button"
                    onClick={() =>
                      setPage((p) => (p - 1 + pages) % pages)
                    }
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.5 15L7.5 10L12.5 5"
                        stroke="currentColor"
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="swiper-pagination m:w-full ">{`${page + 1} / ${totalSlides}`}</div>
                  <button
                    className="m-slider-controls__button m-slider-controls__button-next swiper-button-next "
                    aria-label="Next"
                    type="button"
                    onClick={() =>
                      setPage((p) => (p + 1) % pages)
                    }
                  >
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 15L12.5 10L7.5 5"
                        stroke="currentColor"
                        strokeWidth={1}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <m-testimonials
              data-container="container-fluid"
              data-design="testimonials-6"
              data-autoplay="false"
              data-pagination-type="fraction"
              data-total={HAPPY_CUSTOMERS.length}
              className="m-testimonials-el m:block"
            >
              <div className="m-testimonials__inner">
                <div
                  ref={containerRef}
                  className="swiper-container swiper--equal-height"
                  style={{ "--hc-perview": String(perView) }}
                >
                  <div
                    className="swiper-wrapper"
                    style={{
                      transform: `translate3d(-${translate}px, 0, 0)`,
                    }}
                  >
                    {HAPPY_CUSTOMERS.map((customer, index) => (
                      <div
                        className="swiper-slide"
                        data-index={index}
                        key={customer.name + index}
                      >
                        <div
                          className="m-testimonial m-scroll-trigger animate--fade-in-up"
                          data-cascade
                          style={{ "--animation-order": String(index + 1) }}
                        >
                          <div className="m-testimonial__wrapper m-gradient m-color-default m:blocks-radius">
                            <div className="m-testimonial__content">
                              <div className="m-testimonial__info">
                                <div className="m-testimonial__name">
                                  <p>{customer.name}</p>
                                </div>
                                <div className="m-stars">
                                  {Array.from({
                                    length: customer.rating,
                                  }).map((_, starIndex) => (
                                    <span className="m-star" key={starIndex}>
                                      <svg
                                        className="m-icon m-icon--star-solid m-svg-icon"
                                        viewBox="0 0 16 15"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M8 1.46327L9.90277 5.31871L10.0191 5.55443L10.2792 5.59223L14.534 6.21048L11.4552 9.21152L11.267 9.395L11.3114 9.65409L12.0382 13.8916L8.23267 11.8909L8 11.7686L7.76733 11.8909L3.96178 13.8916L4.68858 9.65409L4.73301 9.395L4.54478 9.21152L1.46603 6.21048L5.72076 5.59223L5.98089 5.55443L6.09723 5.31871L8 1.46327Z" />
                                      </svg>
                                    </span>
                                  ))}
                                </div>
                                <h3 className="m-testimonial__title">
                                  {customer.title}
                                </h3>
                                <div className="m-testimonial__description rte">
                                  <p>{customer.text}</p>
                                </div>
                              </div>

                              <div className="m-testimonial__image m:hidden md:m:block m:blocks-radius">
                                <img
                                  srcSet={customer.mainImage.srcSet}
                                  src={customer.mainImage.src}
                                  sizes="(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)"
                                  alt={customer.name}
                                  loading="lazy"
                                  fetchpriority="low"
                                  className
                                />
                              </div>
                            </div>

                         
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m-testimonials>
          </div>
        </div>
      </section>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "#m-section--template--15265873625193__testimonials_pnyUnX .swiper-container{overflow:hidden;margin:0 -12px;}" +
            "#m-section--template--15265873625193__testimonials_pnyUnX .swiper-wrapper{display:flex;align-items:stretch;transition:transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1);will-change:transform;}" +
            "#m-section--template--15265873625193__testimonials_pnyUnX .swiper-slide{flex:0 0 calc(100% / var(--hc-perview, 1));max-width:calc(100% / var(--hc-perview, 1));padding:0 12px;box-sizing:border-box;height:auto;}",
        }}
      />
    </div>
  );
};

export default HappyCustomers;