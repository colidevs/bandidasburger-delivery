import HomePageClient from "./page.client";

import {IngredientsApi} from "@/modules/product/ingredients";
import {storeApi} from "@/modules/store";
import {productApi} from "@/modules/product";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const storeData = await storeApi.fetch();

  const ingredientData = await IngredientsApi.fetch();

  const productData = await productApi.fetch();

  return (
    <HomePageClient
      ingredientData={ingredientData}
      productData={productData}
      storeData={storeData}
    />
  );
}
