import { cn } from "@/lib/utils";

interface LoadingStateProps {
  text?: string;
  className?: string;
}

export function LoadingState({ text = "Loading...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 gap-4",
        className
      )}
    >
      <div className="w-10 h-10 border-4 border-muted border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
