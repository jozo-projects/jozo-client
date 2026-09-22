"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import Input from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  ChangePasswordFormData,
  changePasswordSchema,
} from "@/schemas/change-password.schema";

export default function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values: ChangePasswordFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch (err) {
        console.error("Không parse được response change-password", err);
      }

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Đổi mật khẩu thất bại");
      }

      toast({
        title: "Đổi mật khẩu thành công",
        description: data?.message || "Mật khẩu của bạn đã được cập nhật.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Mật khẩu hiện tại"
        type="password"
        required
        showPasswordToggle
        placeholder="Nhập mật khẩu hiện tại"
        {...register("old_password")}
        error={errors.old_password?.message}
      />

      <Input
        label="Mật khẩu mới"
        type="password"
        required
        showPasswordToggle
        placeholder="Nhập mật khẩu mới (6 ký tự)"
        maxLength={6}
        {...register("password")}
        error={errors.password?.message}
        helpText="Mật khẩu mới phải đúng 6 ký tự"
      />

      <Input
        label="Xác nhận mật khẩu mới"
        type="password"
        required
        showPasswordToggle
        placeholder="Nhập lại mật khẩu mới (6 ký tự)"
        maxLength={6}
        {...register("confirm_password")}
        error={errors.confirm_password?.message}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={submitting}
      >
        {submitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}


