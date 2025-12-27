"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function CreateDemoTenant() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    setIsLoading(true);
    try {
      const slug = `demo-${Math.random().toString(36).substring(2, 7)}`;

      const res = await fetch("/api/admin/menu/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantSlug: slug,
          name: "Trattoria Demo",
          items: [
            {
              title: "Pizza Margherita",
              description: "Tomato, mozzarella, basil",
              priceCents: 1200,
              order: 1,
            },
            {
              title: "Spaghetti Carbonara",
              description: "Eggs, pecorino, guanciale, pepper",
              priceCents: 1400,
              order: 2,
            },
            {
              title: "Tiramisu",
              description: "Coffee, mascarpone, cocoa",
              priceCents: 800,
              order: 3,
            },
          ],
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(`Error: ${JSON.stringify(error)}`);
        return;
      }

      router.refresh();
      alert("Demo tenant created!");
    } catch (e) {
      console.error(e);
      alert("Failed to create tenant");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      Create Demo Tenant
    </button>
  );
}
