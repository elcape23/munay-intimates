"use client";
import { ShareIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (err) {
        // ignore
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copiado al portapapeles" });
    } catch (err) {
      toast({ title: "No se pudo copiar el link" });
    }
  };

  return (
    <Button
      onClick={handleShare}
      aria-label="Compartir"
      className="text-icon-primary-default hover:bg-gray-200 transition-colors"
      variant="ghost"
      size="lg"
    >
      <ShareIcon className="h-6 w-6 text-icon-primary-default" />
    </Button>
  );
}
