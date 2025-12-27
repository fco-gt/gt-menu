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
import { Eye, Pencil, QrCode } from "lucide-react";
import { PublishToggle } from "./PublishToggle";

export default async function MenusPage() {
  const { tenant } = await requireTenant();

  const menus = await prisma.menu.findMany({
    where: { tenantId: tenant.id },
    include: {
      versions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          _count: {
            select: { items: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menus</h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurant&apos;s menus
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/menus/new">Create Menu</Link>
        </Button>
      </div>

      {menus.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No menus yet</p>
            <Button asChild>
              <Link href="/dashboard/menus/new">Create Your First Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {menus.map((menu) => {
            const latestVersion = menu.versions[0];
            if (!latestVersion) return null;

            return (
              <Card key={menu.id}>
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
                        {latestVersion._count.items} items
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/menus/${menu.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/menus/${menu.id}/edit`}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <PublishToggle
                      menuId={menu.id}
                      isPublished={latestVersion.published}
                    />
                    {latestVersion.published && (
                      <>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/menus/${menu.id}/qr`}>
                            <QrCode className="h-4 w-4 mr-2" />
                            QR Code
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/menu/${menu.publicId}`} target="_blank">
                            View Public Page
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
