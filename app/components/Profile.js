import React, { useEffect, useContext, useState } from "react";
import Page from "./Page";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import { useImmer } from "use-immer";
import ProfileFollow from "./ProfileFollow";

function Profile(props) {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: {
        postCount: "",
        followerCount: "",
        followingCount: "",
      },
    },
  });

  //! page loader

  useEffect(() => {
    const cancelRequest = Axios.CancelToken.source();

    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: cancelRequest.token }
        );
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        console.log("There was a problem");
      }
    }
    fetchData();
    return () => {
      cancelRequest.cancel();
    };
  }, [username]);

  //!follow functionality

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const cancelRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: cancelRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log("There was a problem");
          draft.followActionLoading = false;
        }
      }
      fetchData();
      return () => {
        cancelRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  //! unfollow functionality

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followActionLoading = true;
      });
      const cancelRequest = Axios.CancelToken.source();

      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: cancelRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          });
        } catch (error) {
          console.log("There was a problem");
          draft.followActionLoading = false;
        }
      }
      fetchData();
      return () => {
        cancelRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  return (
    <Page title={`${appState.user.username}'s profile`}>
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn &&
        appState.user.username != state.profileData.profileUsername &&
        state.profileData.profileUsername != "..." ? (
          !state.profileData.isFollowing ? (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          ) : (
            <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
              Unfollow <i className="fas fa-user-times"></i>
            </button>
          )
        ) : (
          ""
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to={`/profile/${state.profileData.profileUsername}`} exact className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/followers`} className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to={`/profile/${state.profileData.profileUsername}/following`} className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route path={`/profile/:username`} exact>
          <ProfilePosts />
        </Route>
        <Route path={`/profile/:username/followers`}>
          <ProfileFollow action="followers" profile={state.profileData.profileUsername} />
        </Route>
        <Route path={`/profile/:username/following`}>
          <ProfileFollow action="following" profile={state.profileData.profileUsername} />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
