import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireTenant } from "@/lib/auth-helpers";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const { tenant } = await requireTenant();

  // Get stats
  const [totalMenus, publishedMenus, totalItems] = await Promise.all([
    prisma.menu.count({ where: { tenantId: tenant.id } }),
    prisma.menuVersion.count({
      where: {
        menu: { tenantId: tenant.id },
        published: true,
      },
    }),
    prisma.item.count({
      where: {
        version: {
          menu: { tenantId: tenant.id },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Manage your restaurant&apos;s digital menus
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Menus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Published Menus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedMenus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard/menus/new">Create New Menu</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/menus">View All Menus</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Empty State */}
      {totalMenus === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t created any menus yet
            </p>
            <Button asChild>
              <Link href="/dashboard/menus/new">Create Your First Menu</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
