"use client";

import { useState } from "react";
import Image from "next/image";
import { UserProfile } from "../types/user";
import { getUserByAccessCode } from "../lib/users";

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit to 4 chars
    const val = e.target.value.toUpperCase().slice(0, 4);
    setCode(val);
    setError(false);

    // Auto-check on length 4
    if (val.length === 4) {
      const user = getUserByAccessCode(val);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-6 font-sans">
      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Top Logo Area */}
        <div className="mb-4">
          <Image
            src="/img/fumble_logo.jpg"
            alt="Fumble"
            width={200}  // adjust width to fit your design
            height={80}  // adjust height to match aspect ratio
            priority
          />
        </div>


        {/* Bumble Style Text - Black & White adaptation */}
        <div className="relative mb-8">
          {/* Shadow layer (Gray/Silver to simulate depth in B&W) */}
          <h1
            className="text-5xl font-black text-center text-zinc-300 absolute top-1 left-1 w-full select-none"
            style={{ textShadow: "none" }}
          >
            DATE THE<br />WORST PEOPLE
          </h1>
          {/* Main Text */}
          <h1 className="text-5xl font-black text-center relative z-10">
            DATE THE<br />WORST PEOPLE
          </h1>
        </div>

        {/* Code Input */}
        <div className="w-full flex flex-col items-center gap-2 mt-4">
          <p className="font-bold text-sm uppercase tracking-wide">Enter Access Code</p>
          <input
            type="text"
            value={code}
            onChange={handleChange}
            className={`w-48 h-16 text-center text-3xl font-black border-4 rounded-xl outline-none transition-colors tracking-[0.5em] uppercase placeholder-zinc-300 ${error ? 'border-red-500 text-red-500' : 'border-black text-black'}`}
            placeholder="____"
          />
          {error && <p className="text-red-500 font-bold text-xs mt-2 animate-pulse">INCORRECT CODE</p>}
        </div>
      </div>
    </div>
  );
}
