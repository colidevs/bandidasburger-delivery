export interface Ingredient {
  type: string;
  name: string;
  price: number;
  required: boolean;
  quantity?: number;
  additionalQuantity?: number;
  deletedQuantity?: number;
  isSelected?: boolean;
  max: number;
  active: boolean;
}

export interface CsvIngredient {
  tipo: string;
  nombre: string;
  precio: string;
  max: string;
  activo: string;
}
