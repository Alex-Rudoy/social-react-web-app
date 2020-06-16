import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Page from "./Page";

function Error404(props) {
  return (
    <Page title="Page not found">
      <div className="text-center">
        <h2>Whoops, can't find this page</h2>
        <p className="lead text-muted">
          You can always visit the <Link to="/">homepage</Link>
        </p>
      </div>
    </Page>
  );
}

export default Error404;
