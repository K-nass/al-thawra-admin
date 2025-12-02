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


//this is navbar code for future use
// function Navbar() {
//   return (
    
//   <header className="h-16 flex-shrink-0 bg-white  border-b border-slate-200  flex items-center justify-between px-6">
//         <div>
//           <button className="text-slate-500 dark:text-slate-400">
//             <span className="material-symbols-outlined">menu</span>
//           </button>
//         </div>
//         <div className="flex items-center space-x-4">
//           <button className="bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium px-3 py-1.5 rounded-md flex items-center">
//             <span className="material-symbols-outlined text-base mr-1.5">
//               visibility
//             </span>
//             View Site
//           </button>
//           <button className="flex items-center text-sm">
//             <span className="mr-1">English</span>
//             <span className="material-symbols-outlined text-base">
//               arrow_drop_down
//             </span>
//           </button>
//           <button className="flex items-center text-sm">
//             <img
//               alt="Admin user avatar"
//               className="w-8 h-8 rounded-full"
//               src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzK96sFN3xfQY9MZpOPRWy6nyg4DrhEZIC-MQvl8YEVE7vsM0bo70CpYnlLqiehkzbZMTAoiGFJdDGwZ0fwM_T7yXUGogoy-s9xZJLGFLJo6xuB7LM2lnFqgKW7PdOD7ALSVRm-KNRtJQNGe9zvZhpP8_7swBbDqsZ10TyJOqf5H7ce5P_i7F_uwjS0Vi54ixNuXYteRoZit1EG7rxEH_ENMFj3rToTsS_fMmEeTY0M962FPmkjturOEB-IC1oRS6mALfoOydzQPHi"
//             />
//             <span className="ml-2 font-medium">admin</span>
//             <span className="material-symbols-outlined text-base ml-1">
//               arrow_drop_down
//             </span>
//           </button>
//         </div>
//       </header>
//   )
// }
