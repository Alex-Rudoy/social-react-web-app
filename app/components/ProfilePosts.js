import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfilePosts(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

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
  }, []);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map((post) => {
        const date = new Date(post.createdDate);
        const dateFormatted = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return (
          <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
            <span className="text-muted small">on {dateFormatted}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;
