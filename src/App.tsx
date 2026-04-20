import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthRefresh } from "./hooks/useAuthRefresh";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ToastProvider } from "./components/Toast/ToastContainer";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Loader from "./components/Common/Loader";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 3,
    },
  },
});

function AppContent() {
  const { isLoading } = useAuthRefresh();
  const { i18n } = useTranslation();

  // Set document direction based on language
  useEffect(() => {
    const isRTL = i18n.language === 'ar';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routes}></RouterProvider>
    </QueryClientProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
}
