import { Outlet } from "react-router-dom";
import DashboardSidebar from "../components/Admin/Dashboard/DashboardSidebar/DashboardSidebar";
import { useSidebar } from "../contexts/SidebarContext";

export default function DashboardLayout() {
  const { isDesktopSidebarOpen } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" data-admin-panel="true">
      <DashboardSidebar />
      <div 
        className={`flex-1 overflow-y-auto w-full transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? "md:ml-64" : "md:ml-20"
        } pt-16 md:pt-0`} // pt-16 for mobile header space
      >
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[15px] leading-relaxed">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
