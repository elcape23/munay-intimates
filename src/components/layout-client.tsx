"use client";

import { useState } from "react";
import { Navbar } from "@/components/common/nav-bar";
import { SideMenu } from "@/components/common/side-menu";
import { SearchModal } from "@/components/common/search-modal";
import { IntroLogo } from "@/components/intro-logo";
import { Toaster } from "@/components/ui/toaster";

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [introLoaded, setIntroLoaded] = useState(false);

  return (
    <>
      <IntroLogo onComplete={() => setIntroLoaded(true)} />
      {introLoaded && <Navbar />}
      <SideMenu />
      <SearchModal />
      <main>{children}</main>
      <Toaster />
    </>
  );
}
