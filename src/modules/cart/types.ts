import type {Product} from "@/modules/product/types";

export interface CartItem extends Product {
  quantity: number;
}

export type Cart = Map<string, CartItem>;
