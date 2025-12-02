import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RouteTitle {
  path: string;
  titleKey: string;
}

const routeTitles: RouteTitle[] = [
  { path: '/admin', titleKey: 'dashboard.home' },
  { path: '/admin/post-format', titleKey: 'dashboard.postFormat' },
  { path: '/admin/add-post', titleKey: 'post.addPost' },
  { path: '/admin/posts/all', titleKey: 'dashboard.allPosts' },
  { path: '/admin/posts/slider-posts', titleKey: 'dashboard.sliderPosts' },
  { path: '/admin/posts/featured-posts', titleKey: 'dashboard.featuredPosts' },
  { path: '/admin/posts/breaking-news', titleKey: 'dashboard.breakingNews' },
  { path: '/login', titleKey: 'auth.login' },
  { path: '/register', titleKey: 'auth.register' },
];

export function useDocumentTitle() {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const route = routeTitles.find(r => r.path === location.pathname);
    const titleKey = route?.titleKey || 'app.name';
    const title = t(titleKey);
    
    document.title = `${title} | ${t('app.nameAlt')}`;
  }, [location.pathname, t]);
}
