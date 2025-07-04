"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { OrderHistory } from "@/components/account/order-history";
import { Footer } from "@/components/common/footer";

export default function PurchasesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"en-proceso" | "entregadas" | "locales">(
    "en-proceso"
  );

  const renderTab = (
    value: "en-proceso" | "entregadas" | "locales",
    label: string
  ) => (
    <Button
      key={value}
      onClick={() => setTab(value)}
      variant="ghost"
      size="text"
      className={`pb-[0px] tracking-wide transition-colors uppercase ${
        tab === value
          ? "body-02-semibold text-text-primary-default border-b-[2px] border-border-primary-default"
          : "body-02-regular text-text-secondary-default hover:text-brand-primary"
      }`}
    >
      {label}
    </Button>
  );

  return (
    <div className="container mx-auto px-6 pt-[55px] min-h-screen flex flex-col justify-between">
      <div className="space-y-4 flex-grow">
        <div className="flex justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium text-text-primary-default uppercase">
            Mis Compras
          </h1>
        </div>
        <div className="flex space-x-6">
          {renderTab("en-proceso", "En proceso")}
          {renderTab("entregadas", "Entregadas")}
          {renderTab("locales", "Locales")}
        </div>
        <OrderHistory statusFilter={tab} />
      </div>
      <Footer />
    </div>
  );
}
