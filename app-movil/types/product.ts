export type ProductCategory = 'book' | 'clothing' | 'accessory' | 'food' | 'home';

export interface ProductVariation {
    id: number | string;
    nombre: string;
    stock: number;
    precio_adicional?: number;
    precio_fijo?: number;
}

export interface Product {
    id: string;
    code: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: ProductCategory;
    imageUrl: string;
    hasIva: boolean;
    variaciones?: ProductVariation[];
}

export interface CartItem extends Product {
    cantidad: number;
    selectedVariation?: ProductVariation | null;
}
