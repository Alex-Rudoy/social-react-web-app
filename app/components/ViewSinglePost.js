import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import { useParams, Link, withRouter } from "react-router-dom";
import Axios from "axios";
import LoadingDotsIcon from "./LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import Error404 from "./Error404";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

function ViewSinglePost(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const { postid } = useParams();
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${postid}`, { cancelToken: cancelRequest.token });
        setPost(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (error) {
        console.log("There was a problem");
      }
    }
    fetchPost();
    return () => {
      cancelRequest.cancel();
    };
  }, [postid]);

  if (!isLoading && !post) {
    return <Error404 />;
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  }

  async function deleteHandler() {
    const areYouSure = window.confirm("Do you really want to delete this post?");
    if (areYouSure == true) {
      try {
        const response = await Axios.delete(`/post/${postid}`, { data: { token: appState.user.token } });
        if (response.data == "Success") {
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted" });
          props.history.push(`/profile/${appState.user.username}`);
        }
      } catch (error) {
        console.log("There was a problem");
      }
    }
  }
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() ? (
          <span className="pt-2">
            <Link to={`/post/${post._id}/edit`} className="text-primary mr-2" data-tip="Edit" data-for="edit">
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <a onClick={deleteHandler} className="delete-post-button text-danger" data-tip="Delete" data-for="delete">
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        ) : (
          ""
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown source={post.body} />
      </div>
    </Page>
  );
}

export default withRouter(ViewSinglePost);
