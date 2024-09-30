import {Product} from "./";

export const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Perversa",
    category: "Simples",
    description: "Medallón 150gr - Doble cheddar - Pan de papa",
    ingredients: [
      {ingredientId: 2, quantity: 1},
      {ingredientId: 3, quantity: 2},
      {ingredientId: 8, quantity: 1},
    ],
    image: "/assets/products/01.jpg",
    price: 8000,
  },
  {
    id: 2,
    title: "Gata malvada",
    category: "Dobles",
    description: "Doble medallón 110gr - Cuadruple cheddar - Bacon - Cebolla Cryspy - Pan de papa",
    ingredients: [
      {ingredientId: 1, quantity: 2},
      {ingredientId: 3, quantity: 4},
      {ingredientId: 4, quantity: 1},
      {ingredientId: 6, quantity: 1},
      {ingredientId: 8, quantity: 1},
    ],
    image: "/assets/products/02.jpg",
    price: 9500,
  },
  {
    id: 3,
    title: "Fritas",
    category: "Guarniciones",
    description: "Bandeja de papas fritas para compartir",
    ingredients: undefined,
    image: "/assets/products/07.jpg",
    price: 6000,
  },
  {
    id: 4,
    title: "Fritas especiales",
    category: "Guarniciones",
    description: "Bandeja de papas fritas con cheddar, bacon y verdeo para compartir",
    ingredients: [
      {ingredientId: 3, quantity: 1},
      {ingredientId: 4, quantity: 1},
      {ingredientId: 8, quantity: 1},
    ],
    image: "/assets/products/07.jpg",
    price: 6000,
  },
];
