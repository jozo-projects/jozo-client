"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GlowLine from "./ui/glow-line";
import DesktopMenu from "./desktop-nav";
import MobileMenu from "./mobile-nav";
import UserMenu from "./user-menu";
import type { IMemberProfile } from "@/types/membership";

export default function Nav({
  currentUser,
}: {
  currentUser?: IMemberProfile | null;
}) {
  const authed = Boolean(currentUser);
  const [showHeader, setShowHeader] = useState(true); // Trạng thái hiển thị header
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Tham chiếu timeout để kiểm tra dừng cuộn

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Luôn hiện header khi ở đỉnh
      if (currentScrollY === 0) {
        setShowHeader(true);
      } else {
        setShowHeader(false);
      }

      // Đặt timeout để hiện header sau khi dừng cuộn
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        if (currentScrollY !== 0) {
          setShowHeader(true);
        }
      }, 300); // Hiện header sau 300ms
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <nav
        className={`glass-surface relative mx-auto rounded-b-2xl border-t-0 border-primary/20 text-primary shadow-[0_10px_35px_hsl(var(--primary)/0.12)] transition-all duration-500 ease-in-out ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <GlowLine
            orientation="horizontal"
            position="0"
            color="red"
            className="opacity-85"
          />
          <GlowLine
            orientation="horizontal"
            position="calc(100% - 1px)"
            color="red"
            className="opacity-70"
          />
          <span className="nav-red-beam absolute -top-9 left-[-45%] h-20 w-[46%] rounded-full" />
          <span className="nav-red-reflection absolute -bottom-12 left-[-42%] h-24 w-[42%] rounded-full" />
        </div>
        <div className="relative z-10 mx-auto flex h-20 sm:h-24 max-w-7xl items-center justify-between px-3 sm:px-5 md:px-8">
          <div className="flex-1">
            <Link href="/" className="inline-block">
              {/* Desktop Logo */}
              <Image
                src="/images/jozo-logo.webp"
                alt="JOZO Music Box"
                width={120}
                height={30}
                className="hidden md:block"
              />
              {/* Mobile Logo */}
              <Image
                src="/images/jozo-logo.webp"
                alt="JOZO Music Box"
                width={80}
                height={20}
                className="block md:hidden"
              />
            </Link>
          </div>

          <div className="flex-1 flex justify-center">
            <DesktopMenu authed={authed} />
          </div>

          <div className="flex-1 flex justify-end items-center gap-3">
            <UserMenu currentUser={currentUser} />
            <MobileMenu authed={authed} currentUser={currentUser} />
          </div>
        </div>
      </nav>
    </div>
  );
}
