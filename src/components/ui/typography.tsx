import React from "react";
import clsx from "clsx";

type TypographyProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "a";
  children: React.ReactNode;
  className?: string;
  href?: string; // Dành riêng cho link
  variant?: "default" | "bold" | "semibold" | "italic"; // Kiểu chữ (tùy chọn)
};

const Typography: React.FC<TypographyProps> = ({
  as = "p",
  children,
  className = "text-foreground",
  href,
  variant = "default",
}) => {
  const Component = as;

  // Áp dụng class CSS theo từng thẻ và responsive
  const baseClass = clsx(
    {
      h1: "text-2xl font-bold leading-tight tracking-tight sm:text-3xl",
      h2: "text-xl font-semibold leading-snug tracking-tight sm:text-2xl",
      h3: "text-base font-semibold sm:text-lg",
      h4: "text-sm font-semibold sm:text-base",
      h5: "text-sm font-medium",
      h6: "text-xs font-medium",
      p: "text-sm leading-relaxed sm:text-base",
      span: "text-xs sm:text-sm",
      a: "text-primary hover:underline",
    }[as],
    // Màu chủ đạo
    variant === "bold" && "font-bold",
    variant === "semibold" && "font-semibold",
    variant === "italic" && "italic",
    className, // Cho phép custom thêm class bên ngoài
  );

  // Xử lý đặc biệt cho thẻ <a>
  if (as === "a" && href) {
    return (
      <a href={href} className={baseClass}>
        {children}
      </a>
    );
  }

  return <Component className={baseClass}>{children}</Component>;
};

export default Typography;
