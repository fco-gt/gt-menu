import prisma from "@/lib/prisma";
import { TenantList } from "./components/TenantList";
import { CreateDemoTenant } from "./components/CreateDemoTenant";

export default async function AdminPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      menus: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <CreateDemoTenant />
      </div>

      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Tenants ({tenants.length})
          </h2>
          <TenantList tenants={tenants} />
        </div>
      </div>
    </main>
  );
}
