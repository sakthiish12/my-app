'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const isActive = pathname === href;
    return `block py-2 px-4 rounded ${ 
      isActive 
        ? 'bg-blue-100 text-blue-700 font-medium' 
        : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
    }`;
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 h-screen sticky top-0">
      <nav>
        <ul>
          <li>
            <Link href="/dashboard" className={getLinkClassName('/dashboard')}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/dashboard/linkedin" className={getLinkClassName('/dashboard/linkedin')}>
              LinkedIn Insights
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 