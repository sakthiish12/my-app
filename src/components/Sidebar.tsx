"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuLayoutDashboard, LuLinkedin, LuInstagram, LuCreditCard } from 'react-icons/lu';
import { FaTiktok } from 'react-icons/fa';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LuLayoutDashboard },
  { name: 'Pricing', href: '/pricing', icon: LuCreditCard },
  { name: 'LinkedIn', href: '/dashboard/linkedin', icon: LuLinkedin },
  { name: 'Instagram', href: '/dashboard/instagram', icon: LuInstagram },
  { name: 'TikTok', href: '/dashboard/tiktok', icon: FaTiktok },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 bg-white border-r shadow-sm">
      <div className="p-4">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          SocioPrice
        </Link>
      </div>
      <nav className="mt-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors 
                    ${isActive 
                      ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
} 