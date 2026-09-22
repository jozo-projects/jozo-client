import { cn } from "@/lib/utils";

export const formCardClassName =
  "glass-surface rounded-2xl p-5 sm:p-6";

type FormCardProps = React.ComponentProps<"div">;

export function FormCard({ className, children, ...props }: FormCardProps) {
  return (
    <div className={cn(formCardClassName, className)} {...props}>
      {children}
    </div>
  );
}
