"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PublishToggleProps = {
  menuId: string;
  isPublished: boolean;
};

export function PublishToggle({ menuId, isPublished }: PublishToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleToggle() {
    setIsLoading(true);
    try {
      const endpoint = isPublished ? "unpublish" : "publish";
      const res = await fetch(`/api/menu/${menuId}/${endpoint}`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update publish status");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update menu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isPublished ? "outline" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
}
