import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-accent text-accent-foreground hover:opacity-90 active:scale-[0.97]",
    secondary: "bg-input text-foreground hover:bg-input/80 active:scale-[0.97]",
    ghost:
      "text-foreground hover:bg-input active:scale-[0.97] hover:text-foreground",
    destructive:
      "bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.97]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm font-medium h-8",
    md: "px-4 py-2 text-sm font-medium h-10",
    lg: "px-6 py-2.5 text-base font-medium h-12",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
