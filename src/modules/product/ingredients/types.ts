export interface Ingredient {
  type: string;
  name: string;
  addPrice: number;
  max: number;
  active: boolean;
}

export interface CsvIngredient {
  tipo: string;
  nombre: string;
  "precio-adicional": string;
  max: string;
  activo: string;
}
