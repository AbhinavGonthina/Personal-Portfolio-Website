import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { countVisit } from "./lib/visits";

// Every visit starts at the top of the town.
//
// The browser restores your old scroll position on a refresh, which
// here means being dropped into the middle of someone's living room
// with the camera already there and no idea how you arrived. The walk
// only makes sense from the beginning, and starting there also means
// there is no progress to persist or reconcile.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// One pixel to say somebody was here, after the page has loaded
// and never in front of anything. Does nothing until the site code
// in `lib/visits` is filled in.
countVisit();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
