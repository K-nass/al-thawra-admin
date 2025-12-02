import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./components/Admin/Dashboard/DashboardHome/DashboardHome";
import DashboardAddPost from "./components/Admin/Dashboard/DashboardAddPost/DashboardAddPost";
import DashboardForm from "./components/Admin/Dashboard/DashboardAddPost/DashboardForm/DashboardForm";
import DashboardEditPost from "./components/Admin/Dashboard/DashboardEditPost/DashboardEditPost";
import DashboardPosts from "./components/Admin/Dashboard/DashboardPosts/DashboardPosts";
import DashboardCategories from "./components/Admin/Dashboard/DashboardCategories/DashboardCategories";
import DashboardAddCategory from "./components/Admin/Dashboard/DashboardAddCategory/DashboardAddCategory";
import PageForm from "./components/Admin/Dashboard/DashboardPages/PageForm";
import Magazines from "./components/Admin/Magazines/Magazines";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { getAuthToken } from "./api/client";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import Roles from "./components/Admin/Dashboard/Roles/Roles";
import AddRole from "./components/Admin/Dashboard/AddRole/AddRole";
import EditRole from "./components/Admin/Dashboard/EditRole/EditRole";
import Users from "./components/Admin/Dashboard/Users/Users";
import EditUser from "./components/Admin/Dashboard/EditUser/EditUser";
import Home from "./components/Home/Home";



// Wrapper component to redirect authenticated users away from login/register
function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  if (token) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

// Root layout component that handles document title
function RootLayout() {
  useDocumentTitle();
  return <Outlet />;
}

export const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "login",
        element: <AuthPageWrapper><Login /></AuthPageWrapper>,
      },
      {
        path: "register",
        element: <AuthPageWrapper><Register /></AuthPageWrapper>,
      },
      {
        path: "",
        element: <AuthPageWrapper><Login /></AuthPageWrapper>,
      },
      {
        path: "home",
        element: <ProtectedRoute><Home /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <AdminProtectedRoute><ErrorBoundary><DashboardLayout /></ErrorBoundary></AdminProtectedRoute>,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "post-format", element: <DashboardAddPost /> },
          { path: "add-post", element: <DashboardForm /> },
          { path: "edit-post/:postId", element: <DashboardEditPost /> },
          { path: "posts/all", element: <DashboardPosts label="Posts" /> },
          { path: "posts/slider-posts", element: <DashboardPosts label="Slider Posts" /> },
          { path: "posts/featured-posts", element: <DashboardPosts label="Featured Posts" /> },
          { path: "posts/breaking-news", element: <DashboardPosts label="Breaking News" /> },
          { path: "pages", element: <DashboardPosts label="pages" /> },
          { path: "add-page", element: <PageForm /> },
          { path: "edit-page/:id", element: <PageForm /> },
          { path: "magazines", element: <Magazines /> },
          { path: "roles-permissions", element: <Roles /> },

          { path: "add-role", element: <AddRole /> },
          { path: "edit-role/:id", element: <EditRole /> },
          { path: "users", element: <Users /> },
          { path: "edit-user/:id/:username", element: <EditUser /> },
          { path: "categories", element: <DashboardCategories /> },
          { path: "add-category", element: <DashboardAddCategory /> },
          { path: "edit-category/:id", element: <DashboardAddCategory /> }

        ]
      }
    ]
  }
]);
