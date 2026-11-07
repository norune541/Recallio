import { useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  Settings2,
  Sparkles,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar';
import { UserButton } from '@clerk/react';

import logo from './public/logo.svg';

const navigation = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/',
    activePaths: ['/products'],
  },
  { label: 'Conversations', icon: MessageSquareText, path: '/conversations' },
  { label: 'AI Summaries', icon: Sparkles, path: '/summaries' },
  { label: 'Integrations', icon: Store, path: '/integrations' },
  { label: 'Settings', icon: Settings2, path: '/settings' },
];

function SidebarToggle() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      title={open ? 'Close sidebar' : 'Open sidebar'}
      className="-ml-1"
    >
      {open ? (
        <PanelLeftClose className="size-4" />
      ) : (
        <PanelLeftOpen className="size-4" />
      )}
    </Button>
  );
}

export default function AppLayout() {
  return (
    <SidebarProvider>
      <Toaster position="bottom-right" />
      <AppLayoutContent />
    </SidebarProvider>
  );
}

function AppLayoutContent() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-2 py-1">
            <img src={logo} alt="Recallio" className="max-w-10" />
            <p className="font-bold">Recallio</p>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>

            <SidebarMenu className="gap-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === '/'
                    ? pathname === '/' ||
                      item.activePaths?.some(
                        (path) =>
                          pathname === path || pathname.startsWith(`${path}/`),
                      ) === true
                    : pathname === item.path ||
                      pathname.startsWith(`${item.path}/`);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className="block"
                  >
                    <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </NavLink>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarToggle />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Recallio Workspace</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Customer support intelligence
              </p>
            </div>
          </div>

          <UserButton />
        </header>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </>
  );
}
