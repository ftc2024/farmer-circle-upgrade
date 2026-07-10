import { ResetPasswordForm } from "@/features/auth/reset-password-form";
export default function ResetPasswordPage() {
  return <main className="grid min-h-screen place-items-center bg-fc-bg p-5 text-fc-text"><section className="w-full max-w-md rounded-3xl border border-white/10 bg-fc-panel/80 p-7"><p className="eyebrow">Account Recovery</p><h1 className="mt-3 mb-6 text-3xl font-black">Ubah Password</h1><ResetPasswordForm /></section></main>;
}
