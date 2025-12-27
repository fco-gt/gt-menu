import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireTenant } from "@/lib/auth-helpers";
import { notFound } from "next/navigation";
import { Pencil, QrCode, ArrowLeft } from "lucide-react";
import { PublishToggle } from "../PublishToggle";

type Params = Promise<{ menuId: string }>;

export default async function MenuDetailPage(props: { params: Params }) {
  const { tenant } = await requireTenant();
  const { menuId } = await props.params;

  const menu = await prisma.menu.findFirst({
    where: {
      id: menuId,
      tenantId: tenant.id,
    },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!menu) {
    notFound();
  }

  const latestVersion = menu.versions[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/menus">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Menus
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                {latestVersion.name}
                {latestVersion.published ? (
                  <Badge variant="default">Published</Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Menu ID: {menu.publicId}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link href={`/dashboard/menus/${menu.id}/edit`}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Menu
              </Link>
            </Button>
            <PublishToggle
              menuId={menu.id}
              isPublished={latestVersion.published}
            />
            {latestVersion.published && (
              <>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/menus/${menu.id}/qr`}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Get QR Code
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={`/menu/${menu.publicId}`} target="_blank">
                    View Public Page
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Menu Items</h3>
            {latestVersion.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet</p>
            ) : (
              <div className="space-y-3">
                {latestVersion.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 font-medium">
                      ${(item.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
