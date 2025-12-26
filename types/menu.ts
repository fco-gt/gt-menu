export interface MenuItem {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  order: number;
}

export interface MenuVersion {
  id: string;
  name: string;
  published: boolean;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  publicId: string;
  versions: MenuVersion[];
}
