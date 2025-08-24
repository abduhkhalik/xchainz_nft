import Link from "next/link";

// app/auth/error/page.tsx
export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const error = params?.error as string | undefined;

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
        <p className="mb-4">{message}</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white"
        >
          BACK HOME
        </Link>
      </div>
    </div>
  );
}
