import { cn } from "@/lib/utils";

export const formCardClassName =
  "glass-surface rounded-lg p-4 sm:p-6";

type FormCardProps = React.ComponentProps<"div">;

export function FormCard({ className, children, ...props }: FormCardProps) {
  return (
    <div className={cn(formCardClassName, className)} {...props}>
      {children}
    </div>
  );
}
