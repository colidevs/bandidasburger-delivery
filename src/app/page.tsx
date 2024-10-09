import HomePageClient from "./page.client";

import {IngredientsApi} from "@/modules/product/ingredients";
import {storeApi} from "@/modules/store";
import {productApi} from "@/modules/product";
import {ingredientTypesApi} from "@/modules/product/ingredient-types";
import {productTypesApi} from "@/modules/product/product-types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const storeData = await storeApi.fetch();

  const ingredientData = await IngredientsApi.fetch();

  const productData = await productApi.fetch();

  const ingredientTypesData = await ingredientTypesApi.fetch();

  const productTypesData = await productTypesApi.fetch();

  return (
    <HomePageClient
      ingredientData={ingredientData}
      ingredientTypesData={ingredientTypesData}
      productData={productData}
      productTypesData={productTypesData}
      storeData={storeData}
    />
  );
}
