"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User } from "next-auth";
import React from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user;
  const pathname = usePathname();

  // Determine button label & link
  const isDashboard = pathname === "/dashboard";
  const dashboardBtnLabel = isDashboard ? "Home" : "Dashboard";
  const dashboardBtnLink = isDashboard ? "/" : "/dashboard";

  return (
    <nav className="p-4 md:p-6 shadow-md bg-white">
      <div className="mx-auto flex container flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold mb-4 md:mb-0 hover:text-blue-600 transition">
          Anonymous Message
        </Link>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              {/* Dashboard / Home Button */}
              <Link href={dashboardBtnLink}>
                <Button className="w-full md:w-auto">{dashboardBtnLabel}</Button>
              </Link>

              {/* Logout Button */}
              <Button
                onClick={() => signOut()}
                className="w-full md:w-auto bg-red-500 hover:bg-red-600"
              >
                Logout
              </Button>
            </>
          ) : (
            // Login Button
            <Link href="/sign-in">
              <Button className="w-full md:w-auto">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
