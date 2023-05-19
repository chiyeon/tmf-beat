import React from 'react';
import ReactDOM from 'react-dom/client';
import {
   createBrowserRouter,
   RouterProvider,
} from "react-router-dom";

import "./index.css"

import Home from "./pages/home/home.jsx"
import Listen from "./pages/listen/listen.jsx"
import Vote from "./pages/vote/vote.jsx"
import Secret from "./pages/secret/secret.jsx"

const router = createBrowserRouter([
   {
     path: "/",
     element: <Home />
   },
   {
      path: "/listen",
      element: <Listen />
   },
   {
      path: "/vote",
      element: <Vote />
   },
   {
      path: "/uki",
      element: <Secret />
   }
 ]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <React.StrictMode>
      <RouterProvider router={router} />
   </React.StrictMode>
);
