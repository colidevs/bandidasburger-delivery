import {IngredientsApi} from "@/modules/product/ingredients";
import {StoreApi} from "@/modules/store";
import {type Product, ProductsApi} from "@/modules/product";
import {IngredientTypesApi} from "@/modules/product/ingredient-types";
import {ProductTypesApi} from "@/modules/product/product-types";
import {SubproductsApi} from "@/modules/product/subproducts";
import {ProductsCart} from "@/modules/cart";

const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await StoreApi.fetch();
  const ingredients = await IngredientsApi.fetch();
  const subproducts = await SubproductsApi.fetch();
  const products = await ProductsApi.fetch();
  const ingredientTypes = await IngredientTypesApi.fetch();
  const productTypes = await ProductTypesApi.fetch();

  return (
    <section className="flex gap-6">
      <ProductsCart
        className="flex flex-1 flex-col gap-8"
        ingredients={ingredients}
        products={products}
      />
    </section>
  );
}
