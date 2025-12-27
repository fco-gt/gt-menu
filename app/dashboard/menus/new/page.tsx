"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, X } from "lucide-react";

type MenuItem = {
  title: string;
  description: string;
  priceCents: number;
  order: number;
};

export default function NewMenuPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [menuName, setMenuName] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);

  function addItem() {
    setItems([
      ...items,
      {
        title: "",
        description: "",
        priceCents: 0,
        order: items.length + 1,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem<Field extends keyof MenuItem>(
    index: number,
    field: Field,
    value: MenuItem[Field]
  ) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: menuName,
          items: items.map((item) => ({
            ...item,
            description: item.description || null,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create menu");
      }

      router.push("/dashboard/menus");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Menu</h1>
        <p className="text-muted-foreground mt-1">
          Add a new menu to your restaurant
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Menu Details</CardTitle>
            <CardDescription>Basic information about your menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Menu Name</Label>
              <Input
                id="name"
                placeholder="Summer Menu 2025"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>
                  Add items to your menu (optional)
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No items yet. Click &quot;Add Item&quot; to get started.
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-3 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => removeItem(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Pizza Margherita"
                      value={item.title}
                      onChange={(e) =>
                        updateItem(index, "title", e.target.value)
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Fresh mozzarella, tomato, basil"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="12.50"
                      value={item.priceCents / 100}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "priceCents",
                          Math.round(parseFloat(e.target.value || "0") * 100)
                        )
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Menu
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
