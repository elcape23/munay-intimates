"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function EditEmailPage() {
  const router = useRouter();
  const { data: rawSession } = useSession();
  const session = rawSession as any;
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  useEffect(() => {
    if (session) {
      setEmail(session.user?.email || "");
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Guardar email", email);
  };

  return (
    <div className="container mx-auto px-6 pt-[55px] space-y-6">
      <div className="flex flex-row items-center justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium ml-2 uppercase">Email</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailTouched(true)}
        />
        {emailTouched && (
          <p
            className={`text-sm ${
              isEmailValid
                ? "text-text-success-default"
                : "text-text-danger-default"
            }`}
          >
            {isEmailValid ? "Correcto" : "Incorrecto"}
          </p>
        )}
        <Button type="submit" className="w-full">
          Guardar
        </Button>
      </form>
    </div>
  );
}
