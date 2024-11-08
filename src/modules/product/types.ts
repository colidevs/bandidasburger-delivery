import type {Ingredient} from "@/modules/product/ingredients";

import {Subproduct} from "./subproducts";

export interface Product {
  type: string;
  name: string;
  description?: string;
  customDescription?: string;
  image: string;
  subproduct?: Subproduct;
  price: number;
  discount: number;
  active: boolean;
  productIngredients: Ingredient[];
}

export interface CsvProduct {
  tipo: string;
  nombre: string;
  descripcion?: string;
  "descripcion personalizada"?: string;
  imagen: string;
  subproducto?: string;
  precio: string;
  descuento: string;
  activo: string;
  productIngredients: {
    ingrediente: string;
    cantidad: string;
  }[];
}
