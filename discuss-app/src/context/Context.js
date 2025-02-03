// Context.js
import { createContext, useEffect, useReducer } from "react";
import Reducer from "./Reducer";

// Hardcoded admin credentials
const ADMINS = [
  { email: "saranriderz22@gmail.com", password: "saran@2004", username: "Saranriderz" },
  { email: "tharshilinbanu@gmail.com", password: "tharshilin@2003", username: "Tharshilin" },
  { email: "skmadhumitha1999@gmail.com", password: "madhumitha@2004", username: "Madhu" },
];

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
  admins: ADMINS, // Add admins to the state
};

export const Context = createContext(INITIAL_STATE);

export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  // Function to update admin username
  const updateAdminUsername = (email, newUsername) => {
    const updatedAdmins = state.admins.map((admin) =>
      admin.email === email ? { ...admin, username: newUsername } : admin
    );
    dispatch({ type: "UPDATE_ADMINS", payload: updatedAdmins });
  };

  return (
    <Context.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        admins: state.admins,
        dispatch,
        updateAdminUsername,
      }}
    >
      {children}
    </Context.Provider>
  );
};