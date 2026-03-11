import React from "react";
import { Link } from "react-router-dom";

const SECTION_ID = "template--15265873330281__collection-header";
const STYLESHEET_HREF =
  "../cdn/shop/t/10/assets/collection-header5b44.css?v=63198008876933408051709541618";

const collectionHeaderData = {
  title: "All products",
  description:
    "Here is your chance to upgrade your wardrobe with a variation of styles and fits that are both feminine and relaxed.",
  bannerImage: {
    src: "../cdn/shop/files/collection-banner-section8967.jpg?v=1709194155&amp;width=3840",
    alt: "collection-banner-image",
    srcSet:
      "//fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=375 375w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=550 550w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=750 750w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=1100 1100w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=1500 1500w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=1780 1780w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=2000 2000w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=3000 3000w, //fashion.minimog.co/cdn/shop/files/collection-banner-section.jpg?v=1709194155&amp;width=3840 3840w",
    width: 2840,
    height: 560,
    loading: "eager",
    fetchPriority: "high",
    sizes: "100vw",
  },
  breadcrumbs: [
    {
      id: "home",
      type: "link",
      label: "Home",
      href: "/",
      title: "Back to the home page",
      className: "m-breadcrumb--item",
    },
    {
      id: "all-products",
      type: "current",
      label: "All products",
      className: "m-breadcrumb--item m-breadcrumb--item-current",
    },
  ],
};

const BreadcrumbSeparatorIcon = () => (
  <svg
    className="m-svg-icon--small m-rlt-reverse-x"
    fill="currentColor"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 256 512"
    aria-hidden
  >
    <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
  </svg>
);

const CollectionHeader = () => {
  return (
    <div
      id={`shopify-section-${SECTION_ID}`}
      className="shopify-section shopify-section-collection-banner"
    >
      <link
        href={STYLESHEET_HREF}
        rel="stylesheet"
        type="text/css"
        media="all"
      />

      <div
        className="m-collection-page-header m-collection-page-header--image-background m-collection-page-header--template--15265873330281__collection-header m:overflow-hidden m-scroll-trigger animate--zoom-fade"
        data-section-type="collection-header"
        data-section-id={SECTION_ID}
      >
        <m-collection-header
          className="m:block m:w-full"
          data-enable-parallax="false"
        >
          <div className="container-fluid">
            <div className="m-collection-page-header__wrapper m:overflow-hidden m-gradient m-color-dark m:blocks-radius">
              <div className="m-collection-page-header__background m-image">
                <img
                  src={collectionHeaderData.bannerImage.src}
                  alt={collectionHeaderData.bannerImage.alt}
                  srcSet={collectionHeaderData.bannerImage.srcSet}
                  width={collectionHeaderData.bannerImage.width}
                  height={collectionHeaderData.bannerImage.height}
                  loading={collectionHeaderData.bannerImage.loading}
                  fetchPriority={collectionHeaderData.bannerImage.fetchPriority}
                  sizes={collectionHeaderData.bannerImage.sizes}
                />
              </div>

              <div className="m-collection-page-header__inner m-section-py m:text-inherit m:text-center">
                <nav
                  className="m-breadcrumb m:w-full  m-scroll-trigger animate--fade-in-up"
                  role="navigation"
                  aria-label="breadcrumbs"
                >
                  <div className="m-breadcrumb--wrapper m:flex m:items-center m:justify-center">
                    {collectionHeaderData.breadcrumbs.map((item, index) => {
                      const isLast =
                        index === collectionHeaderData.breadcrumbs.length - 1;

                      return (
                        <React.Fragment key={item.id}>
                          {item.type === "link" ? (
                            <Link
                              to={item.href}
                              className={item.className}
                              title={item.title}
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span className={item.className}>{item.label}</span>
                          )}

                          {!isLast && (
                            <span
                              aria-hidden="true"
                              className="m-breadcrumb--separator"
                            >
                              <BreadcrumbSeparatorIcon />
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </nav>

                <h1 className="m-collection-page-header__title h2  m:capitalize m-scroll-trigger animate--fade-in-up">
                  {collectionHeaderData.title}
                </h1>

                <div className="m-collection-page-header__description rte m:text-color-subtext m-scroll-trigger animate--fade-in-up">
                  {collectionHeaderData.description}
                </div>
              </div>
            </div>
          </div>
        </m-collection-header>
      </div>
    </div>
  );
};

export default CollectionHeader;
