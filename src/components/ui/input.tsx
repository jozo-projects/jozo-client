"use client";

import React, { forwardRef, useState } from "react";
import { EyeOpenIcon, EyeNoneIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "prefix" | "suffix"
  > {
  /**
   * Nhãn hiển thị cho trường nhập liệu.
   */
  label?: string;
  /**
   * Số ký tự tối đa. Với kiểu number, giá trị này sẽ được enforced qua logic.
   */
  maxLength?: number;
  /**
   * Lỗi hiển thị khi có lỗi.
   */
  error?: string;
  helpText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showPasswordToggle?: boolean;
  required?: boolean;
}

/**
 * Component Input dùng chung, hỗ trợ cả kiểu text và number.
 * - Nếu type là "number", sẽ tự động enforces giới hạn số ký tự (maxLength) trong hàm onChange.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    required,
    helpText,
    type = "text",
    maxLength,
    onChange,
    className,
    error,
    prefix,
    suffix,
    showPasswordToggle,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "number") {
      const value = e.target.value;
      if (!/^\d*$/.test(value) || (maxLength && value.length > maxLength)) {
        return;
      }
    }
    onChange?.(e);
  };

  const computedType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      const value = e.key;
      if (!/^\d*$/.test(value) || (maxLength && value.length > maxLength)) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="mb-4">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/55">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          type={computedType}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          maxLength={maxLength}
          inputMode={type === "number" ? "numeric" : props.inputMode}
          aria-invalid={Boolean(error)}
          className={cn(
            "glass-control w-full rounded-xl px-3 py-2.5 text-sm text-foreground outline-none",
            error && [
              "border-red-500",
              "animate-shake-vertical",
              "focus:ring-red-500",
            ],
            prefix && "pl-10",
            (suffix || showPasswordToggle) && "pr-10",
            className
          )}
          {...props}
        />
        {(suffix || showPasswordToggle) && (
          <div className="absolute right-3 top-1/2 -translate-y-[35%] text-primary/55">
            {showPasswordToggle ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-primary focus:outline-none"
              >
                {showPassword ? (
                  <EyeOpenIcon className="h-4 w-4" />
                ) : (
                  <EyeNoneIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              suffix
            )}
          </div>
        )}
      </div>
      {helpText && !error && (
        <p className="meta-copy mt-1.5">{helpText}</p>
      )}
      {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
  );
});

export default Input;
