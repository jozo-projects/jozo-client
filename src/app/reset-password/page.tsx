"use client";

import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import Input from "@/components/ui/input";
import { JozoLoaderWithText } from "@/components/ui/jozo-loader";
import { toast } from "@/hooks/use-toast";
import { resetPassword } from "@/lib/api-utils";
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/schemas/reset-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token =
    searchParams.get("token") || searchParams.get("forgot_password_token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: "Liên kết không hợp lệ",
        description: "Vui lòng sử dụng liên kết đặt lại mật khẩu từ email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await resetPassword({
        forgot_password_token: token,
        password: data.password,
        confirm_password: data.confirm_password,
      });

      if (result.success) {
        toast({
          title: "Đặt lại mật khẩu thành công!",
          description: result.message || "Bạn có thể đăng nhập với mật khẩu mới.",
        });
        router.push("/");
        return;
      }

      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: result.message || "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <FormCard className="max-w-md w-full mx-auto">
        <h2 className="page-title mb-4 text-center">
          Liên kết không hợp lệ
        </h2>
        <p className="body-copy mb-6 text-center">
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu
          cầu gửi lại email đặt lại mật khẩu.
        </p>
        <Button asChild className="w-full">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </FormCard>
    );
  }

  return (
    <FormCard className="max-w-md w-full mx-auto">
      <h1 className="page-title mb-2 text-center">Đặt lại mật khẩu</h1>
      <p className="body-copy mb-6 text-center">
        Nhập mật khẩu mới cho tài khoản của bạn.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Mật khẩu mới"
          type="password"
          required
          {...register("password")}
          error={errors.password?.message}
          showPasswordToggle
          helpText="Ít nhất 6 ký tự"
        />

        <Input
          label="Xác nhận mật khẩu"
          type="password"
          required
          {...register("confirm_password")}
          error={errors.confirm_password?.message}
          showPasswordToggle
        />

        <Button
          type="submit"
          className="w-full animate-buttonheartbeat"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
      </form>
    </FormCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <JozoLoaderWithText
            text="Đang tải trang..."
            size="lg"
            className="text-lg"
          />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
