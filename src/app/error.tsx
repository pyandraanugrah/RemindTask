"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Terjadi kesalahan"
        description="Halaman tidak dapat dimuat saat ini. Silakan coba lagi."
        action={
          <Button variant="primary" onClick={() => reset()}>
            Coba lagi
          </Button>
        }
      />
    </div>
  );
}
