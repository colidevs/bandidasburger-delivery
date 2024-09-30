export interface Ingredient {
  id: number;
  type: string;
  name: string;
  additionalPrice?: number;
  minQuantity: number;
  maxQuantity: number;
  selectable: boolean;
}
