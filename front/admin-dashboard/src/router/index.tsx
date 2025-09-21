import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Chat from "../pages/Chat";
import AdminLayout from "../layouts/AdminLayout";
import Documents from "../pages/Documents";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "chat", element: <Chat /> },
      { path: "documents", element: <Documents /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
