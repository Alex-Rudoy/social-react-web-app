import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";
import Post from "./Post";

function ProfilePosts(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();
  const appState = useContext(StateContext);

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: cancelRequest.token });
        setPosts(response.data);
        setIsLoading(false);
        console.log(response.data);
      } catch (error) {
        console.log("There was a problem");
      }
    }
    fetchPosts();
    return () => {
      cancelRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  if (posts.length == 0) {
    return <p>{appState.user.username == props.profile ? "You have" : "This user has"} no posts yet</p>;
  }

  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post noAuthor={true} post={post} key={post._id} />;
      })}
    </div>
  );
}

export default ProfilePosts;
