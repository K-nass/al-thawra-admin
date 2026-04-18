import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./components/Admin/Dashboard/DashboardHome/DashboardHome";
import DashboardAddPost from "./components/Admin/Dashboard/DashboardAddPost/DashboardAddPost";
import DashboardForm from "./components/Admin/Dashboard/DashboardAddPost/DashboardForm/DashboardForm";
import DashboardEditPost from "./components/Admin/Dashboard/DashboardEditPost/DashboardEditPost";
import DashboardPosts from "./components/Admin/Dashboard/DashboardPosts/DashboardPosts";
import DashboardCategories from "./components/Admin/Dashboard/DashboardCategories/DashboardCategories";
import DashboardAddCategory from "./components/Admin/Dashboard/DashboardAddCategory/DashboardAddCategory";
import DashboardReels from "./components/Admin/Dashboard/DashboardReels/DashboardReels";
import DashboardEditReel from "./components/Admin/Dashboard/DashboardReels/DashboardEditReel";
import DashboardTags from "./components/Admin/Dashboard/DashboardTags/DashboardTags";
import TagForm from "./components/Admin/Dashboard/DashboardTags/TagForm";
import Magazines from "./components/Admin/Magazines/Magazines";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { PermissionRouteGuard } from "./components/AdminProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { SidebarProvider } from "./contexts/SidebarContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
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
        element: <AdminProtectedRoute><ErrorBoundary><SidebarProvider><PermissionsProvider><DashboardLayout /></PermissionsProvider></SidebarProvider></ErrorBoundary></AdminProtectedRoute>,
        children: [
          { index: true, element: <PermissionRouteGuard><DashboardHome /></PermissionRouteGuard> },
          { path: "post-format", element: <PermissionRouteGuard><DashboardAddPost /></PermissionRouteGuard> },
          { path: "add-post", element: <PermissionRouteGuard><DashboardForm /></PermissionRouteGuard> },
          { path: "edit-post/:postId", element: <PermissionRouteGuard><DashboardEditPost /></PermissionRouteGuard> },
          { path: "posts/all", element: <PermissionRouteGuard><DashboardPosts mode="all" /></PermissionRouteGuard> },
          { path: "posts/slider-posts", element: <PermissionRouteGuard><DashboardPosts mode="slider" /></PermissionRouteGuard> },
          { path: "posts/featured-posts", element: <PermissionRouteGuard><DashboardPosts mode="featured" /></PermissionRouteGuard> },
          { path: "posts/breaking-news", element: <PermissionRouteGuard><DashboardPosts mode="breaking" /></PermissionRouteGuard> },
          { path: "magazines", element: <PermissionRouteGuard><Magazines /></PermissionRouteGuard> },
          { path: "roles-permissions", element: <PermissionRouteGuard><Roles /></PermissionRouteGuard> },

          { path: "add-role", element: <PermissionRouteGuard><AddRole /></PermissionRouteGuard> },
          { path: "edit-role/:id", element: <PermissionRouteGuard><EditRole /></PermissionRouteGuard> },
          { path: "users", element: <PermissionRouteGuard><Users /></PermissionRouteGuard> },
          { path: "edit-user/:id/:username", element: <PermissionRouteGuard><EditUser /></PermissionRouteGuard> },
          { path: "categories", element: <PermissionRouteGuard><DashboardCategories /></PermissionRouteGuard> },
          { path: "add-category", element: <PermissionRouteGuard><DashboardAddCategory /></PermissionRouteGuard> },
          { path: "edit-category/:slug", element: <PermissionRouteGuard><DashboardAddCategory /></PermissionRouteGuard> },
          { path: "reels", element: <PermissionRouteGuard><DashboardReels /></PermissionRouteGuard> },
          { path: "edit-reel/:id", element: <PermissionRouteGuard><DashboardEditReel /></PermissionRouteGuard> },
          { path: "tags", element: <PermissionRouteGuard><DashboardTags /></PermissionRouteGuard> },
          { path: "add-tag", element: <PermissionRouteGuard><TagForm /></PermissionRouteGuard> },
          { path: "edit-tag/:id", element: <PermissionRouteGuard><TagForm /></PermissionRouteGuard> }

        ]
      }
    ]
  }
]);
