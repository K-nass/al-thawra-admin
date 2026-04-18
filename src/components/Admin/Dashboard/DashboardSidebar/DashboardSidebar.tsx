import React, { useEffect } from 'react';
import {
  Home,
  FileText,
  FilePlus,
  Files,
  Rss,
  Star,
  Zap,
  Video,
  Layers,
  Tags,
  BookOpen,
  Users,
  Key,
  LogOut,
  Menu,
  X,
  SidebarClose,
  SidebarOpen
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

import { useSidebar } from '@/contexts/SidebarContext';
import { useLogout } from '@/hooks/useLogout';
import DashboardProfileCard from './DashboardProfileCard/DashboardProfileCard';
import SidebarItem, { type SidebarItemData } from './SidebarItem';
import SidebarToggleButton from './SidebarToggleButton';
import LanguageToggle from '@/components/LanguageToggle/LanguageToggle';

const getSidebarItems = (): SidebarItemData[] => [
  { id: 0, labelKey: 'dashboard.home', icon: Home, path: '/admin' },
  { id: 2, labelKey: 'dashboard.addPost', icon: FilePlus, path: '/admin/post-format' },
  { id: 3, labelKey: 'dashboard.allPosts', icon: Files, path: '/admin/posts/all' },
  { id: 4, labelKey: 'dashboard.sliderPosts', icon: Rss, path: '/admin/posts/slider-posts' },
  { id: 5, labelKey: 'dashboard.featuredPosts', icon: Star, path: '/admin/posts/featured-posts' },
  { id: 6, labelKey: 'dashboard.breakingNews', icon: Zap, path: '/admin/posts/breaking-news' },
  { id: 7, labelKey: 'dashboard.reels', icon: Video, path: '/admin/reels' },
  { id: 8, labelKey: 'dashboard.categories', icon: Layers, path: '/admin/categories' },
  { id: 9, labelKey: 'dashboard.tags', icon: Tags, path: '/admin/tags' },
  { id: 10, labelKey: 'dashboard.magazines', icon: BookOpen, path: '/admin/magazines' },
  { id: 11, labelKey: 'dashboard.users', icon: Users, path: '/admin/users' },
  { id: 12, labelKey: 'dashboard.rolesAndPermissions', icon: Key, path: '/admin/roles-permissions' },
];

export default function DashboardSidebar() {
  const { t } = useTranslation();
  const { logout, isLoading } = useLogout();
  const {
    isDesktopSidebarOpen,
    toggleDesktopSidebar,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar
  } = useSidebar();

  const sidebarItems = getSidebarItems();

  // Handle keyboard navigation (escape key to close mobile menu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        closeMobileSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, closeMobileSidebar]);

  return (
    <>
      {/* Mobile Toggle Button (Fixed on top left) */}
      <button
        type="button"
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-[#1A1F2B] text-white rounded-xl shadow-lg hover:bg-slate-800 transition-colors duration-200"
        aria-label={t("common.toggle")}
      >
        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Main Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isDesktopSidebarOpen ? 256 : 80, // 256px = 16rem = w-64, 80px = 5rem = w-20
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col
          bg-[#1A1F2B] text-slate-300 border-r border-[#2A3143]
          transform md:translate-x-0 transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:w-auto'}
        `}
      >
        {/* Header section */}
        <div className={`p-4 shrink-0 flex transition-all duration-300 ${isDesktopSidebarOpen ? 'items-center justify-between h-[4.5rem]' : 'flex-col items-center gap-6 py-6'}`}>
          <div className={`flex items-center ${isDesktopSidebarOpen ? '' : 'justify-center w-full'}`}>
            {/* Placeholder Logo / Brand */}
            <div className={`w-9 h-9 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-sm ${isDesktopSidebarOpen ? 'mr-3' : 'mx-auto'}`}>
              <img src="/icon.jpg" alt="Al-Thawra Logo" loading="lazy" className="w-full h-full object-cover" />
            </div>
            
            <AnimatePresence>
              {isDesktopSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-lg font-bold text-white tracking-wide">
                    {t('dashboard.adminPanel')}
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Toggle Button embedded in header */}
          <div className={`hidden md:flex ${isDesktopSidebarOpen ? 'flex-1 justify-end' : 'justify-center w-full'}`}>
            <SidebarToggleButton
              onClick={toggleDesktopSidebar}
              icon={isDesktopSidebarOpen ? SidebarClose : SidebarOpen}
            />
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-4 py-2 shrink-0 hidden md:block">
          <AnimatePresence>
            {isDesktopSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <DashboardProfileCard />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 scrollbar-hide space-y-1.5">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 shrink-0 border-t border-[#2A3143] flex flex-col gap-4">
          <div className={`flex ${isDesktopSidebarOpen || isMobileSidebarOpen ? 'justify-start' : 'justify-center'} px-2`}>
            <LanguageToggle variant="dark" showLabel={isDesktopSidebarOpen || isMobileSidebarOpen} />
          </div>

          <button
            type="button"
            onClick={() => logout()}
            disabled={isLoading}
            title={!isDesktopSidebarOpen ? t('dashboard.logout') : undefined}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 disabled:opacity-50 group"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <AnimatePresence>
              {isDesktopSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-medium whitespace-nowrap overflow-hidden"
                >
                  {isLoading ? t('common.loading') : t('dashboard.logout')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  );
}
