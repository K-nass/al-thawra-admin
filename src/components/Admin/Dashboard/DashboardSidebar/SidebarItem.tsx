import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { type LucideIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';

export interface SidebarItemData {
  id: number;
  labelKey: string;
  icon: LucideIcon;
  path?: string;
  children?: SidebarItemData[];
}

interface SidebarItemProps {
  item: SidebarItemData;
}

export default function SidebarItem({ item }: SidebarItemProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { isDesktopSidebarOpen, isMobileSidebarOpen, closeMobileSidebar } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  const translatedLabel = t(item.labelKey);
  const label = translatedLabel === item.labelKey ? item.labelKey : translatedLabel;
  const hasChildren = item.children && item.children.length > 0;

  const normalizePath = (path: string) => {
    if (path.length > 1 && path.endsWith('/')) {
      return path.slice(0, -1);
    }
    return path;
  };

  const isPathActive = (path?: string) => {
    if (!path) return false;

    const currentPath = normalizePath(location.pathname);
    const targetPath = normalizePath(path);

    if (currentPath === targetPath) return true;
    if (targetPath === '/admin') return false;

    return currentPath.startsWith(`${targetPath}/`);
  };

  // Determine active state, including checking children
  const isSelfActive = isPathActive(item.path);

  const isChildActive = hasChildren ? item.children!.some(child => 
    isPathActive(child.path)
  ) : false;

  const isActive = isSelfActive || isChildActive;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else {
      // Close mobile sidebar on navigation
      if (window.innerWidth < 768) {
        closeMobileSidebar();
      }
    }
  };

  const content = (
    <>
      <item.icon
        size={21}
        className={`flex-shrink-0 transition-colors ${
          isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-100'
        }`}
      />
      
      <AnimatePresence>
        {(isDesktopSidebarOpen || isMobileSidebarOpen) && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-3 text-[15px] font-semibold whitespace-nowrap overflow-hidden flex-1"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Dropdown Indicator */}
      {hasChildren && (isDesktopSidebarOpen || isMobileSidebarOpen) && (
        <span className="ml-auto flex-shrink-0 text-slate-500">
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}

      {/* Active Indicator Bar */}
      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
    </>
  );

  const containerClasses = `
    flex items-center px-4 py-3.5 my-1 rounded-xl transition-colors duration-200 relative group cursor-pointer
    ${isActive 
      ? 'bg-primary/10 text-primary' 
      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }
  `;

  // Always use the native title attribute to provide a robust tooltip that
  // cannot be clipped by `overflow-y-auto` of the parent sidebar container.
  const tooltipTitle = !isDesktopSidebarOpen && !isMobileSidebarOpen ? label : undefined;

  return (
    <div>
      {hasChildren ? (
        <div className={containerClasses} onClick={handleClick} title={tooltipTitle}>
          {content}
        </div>
      ) : (
        <Link to={item.path ?? "#"} className={containerClasses} onClick={handleClick} title={tooltipTitle}>
          {content}
        </Link>
      )}

      {/* Nested Dropdown */}
      <AnimatePresence>
        {hasChildren && isOpen && (isDesktopSidebarOpen || isMobileSidebarOpen) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4 pl-4 border-l border-slate-700 space-y-1"
          >
            {item.children!.map((child) => (
              <SidebarItem key={child.id} item={child} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
