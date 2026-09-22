"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { IMemberProfile } from "@/types/membership";
import { getDisplayName, pickAvatarUrl } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

type MenuLink = {
  href: string;
  label: string;
  description?: string;
};

const memberLinks: MenuLink[] = [
  {
    href: "/profile",
    label: "Hồ sơ & điểm thưởng",
    description: "Xem hạng thành viên, điểm và streak",
  },
  {
    href: "/profile/change-password",
    label: "Đổi mật khẩu",
    description: "Cập nhật mật khẩu đăng nhập",
  },
  {
    href: "/booking-search",
    label: "Tra cứu đặt box",
    description: "Xem lịch sử đặt phòng của bạn",
  },
];

export default function UserMenu({
  currentUser,
}: {
  currentUser?: IMemberProfile | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName = useMemo(
    () => getDisplayName(currentUser) || "Thành viên",
    [currentUser],
  );

  const avatarUrl = useMemo(() => pickAvatarUrl(currentUser), [currentUser]);
  const isAuthed = Boolean(currentUser);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setOpen(false);
      router.replace("/");
      setTimeout(() => router.refresh(), 0);
    }
  };

  if (!isAuthed) return null;

  return (
    <div ref={containerRef} className="relative z-20 hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "glass-control flex max-w-[180px] items-center gap-2 rounded-full",
          "px-2.5 py-1.5 text-sm text-primary",
          "transition hover:border-primary/40 hover:bg-primary/5",
          open && "border-primary/45 bg-primary/10",
        )}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {getInitials(displayName)}
          </div>
        )}
        <span className="truncate font-medium">{displayName}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cn(
            "h-4 w-4 shrink-0 text-primary/70 transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
          "glass-overlay absolute right-0 z-[10002] mt-2 w-72 overflow-hidden rounded-2xl",
          "text-primary shadow-[0_20px_50px_hsl(var(--foreground)/0.18)]",
          )}
        >
          <div className="border-b border-primary/10 bg-primary/5 px-4 py-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground ring-2 ring-primary/20">
                  {getInitials(displayName)}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-semibold">{displayName}</div>
                <div className="truncate text-xs text-primary/70">
                  {currentUser?.email ||
                    currentUser?.phone ||
                    currentUser?.phone_number ||
                    "Thành viên JOZO"}
                </div>
              </div>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="mt-3 block w-full rounded-xl bg-primary px-3 py-2 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Xem hồ sơ & điểm
            </Link>
          </div>

          <div className="py-1">
            {memberLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-3 transition hover:bg-primary/5"
              >
                <div className="text-sm font-medium">{item.label}</div>
                {item.description && (
                  <div className="text-xs text-primary/65">{item.description}</div>
                )}
              </Link>
            ))}
          </div>

          <div className="border-t border-primary/10 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 transition hover:bg-white/5"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
