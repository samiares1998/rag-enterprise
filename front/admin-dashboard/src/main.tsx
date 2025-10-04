import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import './index.css' 

import OrdersApp from "./App";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <OrdersApp />
    </BrowserRouter>
  </React.StrictMode>
);
