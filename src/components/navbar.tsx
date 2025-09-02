// "use client";
// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { User } from "next-auth";
// import React from "react";
// import { Button } from "./ui/button";
// import { usePathname } from "next/navigation";

// const Navbar = () => {
//   const { data: session } = useSession();
//   const user: User = session?.user;
//   const pathname = usePathname();

//   // Determine button label & link
//   const isDashboard = pathname === "/dashboard";
//   const dashboardBtnLabel = isDashboard ? "Home" : "Dashboard";
//   const dashboardBtnLink = isDashboard ? "/" : "/dashboard";

//   return (
//     <nav className="p-4 md:p-6 shadow-md bg-white">
//       <div className="mx-auto flex container flex-col md:flex-row justify-between items-center">
//         {/* Logo */}
//         <Link href="/" className="text-xl font-bold mb-4 md:mb-0 hover:text-blue-600 transition">
//           Anonymous Message
//         </Link>

//         {/* Right Side Buttons */}
//         <div className="flex items-center gap-3">
//           {session ? (
//             <>
//               {/* Dashboard / Home Button */}
//               <Link href={dashboardBtnLink}>
//                 <Button className="w-full md:w-auto">{dashboardBtnLabel}</Button>
//               </Link>

//               {/* Logout Button */}
//               <Button
//                 onClick={() => signOut()}
//                 className="w-full md:w-auto bg-red-500 hover:bg-red-600"
//               >
//                 Logout
//               </Button>
//             </>
//           ) : (
//             // Login Button
//             <Link href="/sign-in">
//               <Button className="w-full md:w-auto">Login</Button>
//             </Link>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;


"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-md sticky top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#1e293b]">
            Anonymous Message
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            

            {/* If user logged in */}
            {session ? (
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-800">{session.user?.name}</span>
                <Link href="/dashboard">
                  <Button className="bg-[#1e293b] hover:bg-slate-700">Dashboard</Button>
                </Link>
                <Button
                  onClick={() => signOut()}
                  variant="destructive"
                  className="px-4 py-2"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/sign-in">
                <Button className="bg-slate-800 hover:bg-slate-700">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md border-t border-gray-200">
          <div className="flex flex-col px-6 py-4 gap-4">
            

            {/* If logged in → Dashboard + Logout */}
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-slate-800 font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    signOut();
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-slate-800 hover:bg-slate-700">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
