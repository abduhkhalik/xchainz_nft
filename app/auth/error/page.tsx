// app/auth/error/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let message = "Terjadi kesalahan saat login.";
  if (error === "NOT_HOLDER") {
    message = "Anda bukan holder NFT koleksi ini, sehingga tidak dapat login.";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">🚫 Login Gagal</h1>
      <p className="mb-6 text-lg">{message}</p>
      <Link
        href="/"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full"
      >
        Kembali ke Home
      </Link>
    </div>
  );
}
