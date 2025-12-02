import { Link } from "react-router-dom";
import type { SidebarItemInterface } from "../DashboardSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

export default function DashboardSidebarItem({
  item,
  handleToggle,
}: {
  item: SidebarItemInterface;
  handleToggle?: () => void;
}) {
  const { t } = useTranslation();
  const label = t(item.labelKey);

  return (
    <li key={item.id} onClick={handleToggle} className="relative">
      <Link
        className="flex items-center text-gray-400 font-bold hover:text-gray-100 transition-colors relative group"
        to={item.path ?? "#"}
      >
        <FontAwesomeIcon
          icon={item.icon}
          className="text-lg sm:text-xl text-gray-400 font-bold hover:text-gray-100 flex-shrink-0"
        />
        {/* Label - hidden on small screens, shown on large screens */}
        <span className="ml-2 md:block hidden whitespace-nowrap">
          {label}
        </span>
        {/* Tooltip on small screens when hovering over icon */}
        <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-[100] md:hidden">
          {label}
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
        </span>
      </Link>
    </li>
  );
}
