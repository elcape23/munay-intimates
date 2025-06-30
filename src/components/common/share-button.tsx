"use client";

import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url?: string;
  title?: string;
}

export function ShareButton({ url, title }: ShareButtonProps) {
  const handleShare = async () => {
    const shareUrl =
      url ?? (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (navigator.share) {
        await navigator.share({ url: shareUrl, title });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Enlace copiado" });
      }
    } catch (err) {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Enlace copiado" });
      }
    }
  };

  return (
    <Button
      onClick={handleShare}
      aria-label="Compartir"
      className="text-icon-primary-default hover:bg-gray-200 transition-colors"
      variant="ghost"
      size="icon"
    >
      <ArrowUpTrayIcon className="h-6 w-6 text-icon-primary-default" />
    </Button>
  );
}
