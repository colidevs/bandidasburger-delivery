import HomePageClient from "./page.client";

import {IngredientsApi} from "@/modules/product/ingredients";
import {StoreApi} from "@/modules/store";
import {ProductsApi} from "@/modules/product";
import {IngredientTypesApi} from "@/modules/product/ingredient-types";
import {ProductTypesApi} from "@/modules/product/product-types";
import {SubproductsApi} from "@/modules/product/subproducts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const storeData = await StoreApi.fetch();

  const ingredientData = await IngredientsApi.fetch();

  const subproductsData = await SubproductsApi.fetch();

  const productData = await ProductsApi.fetch();

  const ingredientTypesData = await IngredientTypesApi.fetch();

  const productTypesData = await ProductTypesApi.fetch();

  return (
    <HomePageClient
      ingredientData={ingredientData}
      ingredientTypesData={ingredientTypesData}
      productData={productData}
      productTypesData={productTypesData}
      storeData={storeData}
      subproductsData={subproductsData}
    />
  );
}
