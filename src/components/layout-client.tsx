"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/common/nav-bar";
import { SideMenu } from "@/components/common/side-menu";
import { SearchModal } from "@/components/common/search-modal";
import { IntroLogo } from "@/components/intro-logo";
import { Toaster } from "@/components/ui/toaster";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [introLoaded, setIntroLoaded] = useState(false);
  const [introShown, setIntroShown] = useState<boolean | null>(null);

  useEffect(() => {
    const shown = localStorage.getItem("introShown") === "true";
    setIntroShown(shown);
    if (shown) {
      setIntroLoaded(true);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem("introShown", "true");
    setIntroLoaded(true);
  };

  if (introShown === null) return null;

  return (
    <>
      {!introShown && <IntroLogo onComplete={handleIntroComplete} />}
      {introLoaded && <Navbar />}
      <SideMenu />
      <SearchModal />
      <main>{children}</main>
      <Toaster />
    </>
  );
}
