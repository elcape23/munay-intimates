"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { AddressList } from "@/components/account/address-list";
import { Footer } from "@/components/common/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddressesPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-6 pt-[55px] min-h-screen flex flex-col justify-between">
      <div className="flex justify-between">
        <Button onClick={() => router.back()} variant="ghost" size="icon">
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <h1 className="body-01-medium text-text-primary-default uppercase">
          Direcciones
        </h1>
      </div>
      <Tabs defaultValue="principal" className="flex-grow space-y-4">
        <TabsList>
          <TabsTrigger
            value="principal"
            className="flex-1 text-center uppercase"
          >
            Principal
          </TabsTrigger>
        </TabsList>
        <TabsContent value="principal" className="space-y-4">
          <AddressList />
        </TabsContent>
      </Tabs>
      <Footer />
    </div>
  );
}
