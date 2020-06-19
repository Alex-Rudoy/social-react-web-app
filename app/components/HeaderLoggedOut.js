import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";

function HeaderLoggedOut(props) {
  const [state, setState] = useImmer({
    username: {
      value: "",
      hasErrors: false,
    },
    password: {
      value: "",
      hasErrors: false,
    },
  });
  const appDispatch = useContext(DispatchContext);

  async function handleSubmit(e) {
    e.preventDefault();
    if (state.username.value && state.password.value) {
      try {
        const response = await Axios.post("/login", { username: state.username.value, password: state.password.value });
        if (response.data) {
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMessage", value: "You have successfully logged in" });
        } else {
          appDispatch({ type: "flashMessage", value: "Invalid username/password", style: "alert-danger" });
        }
      } catch (e) {
        console.log(e.response.data);
      }
    } else {
      appDispatch({ type: "flashMessage", value: "Please provide a username and password", style: "alert-danger" });
      if (!state.username.value) {
        setState((draft) => {
          draft.username.hasErrors = true;
        });
      }
      if (!state.password.value) {
        setState((draft) => {
          draft.password.hasErrors = true;
        });
      }
    }
  }

  return (
    <form className="mb-0 pt-2 pt-md-0" onSubmit={handleSubmit}>
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            value={state.username.value}
            name="username"
            className={`form-control form-control-sm input-dark ${state.username.hasErrors ? "is-invalid" : ""}`}
            type="text"
            placeholder="Username"
            autoComplete="off"
            onChange={(e) => {
              const value = e.target.value;
              setState((draft) => {
                draft.username.value = value;
                draft.username.hasErrors = false;
              });
            }}
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            value={state.password.value}
            name="password"
            className={`form-control form-control-sm input-dark ${state.password.hasErrors ? "is-invalid" : ""}`}
            type="password"
            placeholder="Password"
            onChange={(e) => {
              const value = e.target.value;
              setState((draft) => {
                draft.password.value = value;
                draft.password.hasErrors = false;
              });
            }}
          />
        </div>
        <div className="col-md-auto">
          <button className="btn btn-success btn-sm">Sign In</button>
        </div>
      </div>
    </form>
  );
}

export default HeaderLoggedOut;
