import {Product} from "./";

export const PRODUCTS: Product[] = [
  {
    type: "Hamburguesa",
    name: "Bandida",
    description: "M - Medallon",
    customDescription: "M - La hamburguesa mas sabroza de zona sur",
    image: "",
    price: 10000,
    active: true,
    productIngredients: [
      {
        name: "Pan de queso",
        quantity: 1,
      },
      {
        name: "Medallon de carne",
        quantity: 2,
      },
      {
        name: "Cheddar fundido",
        quantity: 1,
      },
      {
        name: "Medida de bacon",
        quantity: 1,
      },
    ],
  },
  {
    type: "M - Guarnicion",
    name: "M - Fritas",
    description: "",
    customDescription: "M - Bandeja de papas fritas para compartir",
    image: "",
    price: 6000,
    active: true,
  },
];
