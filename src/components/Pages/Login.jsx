import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
const Login = () => {
  const navigate = useNavigate();
  return (
    <>
    <Header />
    <main id="MainContent" role="main">

      <div
        className="shopify-section"
        id="shopify-section-template--16598221750377__main"
      >
        <div className="m-page-header m-page-header--template-login m-page-header--large m:text-center m-scroll-trigger animate--fade-in-up">
          <div className="container-fluid">
            <h1 className="m-page-header__title">Log In</h1>
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
                  Account
                </span>
              </div>
            </div>
          </nav>
        </div>
        <div className="m-customer-forms">
          <div className="container">
            <div className="m-recover-form" id="recover">
              <h3>Reset your password</h3>
              <p>We will send you an email to reset your password.</p>
              <div data-recover-form="">
                <form
                  acceptCharset="UTF-8"
                  action="https://fashion.minimog.co/account/recover"
                  method="post"
                >
                  <input
                    defaultValue="recover_customer_password"
                    name="form_type"
                    type="hidden"
                  />
                  <input defaultValue="✓" name="utf8" type="hidden" />
                  <input
                    autoCapitalize="off"
                    autoComplete="off"
                    className="form-field form-field--input"
                    name="email"
                    placeholder="Email"
                    spellCheck="false"
                    type="email"
                  />
                  <div className="m-recover-form__action">
                    <button
                      className="m-button m-button--primary"
                      type="submit"
                    >
                      Submit
                    </button>
                    <a
                      className="m-recover-form__cancel-btn m-button m-button--white"
                      href="#login"
                    >
                      Cancel
                    </a>
                  </div>
                </form>
              </div>
            </div>
            <div className="m-login-form" id="login">
              <h3>Log In</h3>
            
              <form
                acceptCharset="UTF-8"
                action="https://fashion.minimog.co/account/login"
                data-login-with-shop-sign-in="true"
                id="customer_login"
                method="post"
              >
                <input
                  defaultValue="customer_login"
                  name="form_type"
                  type="hidden"
                />
                <input defaultValue="✓" name="utf8" type="hidden" />
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
                <a className="m-reset-password-btn" href="#recover">
                  Forgot your password?
                </a>
                <button className="m-button m-button--primary" type="submit">
                  Sign In
                </button>
              </form>
              <form
                acceptCharset="UTF-8"
                action="https://fashion.minimog.co/account/recover"
                method="post"
              >
                <input
                  defaultValue="recover_customer_password"
                  name="form_type"
                  type="hidden"
                />
                <input defaultValue="✓" name="utf8" type="hidden" />
              </form>
            </div>
            <div className="m-sign-up">
              <h3>New Customer</h3>
              <p>
                Sign up for early Sale access plus tailored new arrivals,
                trends and promotions. To opt out, click unsubscribe in our
                emails.
              </p>
              <a className="m-button m-button--primary" onClick={() => navigate("/register")}>
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
    </>
  );
};

export default Login;
