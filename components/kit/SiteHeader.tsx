"use client";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/kit/Nav";

const HEADER_ROUTE_PREFIXES = ["/analyze", "/report", "/reserve", "/admin"];

export function SiteHeader() {
  const pathname = usePathname();
  const showHeader = HEADER_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!showHeader) return null;
  return <Nav />;
}
