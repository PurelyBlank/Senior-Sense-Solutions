"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);

    const authPages = ["/", "/register"];
    if (!token && !authPages.includes(pathname)) {
      router.push("/");
    }
  }, [pathname]);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}