import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
const Register = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header />
      <main id="MainContent" role="main">
        <div
          className="shopify-section"
          id="shopify-section-template--16598221815913__main"
        >
          <div className="m-page-header m-page-header--template-register m:text-center m-scroll-trigger animate--fade-in-up">
            <div className="container-fluid">
              <h1 className="m-page-header__title">Register</h1>
            </div>
            <nav
              aria-label="breadcrumbs"
              className="m-breadcrumb m:w-full "
              role="navigation"
            >
              <div className="container-fluid">
                <div className="m-breadcrumb--wrapper m:flex m:items-center m:justify-center">
                  <a
                    className="m-breadcrumb--item"
                    href="../index.html"
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
                    Create Account
                  </span>
                </div>
              </div>
            </nav>
          </div>
          <div className="m-register-form">
            <div className="m-register-form__wrapper">
              <h1>Register</h1>
              <div data-register-form="">
                <form
                  acceptCharset="UTF-8"
                  // action="https://fashion.minimog.co/account"
                  data-login-with-shop-sign-up="true"
                  id="create_customer"
                  method="post"
                >
                  <input
                    defaultValue="create_customer"
                    name="form_type"
                    type="hidden"
                  />
                  <input defaultValue="✓" name="utf8" type="hidden" />
                  <input
                    className="form-field form-field--input"
                    name="customer[first_name]"
                    placeholder="First Name"
                    type="text"
                  />
                  <input
                    className="form-field form-field--input"
                    name="customer[last_name]"
                    placeholder="Last Name"
                    type="text"
                  />
                  <input
                    className="form-field form-field--input"
                    name="customer[email]"
                    placeholder="Email"
                    type="email"
                  />
                  <input
                    className="form-field form-field--input"
                    name="customer[password]"
                    placeholder="Password"
                    type="password"
                  />
                  <div className="m-register-form__description">
                    Sign up for early Sale access plus tailored new arrivals,
                    trends and promotions. To opt out, click unsubscribe in our
                    emails.
                  </div>
                  <button className="m-button m-button--primary m:w-full">
                    Register
                  </button>
                  <a
                    className="m-button m-button--secondary m:w-full"
                    onClick={() => navigate("/login")}
                  >
                    Log In
                  </a>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Register;
