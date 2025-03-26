import { UserButton } from '@clerk/nextjs';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-end items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
} 