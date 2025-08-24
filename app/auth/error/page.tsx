import Link from "next/link";

// app/auth/error/page.tsx
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  let message = "Login gagal, silakan coba lagi.";
  if (error === "NOT_HOLDER") {
    message = "❌ Anda bukan holder koleksi NFT, akses ditolak.";
  } else if (error === "CredentialsSignin") {
    message = "❌ Kredensial tidak valid.";
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="p-6 bg-white shadow rounded text-center">
        <h1 className="text-xl font-bold mb-2">Login Error</h1>
        <p>{message}</p>
        <Link
          href={"/"}
          className="text-3xl text-white px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700"
        >
          BACK
        </Link>
      </div>
    </div>
  );
}
