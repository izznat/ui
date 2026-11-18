import { createRouter } from "@solidjs/router";
import { render } from "@solidjs/web";
import { fileRoutes } from "@solidjs/router/fs";

import { pageRoutes } from "virtual:file-routes";

import "./main.css";

const Router = createRouter({ routes: fileRoutes(pageRoutes) });
const App = () => <Router>{(props) => <>{props.children}</>}</Router>;

const Root = document.getElementById("root");
if (!Root) {
  throw new Error("DOM element with the id of `root` is required to mount the dashboard.");
}

render(App, Root);
