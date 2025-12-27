"use client";

import QRCode from "react-qr-code";
import Link from "next/link";
import { useState } from "react";

type TenantWithMenus = {
  id: string;
  name: string;
  slug: string;
  menus: {
    id: string;
    publicId: string;
    createdAt: Date;
  }[];
};

export function TenantList({ tenants }: { tenants: TenantWithMenus[] }) {
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  if (tenants.length === 0) {
    return <p className="text-gray-500">No tenants found.</p>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      {tenants.map((tenant) => (
        <div key={tenant.id} className="border p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{tenant.name}</h3>
              <p className="text-sm text-gray-500">/{tenant.slug}</p>
            </div>
            <div className="text-sm text-gray-400">{tenant.id}</div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2 text-sm text-gray-700">Menus</h4>
            {tenant.menus.length === 0 ? (
              <p className="text-sm text-gray-500">No menus created.</p>
            ) : (
              <div className="space-y-4">
                {tenant.menus.map((menu) => {
                  const menuUrl = `${baseUrl}/menu/${menu.publicId}`;
                  return (
                    <div
                      key={menu.id}
                      className="flex items-center gap-4 bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-mono text-xs text-gray-500 mb-1">
                          {menu.publicId}
                        </div>
                        <Link
                          href={`/menu/${menu.publicId}`}
                          target="_blank"
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View Menu Public Page
                        </Link>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedMenu(
                            selectedMenu === menu.publicId
                              ? null
                              : menu.publicId
                          )
                        }
                        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      >
                        {selectedMenu === menu.publicId ? "Hide QR" : "Show QR"}
                      </button>

                      {selectedMenu === menu.publicId && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-2xl border z-50">
                          <div className="text-center">
                            <h3 className="mb-4 font-bold text-lg">
                              {tenant.name}
                            </h3>
                            <div className="bg-white p-2 inline-block">
                              <QRCode value={menuUrl} size={256} />
                            </div>
                            <p className="mt-4 text-sm text-gray-500 font-mono break-all">
                              {menuUrl}
                            </p>
                            <button
                              onClick={() => setSelectedMenu(null)}
                              className="mt-4 px-4 py-2 bg-black text-white rounded-md w-full"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
