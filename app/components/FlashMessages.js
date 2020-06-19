import React, { useEffect, useContext } from "react";
import StateContext from "../StateContext";

function FlashMessages(props) {
  const appState = useContext(StateContext);

  return (
    <div className="floating-alerts">
      {appState.flashMessages.map((content, index) => {
        return (
          <div
            key={index}
            className={`alert ${content.style ? content.style : "alert-success"} text-center floating-alert shadow-sm`}
          >
            {content.msg}
          </div>
        );
      })}
    </div>
  );
}

export default FlashMessages;
