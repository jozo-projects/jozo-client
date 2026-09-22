import Link from "next/link";

import ChangePasswordForm from "@/components/change-password-form";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import { getCurrentUser } from "@/lib/auth-server";
import { getDisplayName } from "@/lib/auth-helpers";

export default async function ChangePasswordPage() {
  const member = await getCurrentUser();
  const isAuthed = Boolean(member);
  const displayName = getDisplayName(member) || "bạn";

  return (
    <div className="max-w-3xl mx-auto w-full space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Đổi mật khẩu</h1>
          <p className="page-lede">
            {isAuthed
              ? `Xin chào ${displayName}, hãy cập nhật mật khẩu mới của bạn.`
              : "Bạn cần đăng nhập để đổi mật khẩu."}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/profile">Quay lại hồ sơ</Link>
        </Button>
      </div>

      {!isAuthed ? (
        <FormCard className="space-y-3">
          <p className="body-copy">
            Bạn chưa đăng nhập. Vui lòng{" "}
            <Link href="/login" className="text-link">
              đăng nhập
            </Link>{" "}
            để tiếp tục.
          </p>
        </FormCard>
      ) : (
        <FormCard className="space-y-4">
          <div className="space-y-1">
            <h2 className="card-title">Cập nhật mật khẩu</h2>
            <p className="body-copy">
              Nhập mật khẩu hiện tại và thiết lập mật khẩu mới.
            </p>
          </div>
          <ChangePasswordForm />
        </FormCard>
      )}
    </div>
  );
}


