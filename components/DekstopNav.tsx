// components/DekstopNav.jsx
import React from "react";
import Link from "next/link"; // Menggunakan Link dari Next.js untuk navigasi yang efisien

export const DekstopNav = () => {
  return (
    <nav className="hidden md:flex w-full justify-center py-4 px-8 bg-transparent absolute top-0 left-0 z-50">
      {/* Container utama untuk item navigasi */}
      <div className="flex items-center space-x-12 text-white text-lg font-semibold">
        {/* Item "Browse" */}
        <div className="relative group">
          <Link
            href="#"
            className="hover:text-gray-300 transition-colors duration-200"
          >
            Browse
          </Link>
          {/* Anda bisa menambahkan dropdown di sini jika diperlukan */}
          {/* <div className="absolute hidden group-hover:block bg-gray-800 text-sm mt-2 rounded shadow-lg">
            <Link href="#" className="block px-4 py-2 hover:bg-gray-700">Category 1</Link>
            <Link href="#" className="block px-4 py-2 hover:bg-gray-700">Category 2</Link>
          </div> */}
        </div>

        {/* Item "Enter a code/link" (Bisa berupa input field atau link) */}
        {/* Saya akan buat ini sebagai input field atau bisa juga link yang memicu modal */}
        <div className="relative">
          <input
            type="text"
            placeholder="Enter a code/link"
            className="bg-transparent border-b-2 border-white text-white placeholder-gray-400 focus:outline-none focus:border-green-500 py-1 px-2 text-center"
            // Anda bisa menambahkan state untuk input ini jika diperlukan
          />
        </div>

        {/* Item "Confab" */}
        <div>
          <Link
            href="#"
            className="hover:text-gray-300 transition-colors duration-200"
          >
            Confab
          </Link>
        </div>
      </div>
    </nav>
  );
};
