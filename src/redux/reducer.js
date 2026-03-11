import { INCREMENT_COUNTER } from "./actions";

const initialState = {
  counter: 0,
};

export const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return {
        ...state,
        counter: state.counter + 1,
      };
    default:
      return state;
  }
};

