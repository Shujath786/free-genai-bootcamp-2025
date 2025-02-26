import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '../lib/utils';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface LayoutProps {
  children?: React.ReactNode;
  navigation: NavigationItem[];
}

export function Layout({ navigation }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Amiri, serif' }}>
                تَعَلَّم
              </h1>
            </div>
            <nav className="flex-1 px-4 space-y-1 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    location.pathname === item.href
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={cn(
                      location.pathname === item.href
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-72 flex flex-col flex-1">
          <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}