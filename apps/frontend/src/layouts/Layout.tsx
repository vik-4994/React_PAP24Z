import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@frontend/features/sidebar/AppSidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </SidebarInset>
    </SidebarProvider>
  );
}
