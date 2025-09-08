import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/Login";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/reset-password", element: <ResetPassword /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}