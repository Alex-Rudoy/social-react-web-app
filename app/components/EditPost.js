import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { useParams, Link } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import { useImmerReducer } from "use-immer";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import Error404 from "./Error404";

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  //! post reducer

  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().postid,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "notFound":
        draft.notFound = true;
        return;
      case "titleChange":
        draft.title.value = action.value;
        draft.title.hasErrors = false;
        draft.title.message = "";
        return;
      case "bodyChange":
        draft.body.value = action.value;
        draft.body.hasErrors = false;
        draft.body.message = "";
        return;
      case "submitRequest":
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return;
      case "titleValidation":
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = "You must provide a title";
        }
        return;
      case "bodyValidation":
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = "You must provide a content";
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  //! fetch post data from server

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: cancelRequest.token });
        if (response.data) {
          dispatch({ type: "fetchComplete", value: response.data });
          if (appState.user.username != response.data.author.username) {
            dispatch({ type: "notFound" });
          }
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (error) {
        console.log("There was a problem (edit post-get post data");
      }
    }
    fetchPost();
    return () => {
      cancelRequest.cancel();
    };
  }, []);

  //! update post

  async function handlePostSubmit(e) {
    e.preventDefault();
    dispatch({ type: "titleValidation", value: state.title.value });
    dispatch({ type: "bodyValidation", value: state.body.value });
    dispatch({ type: "submitRequest" });
  }

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "saveRequestStarted" });
      const cancelRequest = Axios.CancelToken.source();

      async function updatePost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            { title: state.title.value, body: state.body.value, token: appState.user.token },
            { cancelToken: cancelRequest.token }
          );
          console.log("Post updated");
          dispatch({ type: "saveRequestFinished" });
          appDispatch({ type: "flashMessage", value: "Congrats, you've successfully updated a post" });
        } catch (error) {
          console.log("There was a problem here (edit post-update post");
        }
      }
      updatePost();
      return () => {
        cancelRequest.cancel();
      };
    }
  }, [state.sendCount]);

  //! loader
  if (state.notFound) {
    return <Error404 />;
  }

  if (state.isFetching)
    return (
      <Page title="Edit post">
        <LoadingDotsIcon />
      </Page>
    );

  //! content

  return (
    <Page title="Edit post">
      <Link to={`/post/${state.id}`} className="small font-weight-bold">
        &laquo; Back to the post
      </Link>
      <form className="mt-3" onSubmit={handlePostSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            value={state.title.value}
            onChange={(e) => {
              dispatch({ type: "titleChange", value: e.target.value });
            }}
            onBlur={(e) => dispatch({ type: "titleValidation", value: e.target.value })}
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">{state.title.message}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onChange={(e) => dispatch({ type: "bodyChange", value: e.target.value })}
            onBlur={(e) => dispatch({ type: "bodyValidation", value: e.target.value })}
          />
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">{state.body.message}</div>
          )}
        </div>
        <button className="btn btn-primary" disabled={state.isSaving}>
          {state.isSaving ? "Saving..." : "Update the post"}
        </button>
      </form>
    </Page>
  );
}

export default EditPost;
