import React from "react";
import Header from "../Header";
import { useNavigate } from "react-router-dom";
const WishList = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main id="MainContent" role="main">
        <div
          className="shopify-section"
          id="shopify-section-template--15265873887337__main"
        >
          <div className="m-page-header m-page-header--template-page m:text-center m-scroll-trigger animate--fade-in-up">
            <div className="container">
              <h1 className="m-page-header__title">Wishlist</h1>
            </div>
            <nav
              aria-label="breadcrumbs"
              className="m-breadcrumb m:w-full "
              role="navigation"
            >
              <div className="container">
                <div className="m-breadcrumb--wrapper m:flex m:items-center m:justify-center">
                  <a
                    className="m-breadcrumb--item"
                    // href="../index.html"
                    title="Back to the home page"
                  >
                    Home
                  </a>
                  <span aria-hidden="true" className="m-breadcrumb--separator">
                    <svg
                      className="m-svg-icon--small m-rlt-reverse-x"
                      fill="currentColor"
                      stroke="currentColor"
                      viewBox="0 0 256 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
                    </svg>
                  </span>
                  <span className="m-breadcrumb--item-current m-breadcrumb--item">
                    Wishlist
                  </span>
                </div>
              </div>
            </nav>
          </div>
          <div className="container">
            <div className="m-page-content m-wishlist-page-content m-mixed-layout m-mixed-layout--mobile-scroll">
              <div className="m-wishlist-page-content__wrapper m-mixed-layout__inner m:grid m:grid-2-cols md:m:grid-3-cols xl:m:grid-4-cols" />
            </div>
            <div className="m-page-content m-wishlist-no-products m:hidden">
              <h3>
                No products were added to the wishlist page.
                <a
                  className="m-text-link"
                  onClick={() => navigate("/AllProducts")}
                >
                  Back to shopping
                </a>
              </h3>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default WishList;
