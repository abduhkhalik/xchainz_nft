"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const HolderSection = ({ character = "/images/character.png" }) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleLogin = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/auth/login");
      const { qr, websocket, uuid } = res.data;

      setQrUrl(qr);
      setWsUrl(websocket);
      setUuid(uuid);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Gagal membuat QR login:", err);
      toast.error("Gagal membuat QR login");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!wsUrl || !uuid) return;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = async (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data?.signed === true) {
          ws.close();
          setShowModal(false);

          // ✅ Verifikasi signature ke backend
          const result = await axios.post("/api/auth/login", { uuid });
          const signedBy = result.data.account;

          const authRes = await signIn("credentials", {
            signedBy,
            redirect: false, // ⬅️ jangan redirect ke /error
          });

          if (authRes?.ok) {
            toast.success("Welcome My Holder 🚀");
            router.refresh();
          } else {
            console.error("❌ Gagal login ke NextAuth:", authRes?.error);
            if (authRes?.error === "NOT_HOLDER") {
              toast.error("Anda bukan holder NFT koleksi ini, akses ditolak.");
            } else {
              toast.error("Login gagal: " + (authRes?.error ?? "Unknown error"));
            }
          }
        }

        if (data?.signed === false) {
          console.log("🚫 User menolak permintaan login");
          ws.close();
          setShowModal(false);
          toast.warning("Login dibatalkan.");
        }
      } catch (err) {
        console.error("❌ WebSocket Error:", err);
        ws.close();
        toast.error("Terjadi kesalahan koneksi login");
      }
    };

    ws.onerror = (err) => {
      console.error("❌ WS error:", err);
      ws.close();
      toast.error("WebSocket error, coba lagi");
    };

    return () => ws.close();
  }, [wsUrl, uuid, router]);

  return (
    <div
      id="account"
      className="w-full h-[597px] overflow-hidden px-16"
      style={{
        backgroundImage: 'url("/bg/bgWave.svg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Konten Utama */}
      <div className="w-full max-w-full grid grid-cols-2 text-[#E7E7E7]">
        <div className="-mt-5 flex justify-center items-center">
          <Image
            src={character}
            alt="Xcainz Character"
            height={800}
            width={800}
            quality={100}
            className="w-[440px] h-auto"
            priority
          />
        </div>
        <div className="mt-40 max-w-full w-full text-center mx-auto">
          <h1 className="text-9xl font-darker uppercase font-extrabold mb-5">
            Wellcome
          </h1>
          <p className="text-center mx-auto contain-size font-thin font-jakarta w-[500px]">
            Leverages cutting-edge infrared technology and AI-assisted pattern
            recognition to take a 3D image of your foot and pressure
            distribution in less than 2 minutes no molds required!
          </p>

          {isAuthenticated ? (
            <div className="text-center space-y-2 mt-26">
              <div className="bg-white text-black px-6 py-3 rounded-full shadow-lg font-bold">
                Logged in as:{" "}
                <div className="text-xs mt-1 break-words max-w-[200px] mx-auto">
                  {session?.user?.id}
                </div>
              </div>
              <Button
                onClick={() => signOut({ redirect: false })}
                disabled={isLoading}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant={"outline"}
              className="uppercase text-3xl bg-transparent mt-26 p-6 font-jakarta font-medium h-[80px]"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Loading...
                </div>
              ) : (
                "account"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* QR Modal Overlay */}
      {showModal && qrUrl && (
        <div className="fixed inset-0 z-[99] bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center w-[300px]">
            <h2 className="text-lg font-semibold mb-4 text-black">
              Scan to Login
            </h2>
            <div className="flex justify-center items-center">
              <Image
                src={qrUrl}
                alt="Login QR"
                width={200}
                height={200}
                quality={100}
              />
            </div>
            <p className="text-sm mt-4 text-gray-600">
              Use your Xaman app to scan
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HolderSection;
