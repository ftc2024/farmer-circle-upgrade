import { cn } from "@/lib/utils/cn";

export function StatusMessage({
  children,
  tone = "info",
}: {
  children?: React.ReactNode;
  tone?: "info" | "error" | "success";
}) {
  if (!children) return null;
  return (
    <p
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error" && "border-red-400/30 bg-red-500/10 text-red-200",
        tone === "success" && "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
        tone === "info" && "border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </p>
  );
}
