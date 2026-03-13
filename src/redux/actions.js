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

// Create slider slide (plain API helper, no key changes)

export async function createSliderSlide(payload) {
  const response = await fetch("https://website-backend-bot8.vercel.app/api/admin/slider", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // same response, koi key/value change nahi
  return response.json();
}
