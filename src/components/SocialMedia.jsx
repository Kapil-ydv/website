import React from "react";

const GALLERY_IMAGE_SIZES =
  "(min-width: 1200px) 267px, (min-width: 990px) calc((100vw - 130px) / 4), (min-width: 750px) calc((100vw - 120px) / 3), calc((100vw - 35px) / 2)";

const sectionHeader = {
  title: "Follow us Instagram",
  description: (
    <>
      Tag <span className="text-black">@minimog</span> in your Instagram photos
      for a chance to be featured here.
      <br />
      Find more inspiration on{" "}
      <a href="https://www.instagram.com/minimog.trendy/">our Instagram.</a>
    </>
  ),
};

const galleryItems = [
  {
    id: "gallery-1",
    src: "cdn/shop/files/ins-main-12013.jpg?v=1739162905&width=360",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/ins-main-1.jpg?v=1739162905&width=165 165w,//fashion.minimog.co/cdn/shop/files/ins-main-1.jpg?v=1739162905&width=360 360w,//fashion.minimog.co/cdn/shop/files/ins-main-1.jpg?v=1739162905&width=533 533w,//fashion.minimog.co/cdn/shop/files/ins-main-1.jpg?v=1739162905 560w",
    width: 560,
    height: 560,
  },
  {
    id: "gallery-2",
    src: "cdn/shop/files/ins-main-42013.jpg?v=1739162905&width=360",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/ins-main-4.jpg?v=1739162905&width=165 165w,//fashion.minimog.co/cdn/shop/files/ins-main-4.jpg?v=1739162905&width=360 360w,//fashion.minimog.co/cdn/shop/files/ins-main-4.jpg?v=1739162905&width=533 533w,//fashion.minimog.co/cdn/shop/files/ins-main-4.jpg?v=1739162905 560w",
    width: 560,
    height: 560,
  },
  {
    id: "gallery-3",
    src: "cdn/shop/files/ins-main-730d9.jpg?v=1739163056&width=360",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056&width=165 165w,//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056&width=360 360w,//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056&width=533 533w,//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056&width=720 720w,//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056&width=940 940w,//fashion.minimog.co/cdn/shop/files/ins-main-7.jpg?v=1739163056 972w",
    width: 972,
    height: 972,
  },
  {
    id: "gallery-4",
    src: "cdn/shop/files/ins-main-62013.jpg?v=1739162905&width=360",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/ins-main-6.jpg?v=1739162905&width=165 165w,//fashion.minimog.co/cdn/shop/files/ins-main-6.jpg?v=1739162905&width=360 360w,//fashion.minimog.co/cdn/shop/files/ins-main-6.jpg?v=1739162905&width=533 533w,//fashion.minimog.co/cdn/shop/files/ins-main-6.jpg?v=1739162905 560w",
    width: 560,
    height: 560,
  },
  {
    id: "gallery-5",
    src: "cdn/shop/files/ins-main-32013.jpg?v=1739162905&width=360",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/ins-main-3.jpg?v=1739162905&width=165 165w,//fashion.minimog.co/cdn/shop/files/ins-main-3.jpg?v=1739162905&width=360 360w,//fashion.minimog.co/cdn/shop/files/ins-main-3.jpg?v=1739162905&width=533 533w,//fashion.minimog.co/cdn/shop/files/ins-main-3.jpg?v=1739162905 560w",
    width: 560,
    height: 560,
  },
];

const SocialMedia = () => {
  return (
    <section
      data-a="5 5"
      id="m-section-template--15265873625193__gallery_LXcceh"
      className="m-section m-gallery-section m-gallery-section--grid m-gradient m-color-default "
    >
      <div className="container-full m-section-my m-section-py">
        <div className="m-section__header m:text-center">
          <h2 className="m-section__heading h3 m-scroll-trigger animate--fade-in-up">
            {sectionHeader.title}
          </h2>
          <div className="m-section__description m-scroll-trigger animate--fade-in-up">
            {sectionHeader.description}
          </div>
        </div>
        <div className="m-gallery m-gallery--5-columns m-gallery--1-rows swipe-mobile swipe-mobile--2-cols">
          <div className="m-gallery__wrapper m:display-grid m:grid-2-cols md:m:grid-4-cols lg:m:grid-5-cols swipe-mobile__inner">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="m-gallery__item m:relative m:block m:blocks-radius m-scroll-trigger animate--fade-in-up"
                data-cascade
                style={{ "--animation-order": String(index + 1) }}
              >
                <div className="m-gallery__media">
                  <img
                    srcSet={item.srcSet}
                    src={item.src}
                    sizes={GALLERY_IMAGE_SIZES}
                    alt=""
                    loading="lazy"
                    fetchPriority="low"
                    className=""
                    width={item.width}
                    height={item.height}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;
