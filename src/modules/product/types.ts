import type {Ingredient} from "@/modules/product/ingredients";

export interface Product {
  type: string;
  name: string;
  description?: string;
  customDescription?: string;
  image: string;
  subproduct?: string;
  price: number;
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
  activo: string;
  productIngredients: {
    ingrediente: string;
    cantidad: string;
  }[];
}
