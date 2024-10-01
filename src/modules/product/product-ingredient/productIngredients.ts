import {ProductIngredient} from "./";

export const PROD_INGR: ProductIngredient[] = [
  {
    // Perversa - Medallón 150gr - Doble cheddar - Pan de papa
    productId: 1,
    ingredients: [
      {
        ingredientId: 2,
        quantity: 1,
      },
      {
        ingredientId: 3,
        quantity: 2,
      },
      {
        ingredientId: 8,
        quantity: 1,
      },
    ],
  },
  {
    // Gata malvada - Doble medallón 110gr - Cuadruple cheddar - Bacon - Cebolla Cryspy - Pan de papa
    productId: 2,
    ingredients: [
      {
        ingredientId: 1,
        quantity: 2,
      },
      {
        ingredientId: 3,
        quantity: 4,
      },
      {
        ingredientId: 4,
        quantity: 1,
      },
      {
        ingredientId: 6,
        quantity: 1,
      },
      {
        ingredientId: 8,
        quantity: 1,
      },
    ],
  },
  {
    // Fritas - Bandeja de papas fritas para compartir
    productId: 3,
    ingredients: undefined,
  },
  {
    // Fritas especiales - Bandeja de papas fritas con cheddar, bacon y verdeo para compartir
    productId: 4,
    ingredients: [
      {
        ingredientId: 3,
        quantity: 1,
      },
      {
        ingredientId: 4,
        quantity: 1,
      },
      {
        ingredientId: 8,
        quantity: 1,
      },
    ],
  },
];
