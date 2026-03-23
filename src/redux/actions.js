// const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://website-backend-bot8.vercel.app";
const API_BASE = "https://website-backend-bot8.vercel.app";

async function fetchJson(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const msg =
        (data && typeof data === "object" && data.error) ||
        (typeof data === "string" && data) ||
        `Request failed (${res.status})`;
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    if (err && err.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// Shared helper: upload a single image file to Cloudinary
// Returns the final image URL string.
export async function uploadImageToCloudinary(file) {
  if (!file) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ecommerce_upload");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dv6jjaeho/image/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  const data = await res.json();
  if (!data.secure_url && !data.url) {
    throw new Error("No URL returned from server");
  }

  return data.secure_url || data.url;
}

export async function uploadImagesToCloudinary(files) {
  const list = Array.from(files || []);
  return Promise.all(list.map((file) => uploadImageToCloudinary(file)));
}

export const fetchSliderSlides = () => async (dispatch) => {
  try {
    const res = await fetch("https://website-backend-bot8.vercel.app/api/slider");

    const data = await res.json();
    dispatch({ type: "FETCH_SLIDER", payload: data });
  } catch (error) {
    dispatch({
      type: "FETCH_SLIDER",
      payload: [],
    });
  }
};

// Mix & match looks thunk (does not change existing functionality)
export const fetchMixMatchLooks = () => async (dispatch) => {
  try {
    const res = await fetch(`${API_BASE}/api/mixmatch`);
    const data = await res.json();
    dispatch({
      type: "FETCH_MIXMATCH",
      payload: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    dispatch({
      type: "FETCH_MIXMATCH",
      payload: [],
    });
  }
};

export const fetchHomepageProducts =
  (page = 1, limit = 20) =>
  async (dispatch) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/products?page=${page}&limit=${limit}`,
      );

      const data = await res.json();
      dispatch({
        type: "FETCH_HOMEPAGE_PRODUCTS",
        payload: Array.isArray(data.items) ? data.items : [],
      });
    } catch (error) {
      dispatch({
        type: "FETCH_HOMEPAGE_PRODUCTS",
        payload: [],
      });
    }
  };

// Shop categories thunk (matches ShopCatogries.jsx API call)
// Nav menu thunk — fetches the full navigation structure from the DB.
// Expected API response shape: same as the NAV_ITEMS array in Header.js
// (array of { key, label, href, desktopColumns?, items?, groups? })
export const fetchNavMenu = () => async (dispatch) => {
  try {
    const res = await fetch(`${API_BASE}/api/nav-menu`);
    if (!res.ok) {
      dispatch({ type: "FETCH_NAV_MENU", payload: [] });
      return;
    }
    const data = await res.json();
    dispatch({ type: "FETCH_NAV_MENU", payload: Array.isArray(data) ? data : [] });
  } catch {
    dispatch({ type: "FETCH_NAV_MENU", payload: [] });
  }
};

export const fetchShopCategories = () => async (dispatch) => {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (!res.ok) {
      dispatch({
        type: "FETCH_SHOP_CATEGORIES",
        payload: [],
      });
      return;
    }
    const data = await res.json();
    dispatch({
      type: "FETCH_SHOP_CATEGORIES",
      payload: Array.isArray(data) ? data : [],
    });
  } catch (error) {
    dispatch({
      type: "FETCH_SHOP_CATEGORIES",
      payload: [],
    });
  }
};

// Admin helper: save categories
// - If `categories` is a single object -> append 1 new category
// - If `categories` is an array       -> replace full list
export async function saveShopCategories(categories) {
  const isArray = Array.isArray(categories);

  const body = isArray
    ? categories.map((c) => ({
        title: c.title,
        count: c.count,
        image: c.image,
      }))
    : {
        title: categories.title,
        count: categories.count,
        image: categories.image,
      };

  const response = await fetch(`${API_BASE}/api/admin/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to save categories");
  }

  return response.json();
}

// Admin: update a category by numeric id
export async function updateShopCategory(category) {
  const { id, title, count, image } = category || {};
  const response = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, count, image }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to update category");
  }
  return response.json();
}

// Admin: delete a category by numeric id
export async function deleteShopCategory(id) {
  const response = await fetch(`${API_BASE}/api/admin/categories/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || "Failed to delete category");
  }
  return response.json();
}

// Create slider slide (plain API helper, no key changes)
export async function createSliderSlide(payload) {
  const response = await fetch(`${API_BASE}/api/admin/slider`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // same response, koi key/value change nahi
  return response.json();
}

export async function fetchMasterCategories() {
  return fetchJson(`${API_BASE}/api/master/categories`);
}

export async function createCatalogProduct(payload) {
  return fetchJson(`${API_BASE}/api/admin/catalog-products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchCatalogProducts(params = {}) {
  // Use POST body so filter values are not exposed in the URL
  return fetchJson(`${API_BASE}/api/admin/catalog-products/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function fetchCatalogProductById(id) {
  if (!id) throw new Error("id is required");
  return fetchJson(`${API_BASE}/api/admin/catalog-products/${id}`);
}

export async function updateCatalogProduct(id, payload) {
  if (!id) throw new Error("id is required");
  return fetchJson(`${API_BASE}/api/admin/catalog-products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function deleteCatalogProduct(id) {
  if (!id) throw new Error("id is required");
  return fetchJson(`${API_BASE}/api/admin/catalog-products/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  }).catch(async (e) => {
    // Some servers don't like body for DELETE; retry without body.
    return fetchJson(`${API_BASE}/api/admin/catalog-products/${id}`, {
      method: "DELETE",
    });
  });
}

// Cart API: add one item to cart in MongoDB (temporary userId supported)
export async function addToCartMongo(payload) {
  return fetchJson(`${API_BASE}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchCartMongo(userId) {
  return fetchJson(`${API_BASE}/api/cart/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: String(userId || "") }),
  });
}

export async function removeCartMongo(payload) {
  return fetchJson(`${API_BASE}/api/cart`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Wishlist APIs
export async function addToWishlistMongo(payload) {
  return fetchJson(`${API_BASE}/api/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function removeWishlistMongo(payload) {
  return fetchJson(`${API_BASE}/api/wishlist`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function fetchRecommendations(productId, limit = 6) {
  return fetchJson(`${API_BASE}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: String(productId || ""),
      limit,
    }),
  });
}

export async function createCheckout(payload) {
  return fetchJson(`${API_BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function estimateShippingRates(payload) {
  return fetchJson(`${API_BASE}/api/shipping/rates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function updateCartQtyMongo(payload) {
  return fetchJson(`${API_BASE}/api/cart/update-qty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Stock check APIs
export async function checkVariantStock(payload) {
  return fetchJson(`${API_BASE}/api/stock/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function validateCartStock(payload) {
  return fetchJson(`${API_BASE}/api/cart/validate-stock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Address APIs
export async function listAddresses(payload) {
  return fetchJson(`${API_BASE}/api/addresses/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function saveAddress(payload) {
  return fetchJson(`${API_BASE}/api/addresses/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function deleteAddress(payload) {
  return fetchJson(`${API_BASE}/api/addresses/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Coupon + Orders APIs
export async function validateCoupon(payload) {
  return fetchJson(`${API_BASE}/api/coupons/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function listOrders(payload) {
  return fetchJson(`${API_BASE}/api/orders/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Admin: replace the entire nav menu
export async function adminSaveNavMenu(navData) {
  const token = localStorage.getItem("token") || "";
  return fetchJson(`${API_BASE}/api/admin/nav-menu`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(navData),
  });
}

// Admin: list all users
export async function adminListUsers() {
  const token = localStorage.getItem("token") || "";
  return fetchJson(`${API_BASE}/api/admin/users`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Admin: list all orders
export async function adminListOrders() {
  const token = localStorage.getItem("token") || "";
  return fetchJson(`${API_BASE}/api/admin/orders`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function listAvailableCoupons(payload) {
  return fetchJson(`${API_BASE}/api/coupons/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Admin coupon APIs
export async function adminListCoupons() {
  return fetchJson(`${API_BASE}/api/admin/coupons/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

export async function adminCreateCoupon(payload) {
  return fetchJson(`${API_BASE}/api/admin/coupons/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

export async function adminDeleteCoupon(payload) {
  return fetchJson(`${API_BASE}/api/admin/coupons/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
}

// Plain async helper (used in QuickViewModal for wishlist status check)
export async function fetchWishlistList(userId) {
  return fetchJson(`${API_BASE}/api/wishlist/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: String(userId || "") }),
  });
}

export const fetchWishlistMongo = (userId) => async (dispatch) => {
  try {
    const res = await fetch(`${API_BASE}/api/wishlist/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: String(userId || "") }),
    });
    const data = await res.json();
    dispatch({
      type: "FETCH_WISHLIST",
      payload: data.items ? data.items : [],
    });
  } catch {
    dispatch({ type: "FETCH_WISHLIST", payload: [] });
  }
};

// Recently Viewed: fetch list for user
export const fetchRecentlyViewedMongo = (userId, limit = 10) => async (dispatch) => {
  try {
    const data = await fetchJson(`${API_BASE}/api/recently-viewed/list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: String(userId || ""), limit }),
    });
    dispatch({
      type: "FETCH_RECENTLY_VIEWED",
      payload: Array.isArray(data?.items) ? data.items : [],
    });
  } catch {
    dispatch({ type: "FETCH_RECENTLY_VIEWED", payload: [] });
  }
};

// Recently Viewed: add one product then refresh the list
export const addToRecentlyViewedMongo = (userId, product) => async (dispatch) => {
  try {
    await fetchJson(`${API_BASE}/api/recently-viewed/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: String(userId || ""),
        productId: String(product?.productId || product?._id || product?.id || ""),
        title: product?.title || product?.name || "Product",
        slug: product?.handle || product?.slug || "",
        price: Number(product?.priceSale || product?.priceRegular || product?.price) || 0,
        image: product?.mainImage?.src || product?.imageSrc || product?.image || "",
      }),
    });
    dispatch(fetchRecentlyViewedMongo(userId));
  } catch {
    // ignore — localStorage fallback still works
  }
};

export const removeFromWishlistThunk = ({ userId, wishlistItemId, productId }) => async (dispatch) => {
  try {
    await fetchJson(`${API_BASE}/api/wishlist`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: String(userId || ""),
        wishlistItemId: wishlistItemId || undefined,
        productId: wishlistItemId ? undefined : String(productId || ""),
      }),
    });
    dispatch(fetchWishlistMongo(String(userId || "")));
  } catch {
    // ignore — UI already reverted optimistically
  }
};

// ─── Auth helpers ────────────────────────────────────────────────────────────

function persistAuth(token, user) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");

  // Keep backward compatibility with places that read `localStorage.userId`
  // (and your current `getUserId()` helper).
  if (user && user._id) localStorage.setItem("userId", String(user._id));
  else localStorage.removeItem("userId");
}

// POST /api/auth/register
export const registerThunk = ({ firstName, lastName, email, phone, password }) => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, phone, password }),
    });
    dispatch({
      type: "AUTH_OTP_SENT",
      payload: { message: data.message || "OTP sent to your email", email: data.email || email },
    });
  } catch (err) {
    dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "Registration failed" } });
  }
};

// POST /api/auth/send-otp  (resend)
export const sendOtpThunk = (email) => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(email || "") }),
    });
    dispatch({
      type: "AUTH_OTP_SENT",
      payload: { message: data.message || "OTP sent", email },
    });
  } catch (err) {
    dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "Failed to send OTP" } });
  }
};

// POST /api/auth/verify-otp
export const verifyOtpThunk = (email, otp) => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(email || ""), otp: String(otp || "") }),
    });
    persistAuth(data.token, data.user);
    dispatch({
      type: "AUTH_SUCCESS",
      payload: { token: data.token, user: data.user, message: data.message },
    });
  } catch (err) {
    dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "OTP verification failed" } });
  }
};

// POST /api/auth/login
export const loginThunk = ({ email, password }) => async (dispatch) => {
  dispatch({ type: "AUTH_LOADING" });
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(email || ""), password: String(password || "") }),
    });
    persistAuth(data.token, data.user);
    dispatch({
      type: "AUTH_SUCCESS",
      payload: { token: data.token, user: data.user },
    });
  } catch (err) {
    // Check if the error indicates the account needs OTP verification
    if (err.message && err.message.includes("not verified")) {
      dispatch({
        type: "AUTH_NEEDS_OTP",
        payload: { error: err.message, email: String(email || "") },
      });
    } else {
      dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "Login failed" } });
    }
  }
};

// GET /api/auth/me  — refresh user details from server
export const fetchCurrentUser = () => async (dispatch, getState) => {
  const token = getState().auth?.token || localStorage.getItem("token");
  if (!token) return;
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    dispatch({ type: "AUTH_UPDATE_USER", payload: data.user });
  } catch {
    // token expired — log out silently
    dispatch({ type: "AUTH_LOGOUT" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// PATCH /api/auth/me  — update profile fields
export const updateProfileThunk = (fields) => async (dispatch, getState) => {
  dispatch({ type: "AUTH_LOADING" });
  const token = getState().auth?.token || localStorage.getItem("token");
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields || {}),
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    dispatch({ type: "AUTH_UPDATE_USER", payload: data.user });
  } catch (err) {
    dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "Profile update failed" } });
  }
};

// POST /api/auth/change-password
export const changePasswordThunk = ({ currentPassword, newPassword }) => async (dispatch, getState) => {
  dispatch({ type: "AUTH_LOADING" });
  const token = getState().auth?.token || localStorage.getItem("token");
  try {
    const data = await fetchJson(`${API_BASE}/api/auth/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    dispatch({ type: "AUTH_OTP_SENT", payload: { message: data.message || "Password changed" } });
  } catch (err) {
    dispatch({ type: "AUTH_ERROR", payload: { error: err.message || "Password change failed" } });
  }
};

// Logout — clear everything
export const logoutThunk = () => (dispatch) => {
  persistAuth(null, null);
  dispatch({ type: "AUTH_LOGOUT" });
};
