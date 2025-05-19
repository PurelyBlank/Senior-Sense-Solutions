"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const publicRoutes = ["/", "/register"];

    if (!token && !publicRoutes.includes(pathname)) {
      router.replace("/");
    } else {
      setChecked(true);
    }
  }, [pathname, router]);

  if (!checked) {
    return <p>Loading...</p>;
  }

  // return the children / pages if sucessfull 
  return <>{children}</>;
}
