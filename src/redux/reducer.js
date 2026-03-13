

const initialState = {
 
  slider: [],
};

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_SLIDER":
      return {
        ...state,
        slider: action.payload,
      };

    default:
      return state;
  }
};
