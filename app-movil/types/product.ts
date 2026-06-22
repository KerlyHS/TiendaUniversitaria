export type ProductCategory = 'book' | 'clothing' | 'accessory' | 'food' | 'home';

export interface Product {
    id: string;
    code: string;
    name: string;
    price: number;
    category: ProductCategory;
    imageUrl: string;
    hasIva: boolean;
}

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: 'S' | 'M' | 'L' | 'XL';
    saleType?: 'kilo' | 'unit';
}
