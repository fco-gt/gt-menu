import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

/*
Sembrar datos de prueba para probar la funcionalidad de la app
*/
export async function main() {
  console.log("Sembrando datos de prueba");

  // 1. Crear un Tenant (Restaurante)
  const tenant = await prisma.tenant.create({
    data: {
      name: "Restaurante Demo",
      slug: "restaurante-demo",
      menus: {
        create: {
          publicId: "qr-demo-123", // El ID que leerá el QR
          versions: {
            create: {
              name: "Versión Inicial",
              published: true,
              items: {
                create: [
                  {
                    title: "Hamburguesa Clásica",
                    description: "Con queso y tocino",
                    priceCents: 1200,
                    order: 1,
                    state: "ACTIVE",
                  },
                  {
                    title: "Papas Fritas",
                    description: "Croujientes y doradas",
                    priceCents: 500,
                    order: 2,
                    state: "ACTIVE",
                  },
                ],
              },
            },
          },
        },
      },
    },
  });

  console.log(
    `Datos sembrados. Tenant creado: ${tenant.name} (${tenant.slug})`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
