import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import "../globals.css";
import Navbar from "@/components/navbar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Navbar />

      <main className="bg-gray-50 text-gray-900 min-h-screen">
        {children}
      </main>
      <Toaster />
    </AuthProvider>
  );
}

