export interface ProductIngredient {
  productId: number;
  ingredients?: {
    ingredientId: number;
    quantity: number;
  }[];
}
