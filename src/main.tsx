// import React from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router-dom";
// import App from "./App";
// import "./style.css";

// createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// );
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // Change this line
import App from "./App";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>  {/* Changed from BrowserRouter */}
      <App />
    </HashRouter>
  </React.StrictMode>,
);