"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  KeyRound,
  LogOut,
  UserCircle,
  X,
} from "lucide-react";
import LogoutButton from "@/components/logout-button";

type ProfileRow = {
  label: string;
  value: string;
};

type ProfileAccountMenuProps = {
  isAuthed: boolean;
  profileRows: ProfileRow[];
};

export function ProfileAccountMenu({
  isAuthed,
  profileRows,
}: ProfileAccountMenuProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    if (detailsOpen) {
      setSheetVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setSheetVisible(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [detailsOpen]);

  const menuItems = isAuthed
    ? [
        {
          id: "details",
          label: "Thông tin chi tiết",
          description: "Xem hồ sơ cá nhân",
          icon: UserCircle,
          iconBg: "bg-primary/15 text-primary",
          onClick: () => setDetailsOpen(true),
        },
        {
          id: "password",
          label: "Đổi mật khẩu",
          description: "Cập nhật mật khẩu đăng nhập",
          icon: KeyRound,
          iconBg: "bg-primary/15 text-primary",
          href: "/profile/change-password",
        },
        {
          id: "home",
          label: "Về trang chủ",
          description: "Quay lại trang đặt phòng",
          icon: Home,
          iconBg: "bg-primary/15 text-primary",
          href: "/",
        },
      ]
    : [
        {
          id: "home",
          label: "Về trang chủ",
          description: "Quay lại trang đặt phòng",
          icon: Home,
          iconBg: "bg-primary/15 text-primary",
          href: "/",
        },
      ];

  return (
    <>
      <div className="glass-surface overflow-hidden rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-base font-semibold text-foreground">
            Tài khoản
          </h2>
          <p className="text-xs text-foreground/70 mt-0.5">
            Quản lý thông tin và cài đặt cá nhân
          </p>
        </div>

        {!isAuthed && (
          <div className="px-5 py-4 text-sm text-foreground/80">
            Chưa đăng nhập.{" "}
            <Link href="/login" className="text-link">
              Đăng nhập
            </Link>{" "}
            để xem thông tin chi tiết.
          </div>
        )}

        <ul className="divide-y divide-white/10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {item.label}
                  </p>
                  <p className="text-xs text-foreground/65 truncate">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/40" />
              </>
            );

            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="flex w-full items-center gap-3 px-5 py-3.5 hover:bg-white/5 transition-colors"
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {isAuthed && (
          <div className="border-t border-white/10 p-4">
            <LogoutButton className="glass-control h-11 w-full rounded-xl font-semibold text-red-300 shadow-none hover:text-red-200">
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </LogoutButton>
          </div>
        )}
      </div>

      {sheetVisible && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center sm:p-4">
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
              detailsOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setDetailsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-details-title"
            className={`glass-overlay relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl transform transition-transform duration-300 max-h-[85vh] flex flex-col ${
              detailsOpen
                ? "translate-y-0 sm:scale-100"
                : "translate-y-full sm:translate-y-0 sm:scale-95"
            }`}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-white/25" />
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <h3
                  id="profile-details-title"
                  className="text-lg font-semibold text-foreground"
                >
                  Thông tin chi tiết
                </h3>
                <p className="text-xs text-foreground/65 mt-0.5">
                  Hồ sơ cá nhân của bạn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsOpen(false)}
                className="glass-control flex h-8 w-8 items-center justify-center rounded-full text-foreground"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-3">
              {profileRows.map((row) => (
                <div
                  key={row.label}
                  className="glass-control rounded-xl px-4 py-3"
                >
                  <p className="text-xs font-medium text-foreground/65 mb-1">
                    {row.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground break-all">
                    {row.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
