import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../Header";
import {
  loginThunk,
  verifyOtpThunk,
  sendOtpThunk,
} from "../../redux/actions";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const [tab, setTab] = useState("login"); // "login" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Redirect when login succeeds
  useEffect(() => {
    if (auth.user && auth.token) {
      if (auth.user.role === 0) navigate("/admin");
      else navigate("/");
    }
  }, [auth.user, auth.token, navigate]);

  // Switch to OTP panel when server says account needs verification
  const needsOtp = Boolean(auth.pendingEmail) && !auth.user;

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password }));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    dispatch(verifyOtpThunk(auth.pendingEmail || email, otp));
  };

  const handleResendOtp = () => {
    dispatch(sendOtpThunk(auth.pendingEmail || email));
  };

  const handleForgot = (e) => {
    e.preventDefault();
    dispatch(sendOtpThunk(email));
  };

  return (
    <>
      <Header />
      <main id="MainContent" role="main">
        <div className="shopify-section" id="shopify-section-template--16598221750377__main">
          <div className="m-page-header m-page-header--template-login m-page-header--large m:text-center m-scroll-trigger animate--fade-in-up">
            <div className="container-fluid">
              <h1 className="m-page-header__title">Log In</h1>
            </div>
            <nav aria-label="breadcrumbs" className="m-breadcrumb m:w-full" role="navigation">
              <div className="container-fluid">
                <div className="m-breadcrumb--wrapper m:flex m:items-center m:justify-center">
                  <Link className="m-breadcrumb--item" to="/" title="Back to the home page">Home</Link>
                  <span aria-hidden="true" className="m-breadcrumb--separator">
                    <svg className="m-svg-icon--small m-rlt-reverse-x" fill="currentColor" stroke="currentColor" viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.525 36.465l-7.071 7.07c-4.686 4.686-4.686 12.284 0 16.971L205.947 256 10.454 451.494c-4.686 4.686-4.686 12.284 0 16.971l7.071 7.07c4.686 4.686 12.284 4.686 16.97 0l211.051-211.05c4.686-4.686 4.686-12.284 0-16.971L34.495 36.465c-4.686-4.687-12.284-4.687-16.97 0z" />
                    </svg>
                  </span>
                  <span className="m-breadcrumb--item-current m-breadcrumb--item">Account</span>
                </div>
              </div>
            </nav>
          </div>

          <div className="m-customer-forms">
            <div className="container">

              {/* ── OTP Verification Panel ── */}
              {needsOtp && (
                <div className="m-login-form" style={{ maxWidth: 480, margin: "0 auto 40px" }}>
                  <h3>Verify Your Email</h3>
                  <p style={{ color: "#555", marginBottom: 16 }}>
                    An OTP was sent to <b>{auth.pendingEmail}</b>. Enter it below to continue.
                  </p>
                  {auth.error && <p style={{ color: "red", marginBottom: 12 }}>{auth.error}</p>}
                  {auth.successMessage && <p style={{ color: "green", marginBottom: 12 }}>{auth.successMessage}</p>}
                  <form onSubmit={handleVerifyOtp}>
                    <input
                      className="form-field form-field--input"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                      style={{ letterSpacing: 6, fontSize: 22, textAlign: "center" }}
                    />
                    <button className="m-button m-button--primary" type="submit" disabled={auth.loading}>
                      {auth.loading ? "Verifying…" : "Verify OTP"}
                    </button>
                  </form>
                  <button
                    type="button"
                    className="m-button m-button--white"
                    style={{ marginTop: 12 }}
                    onClick={handleResendOtp}
                    disabled={auth.loading}
                  >
                    Resend OTP
                  </button>
                </div>
              )}

              {/* ── Forgot Password Panel ── */}
              {!needsOtp && tab === "forgot" && (
                <div className="m-recover-form" id="recover">
                  <h3>Reset your password</h3>
                  <p>We will send you an OTP to reset your password.</p>
                  {auth.error && <p style={{ color: "red", marginBottom: 12 }}>{auth.error}</p>}
                  {auth.successMessage && <p style={{ color: "green", marginBottom: 12 }}>{auth.successMessage}</p>}
                  <form onSubmit={handleForgot}>
                    <input
                      className="form-field form-field--input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <div className="m-recover-form__action">
                      <button className="m-button m-button--primary" type="submit" disabled={auth.loading}>
                        {auth.loading ? "Sending…" : "Submit"}
                      </button>
                      <button
                        type="button"
                        className="m-recover-form__cancel-btn m-button m-button--white"
                        onClick={() => setTab("login")}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── Login Panel ── */}
              {!needsOtp && tab === "login" && (
                <div className="m-login-form" id="login">
                  <h3>Log In</h3>
                  {auth.error && <p style={{ color: "red", marginBottom: 12 }}>{auth.error}</p>}
                  {auth.successMessage && <p style={{ color: "green", marginBottom: 12 }}>{auth.successMessage}</p>}
                  <form onSubmit={handleLogin}>
                    <input
                      className="form-field form-field--input"
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      className="form-field form-field--input"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="m-reset-password-btn"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => setTab("forgot")}
                    >
                      Forgot your password?
                    </button>
                    <button className="m-button m-button--primary" type="submit" disabled={auth.loading}>
                      {auth.loading ? "Signing in…" : "Sign In"}
                    </button>
                  </form>
                </div>
              )}

              {/* ── New Customer ── */}
              {!needsOtp && (
                <div className="m-sign-up">
                  <h3>New Customer</h3>
                  <p>
                    Sign up for early Sale access plus tailored new arrivals, trends and promotions.
                    To opt out, click unsubscribe in our emails.
                  </p>
                  <button
                    type="button"
                    className="m-button m-button--primary"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
