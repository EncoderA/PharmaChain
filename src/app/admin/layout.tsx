import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import WalletButton from "@/components/common/WalletButton";
import { AnimatedThemeToggler } from "@/components/ui/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex justify-end items-center gap-2 p-4 border-b bg-background">
            <AnimatedThemeToggler />
            <WalletButton />
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
