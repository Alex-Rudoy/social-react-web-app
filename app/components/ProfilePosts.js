import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";
import Post from "./Post";

function ProfilePosts(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [notFound, setNotfound] = useState(false);
  const { username } = useParams();
  const appState = useContext(StateContext);

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: cancelRequest.token });
        if (response.data) {
          setPosts(response.data);
        }
        console.log(response.data);
        setIsLoading(false);
        console;
      } catch (error) {
        console.log("There was a problem (profile posts - get posts)");
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
