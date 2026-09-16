"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MenuItems from "./menu-items";
import Link from "next/link";
import type { IMemberProfile } from "@/types/membership";
import { getDisplayName } from "@/lib/auth-helpers";

export default function MobileMenu({
  authed,
  currentUser,
}: {
  authed?: boolean;
  currentUser?: IMemberProfile | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const displayName = getDisplayName(currentUser) || "Thành viên";

  return (
    <div className="flex sm:hidden">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`glass-control group relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-primary transition-all duration-300 ${
          menuOpen ? "border-primary/50 bg-primary/10" : "hover:bg-primary/5"
        }`}
        aria-label="Toggle Menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-drawer-menu"
      >
        {menuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6 transition-transform duration-300 group-hover:scale-105"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6 transition-transform duration-300 group-hover:scale-105"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </button>
      {mounted &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close Menu Overlay"
              onClick={() => setMenuOpen(false)}
              className={`fixed inset-0 z-[10000] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ${
                menuOpen
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />
            <div
              id="mobile-drawer-menu"
              className={`glass-overlay fixed inset-y-0 right-0 z-[10001] w-[min(86vw,22rem)] text-primary shadow-[0_24px_60px_hsl(var(--foreground)/0.2)] transform ${
                menuOpen ? "translate-x-0" : "translate-x-full"
              } transition-transform duration-300 ease-out`}
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-primary/10 px-5 pb-4 pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <Image
                      src="/images/jozo-logo.webp"
                      alt="JOZO Music Box"
                      width={120}
                      height={30}
                      className="h-auto w-[120px]"
                    />
                    <button
                      type="button"
                      onClick={() => setMenuOpen(false)}
                      aria-label="Close Menu"
                      className="glass-control inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary/80 transition hover:text-primary"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.7"
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                  {authed && currentUser && (
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="glass-control mb-4 flex items-center gap-3 rounded-2xl px-4 py-3 transition"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {(displayName[0] || "U").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {displayName}
                        </div>
                        <div className="text-xs text-primary/70">
                          Xem hồ sơ & điểm thưởng
                        </div>
                      </div>
                    </Link>
                  )}
                  <MenuItems
                    mobile
                    authed={authed}
                    onClick={() => setMenuOpen(false)}
                  />
                </div>

                <div className="border-t border-primary/10 px-5 py-4">
                  <p className="text-xs text-primary/60">
                    Chọn một mục để điều hướng nhanh.
                  </p>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
