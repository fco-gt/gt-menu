import { MenuItem } from "@/types";
type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/menu/${params.id}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return <p>Menú no disponible</p>;
  const data = await res.json();

  const version = data.version;
  if (!version) return <p>Menú vacío</p>;

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">{version.name}</h1>
      <ul className="mt-4 space-y-3">
        {version.items.map((it: MenuItem) => (
          <li key={it.id} className="flex justify-between">
            <div>
              <div className="font-medium">{it.title}</div>
              {it.description && (
                <div className="text-sm opacity-80">{it.description}</div>
              )}
            </div>
            <div className="ml-4">{(it.priceCents / 100).toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
