import { LoadingState } from "@/components/loading-state";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingState text="Memuat halaman..." />
    </div>
  );
}
