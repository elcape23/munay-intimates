"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/common/nav-bar";
import { SideMenu } from "@/components/common/side-menu";
import { SearchModal } from "@/components/common/search-modal";
import { IntroLogo } from "@/components/intro-logo";
import { Toaster } from "@/components/ui/toaster";
import { useIntroStore } from "@/store/intro-store";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [introLoaded, setIntroLoaded] = useState(false);
  const [introShown, setIntroShown] = useState<boolean | null>(null);
  const setIntroDone = useIntroStore((state) => state.setDone);

  useEffect(() => {
    const shown =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("introShown") === "true";
    setIntroShown(shown);
    if (shown) {
      setIntroLoaded(true);
      setIntroDone(true);
    }
  }, [setIntroDone]);

  const handleIntroComplete = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("introShown", "true");
    }
    setIntroLoaded(true);
    setIntroDone(true);
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
