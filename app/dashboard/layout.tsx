import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentTenant } from "@/lib/auth-helpers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has a tenant
  const tenant = await getCurrentTenant(userId);

  if (!tenant) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">QR Menu</h1>
              <span className="ml-4 text-sm text-gray-500">{tenant.name}</span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href="/dashboard/menus"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Menus
              </a>
              <a
                href="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
