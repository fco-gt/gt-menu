import prisma from "../lib/prisma";
import { nanoid } from "nanoid";

async function main() {
  console.log("Seeding demo restaurant...");

  const slug = "la-trattoria-demo";

  // Clean up if exists
  await prisma.item.deleteMany({
    where: { version: { menu: { tenant: { slug } } } },
  });
  await prisma.menuVersion.deleteMany({
    where: { menu: { tenant: { slug } } },
  });
  await prisma.menu.deleteMany({ where: { tenant: { slug } } });
  await prisma.tenant.deleteMany({ where: { slug } });

  // Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: "La Trattoria Demo",
      slug,
    },
  });

  // Create Menu
  const menu = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      publicId: nanoid(10),
    },
  });

  // Create Version
  const version = await prisma.menuVersion.create({
    data: {
      menuId: menu.id,
      name: "Main Menu Summer",
      published: true,
    },
  });

  // Create Items
  await prisma.item.createMany({
    data: [
      {
        versionId: version.id,
        title: "Pizza Margherita",
        description:
          "San Marzano tomatoes, mozzarella di bufala, fresh basil, extra-virgin olive oil.",
        priceCents: 1250,
        order: 1,
      },
      {
        versionId: version.id,
        title: "Tagliatelle al Tartufo",
        description:
          "Fresh homemade pasta with black truffle sauce and parmesan.",
        priceCents: 1800,
        order: 2,
      },
      {
        versionId: version.id,
        title: "Tiramisu della Nonna",
        description:
          "Classic Italian dessert with coffee-dipped ladyfingers and mascarpone cream.",
        priceCents: 850,
        order: 3,
      },
      {
        versionId: version.id,
        title: "Risotto ai Funghi",
        description: "Creamy risotto with porcini mushrooms and parsley.",
        priceCents: 1600,
        order: 4,
      },
      {
        versionId: version.id,
        title: "Insalata Caprese",
        description:
          "Sliced fresh mozzarella, tomatoes, and sweet basil, seasoned with salt and olive oil.",
        priceCents: 1100,
        order: 5,
      },
    ],
  });

  console.log(`Created tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`Menu public URL: /menu/${menu.publicId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
