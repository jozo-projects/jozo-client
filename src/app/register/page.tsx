"use client";

import { Button } from "@/components/ui/button";
import { DateSelect } from "@/components/ui/date-select";
import { FormCard } from "@/components/ui/form-card";
import Input from "@/components/ui/input";
import { RegisterFormData, registerSchema } from "@/schemas/register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export default function RegisterForm() {
  const [isClient, setIsClient] = useState(false);
  const [defaultBirthDate, setDefaultBirthDate] = useState<Date | null>(null);

  useEffect(() => {
    setIsClient(true);
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    setDefaultBirthDate(date);
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: {
      date_of_birth: defaultBirthDate || new Date(2006, 0, 1), // Fallback date for SSR
    },
  });

  const router = useRouter();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "user",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(result.message || "Đăng ký thất bại");
        }
        throw new Error(result.message || "Đăng ký thất bại");
      }

      // Đăng ký thành công — chuyển sang trang đăng nhập
      toast({
        title: "Đăng ký thành công!",
        description: "Vui lòng đăng nhập để tiếp tục.",
      });
      router.push("/login");
    } catch (error: any) {
      toast({
        title: "Đăng ký thất bại!",
        description: error.message,
      });
    }
  };

  return (
    <FormCard className="mx-auto w-full max-w-md">
      <h1 className="page-title mb-6 text-center">Đăng ký thành viên</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Họ và tên"
          required
          {...register("full_name")}
          error={errors.full_name?.message}
        />

        <Input
          label="Số điện thoại"
          type="number"
          required
          {...register("phone_number")}
          error={errors.phone_number?.message}
          maxLength={10}
        />

        <Input
          label="Email"
          type="email"
          placeholder="user@email.com"
          required
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Mật khẩu"
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
          {...register("confirm_password")}
          error={errors.confirm_password?.message}
          showPasswordToggle
        />

        <div className="mb-4">
          <Controller
            control={control}
            name="date_of_birth"
            render={({ field }) =>
              isClient ? (
                <DateSelect
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.date_of_birth?.message}
                />
              ) : (
                <div className="glass-control w-full rounded-xl px-3 py-2.5 text-sm text-foreground/50">
                  Đang tải...
                </div>
              )
            }
          />
        </div>

        <Button
          type="submit"
          className="w-full animate-buttonheartbeat"
          onClick={handleSubmit(onSubmit)}
        >
          Đăng ký
        </Button>
      </form>
    </FormCard>
  );
}
