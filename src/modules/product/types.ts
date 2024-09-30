import {productIngredient} from "./product-ingredient";

export interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  ingredients?: productIngredient[];
  image: string;
  price: number;
}
