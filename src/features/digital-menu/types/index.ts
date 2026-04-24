export interface Restaurant {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  available: boolean;
  tags?: string[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
}
