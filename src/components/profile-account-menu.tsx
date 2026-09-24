"use client";

import Link from "next/link";
import { Home, KeyRound, LogOut } from "lucide-react";
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
  return (
    <section className="glass-surface overflow-hidden rounded-2xl">
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="text-base font-semibold text-foreground">Tài khoản</h2>
        <p className="mt-0.5 text-sm text-foreground/70">
          Thông tin dùng khi đặt box và nhận ưu đãi
        </p>
      </div>

      {!isAuthed ? (
        <div className="space-y-3 px-4 py-4">
          <p className="text-sm leading-relaxed text-foreground/80">
            Đăng nhập để xem hạng, điểm và hồ sơ thành viên.
          </p>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground"
          >
            Đăng nhập
          </Link>
        </div>
      ) : (
        <>
          <dl>
            {profileRows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3.5 last:border-b-0"
              >
                <dt className="shrink-0 text-sm text-foreground/65">
                  {row.label}
                </dt>
                <dd className="min-w-0 text-right text-sm font-semibold text-foreground break-words">
                  {row.value || "—"}
                </dd>
              </div>
            ))}
          </dl>

          <div className="space-y-2 border-t border-white/10 p-4">
            <Link
              href="/profile/change-password"
              className="glass-control flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-foreground"
            >
              <KeyRound className="h-4 w-4" />
              Đổi mật khẩu
            </Link>
            <Link
              href="/"
              className="glass-control flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-foreground"
            >
              <Home className="h-4 w-4" />
              Về trang chủ
            </Link>
            <LogoutButton className="h-12 w-full rounded-xl font-semibold shadow-none">
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </LogoutButton>
          </div>
        </>
      )}
    </section>
  );
}
