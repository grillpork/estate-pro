"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  const shouldHide =
    pathname === "/properties/create" ||
    pathname === "/conversations" ||
    pathname.startsWith("/conversations/");

  if (shouldHide) return null;

  return <Footer />;
}
