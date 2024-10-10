import {ProductType} from "./";

export const PRODUCT_TYPES: ProductType[] = [
  {
    name: "M - Hamburguesa",
    includeSubProduct: true,
    active: true,
  },
  {
    name: "M - Guarnicion",
    includeSubProduct: false,
    active: true,
  },
  {
    name: "M - Box",
    includeSubProduct: false,
    active: false,
  },
];
