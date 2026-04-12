import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Admin/Dashboard/DashboardSidebar/DashboardSidebar";

export default function DashboardLayout() {
  return (
    <div className="flex flex-col md:flex-row h-screen">
     
        <DashboardSidebar />
      <div className="flex-1 overflow-y-auto md:ml-0 pt-14 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
}