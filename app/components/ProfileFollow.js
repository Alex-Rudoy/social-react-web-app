import React, { useEffect, useState, useContext } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";
import StateContext from "../StateContext";

function ProfileFollow(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();
  const appState = useContext(StateContext);

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/${props.action}`, { cancelToken: cancelRequest.token });
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
  }, [username, props.action]);

  if (isLoading) return <LoadingDotsIcon />;

  if (posts.length == 0) {
    if (props.action == "following") {
      return <p>{appState.user.username == props.profile ? "You are" : "This user is"} not following anyone yet</p>;
    } else {
      return <p>{appState.user.username == props.profile ? "You have" : "This user has"} no followers yet</p>;
    }
  }

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        );
      })}
    </div>
  );
}

export default ProfileFollow;
