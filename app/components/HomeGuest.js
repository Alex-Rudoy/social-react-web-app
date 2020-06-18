import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);
  // ! reducer setup

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0,
  };

  function reducer(draft, action) {
    switch (action.type) {
      case "usernameInstant":
        draft.username.hasErrors = false;
        draft.username.value = action.value;
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "Username can't exceed 30 characters";
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true;
          draft.username.message = "Username can only contain letters and numbers";
        }
        return;
      case "usernameDelay":
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 characters";
        }
        if (!draft.hasErrors && !action.noRequest) {
          draft.username.checkCount++;
        }
        return;
      case "usernameUnique":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "That username is already taken";
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "emailInstant":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        if (draft.email.value.length > 100) {
          draft.email.hasErrors = true;
          draft.email.message = "Email can't exceed 100 characters";
        }
        return;
      case "emailDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++;
        }
        return;
      case "emailUnique":
        if (action.value) {
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "That email is already being used";
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "passwordInstant":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password can't exceed 50 characters";
        }
        return;
      case "passwordDelay":
        if (draft.password.value.length < 8) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 8 characters";
        }
        return;
      case "submitForm":
        if (
          !draft.username.hasErrors &&
          !draft.email.hasErrors &&
          !draft.password.hasErrors &&
          draft.username.isUnique &&
          draft.email.isUnique
        ) {
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  // ! delayed check effects

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordDelay" }), 800);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  //! username unique check

  useEffect(() => {
    if (state.username.checkCount) {
      const cancelRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { cancelToken: cancelRequest.token }
          );
          dispatch({ type: "usernameUnique", value: response.data });
        } catch (error) {
          console.log("There was a problem");
        }
      }
      fetchResults();
      return () => cancelRequest.cancel();
    }
  }, [state.username.checkCount]);

  //! email unique check

  useEffect(() => {
    if (state.email.checkCount) {
      const cancelRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { cancelToken: cancelRequest.token }
          );
          dispatch({ type: "emailUnique", value: response.data });
        } catch (error) {
          console.log("There was a problem");
        }
      }
      fetchResults();
      return () => cancelRequest.cancel();
    }
  }, [state.email.checkCount]);

  //! submit registration handler

  function handleRegistration(e) {
    e.preventDefault();
    dispatch({ type: "usernameInstant", value: state.username.value });
    dispatch({ type: "usernameDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailInstant", value: state.email.value });
    dispatch({ type: "emailDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordInstant", value: state.password.value });
    dispatch({ type: "passwordDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
    console.log(state);
  }

  useEffect(() => {
    if (state.submitCount) {
      const cancelRequest = Axios.CancelToken.source();

      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/register",
            { username: state.username.value, email: state.email.value, password: state.password.value },
            { cancelToken: cancelRequest.token }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({ type: "flashMessage", value: "Welcome to the new account" });
        } catch (error) {
          console.log("There was a problem");
        }
      }
      fetchResults();
      return () => cancelRequest.cancel();
    }
  }, [state.submitCount]);

  //! JSX

  return (
    <Page wide={true} title="Welcome!">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">
            Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late
            90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet
            again.
          </p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleRegistration}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input
                value={state.username.value}
                id="username-register"
                name="username"
                className="form-control"
                type="text"
                placeholder="Pick a username"
                autoComplete="off"
                onChange={(e) => dispatch({ type: "usernameInstant", value: e.target.value })}
              />
              <CSSTransition in={state.username.hasErrors} timeout={300} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input
                value={state.email.value}
                id="email-register"
                name="email"
                className="form-control"
                type="text"
                placeholder="you@example.com"
                autoComplete="off"
                onChange={(e) => dispatch({ type: "emailInstant", value: e.target.value })}
              />
              <CSSTransition in={state.email.hasErrors} timeout={300} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input
                value={state.password.value}
                id="password-register"
                name="password"
                className="form-control"
                type="password"
                placeholder="Create a password"
                onChange={(e) => dispatch({ type: "passwordInstant", value: e.target.value })}
              />
              <CSSTransition in={state.password.hasErrors} timeout={300} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
