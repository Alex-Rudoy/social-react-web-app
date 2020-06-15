import React, { useEffect, useState } from "react";
import Page from "./Page";
import Axios from "axios";
import { withRouter } from "react-router-dom";

function CreatePost(props) {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();

  async function handlePostSubmit(e) {
    e.preventDefault();
    try {
      const response = await Axios.post("/create-post", {
        title,
        body,
        token: localStorage.getItem("complexAppToken"),
      });
      console.log("New post created");
      // Redirect to new post url
      props.history.push(`/post/${response.data}`);
    } catch {
      console.log("Some problem occured");
    }
  }

  return (
    <Page title="New post">
      <form onSubmit={handlePostSubmit}>
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
            onChange={(e) => setTitle(e.target.value)}
          />
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
            onChange={(e) => setBody(e.target.value)}
          ></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
