import * as React from 'react';
import { useState, useEffect } from 'react';
import { ArrowRightLeft, Home, School } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavUser } from './nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { ThemeToggle } from '@frontend/components/ThemeToggle';

const Logo = (
  <svg
    fill="none"
    width="30"
    height="30"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className="icon line-color"
  >
    <polyline
      points="7 17 4 14 20 14"
      className="stroke-blue-500"
      style={{
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }}
    />
    <polyline
      points="17 7 20 10 4 10"
      className="stroke-current dark:stroke-white"
      style={{
        fill: 'none',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
      }}
    />
  </svg>
);

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t, i18n } = useTranslation();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const pages = [
    { name: t('home'), url: '/', icon: Home },
    { name: t('subjects'), url: '/subjects', icon: School },
    { name: t('exchanges'), url: '/exchanges', icon: ArrowRightLeft },
    { name: t('all_exchanges'), url: '/enter-code', icon: HamburgerMenuIcon },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex items-center space-x-2">
                  <div>{Logo}</div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">CourseSwap</span>
                    <span className="truncate text-xs">Unipool</span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((page) => (
                <SidebarMenuItem key={page.name}>
                  <SidebarMenuButton asChild>
                    <a href={page.url}>
                      <page.icon />
                      <span>{page.name}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex space-x-2 text-xs">
            <span
              onClick={() => changeLanguage('en')}
              className="cursor-pointer text-sidebar-foreground hover:underline"
            >
              English
            </span>
            <span
              onClick={() => changeLanguage('pl')}
              className="cursor-pointer text-sidebar-foreground hover:underline"
            >
              Polski
            </span>
          </div>
          <ThemeToggle isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
