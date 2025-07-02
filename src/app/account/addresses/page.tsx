"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AddressList } from "@/components/account/address-list";
import { Footer } from "@/components/common/footer";

export default function AddressesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-6 pt-[55px] min-h-screen flex flex-col justify-between">
      <div className="space-y-4 flex-grow">
        <div className="flex justify-between">
          <Button onClick={() => router.back()} variant="ghost" size="icon">
            <ChevronLeftIcon className="w-6 h-6" />
          </Button>
          <h1 className="body-01-medium text-text-primary-default uppercase">
            Direcciones
          </h1>
        </div>
        <AddressList />
      </div>
      <Footer />
    </div>
  );
}
