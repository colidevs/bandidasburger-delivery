import {IngredientsApi} from "@/modules/product/ingredients";
import {StoreApi} from "@/modules/store";
import {type Product, ProductsApi} from "@/modules/product";
import {IngredientTypesApi} from "@/modules/product/ingredient-types";
import {ProductTypesApi} from "@/modules/product/product-types";
import {SubproductsApi} from "@/modules/product/subproducts";
import {ProductsCart} from "@/modules/cart";

export default async function HomePage() {
  const ingredients = await IngredientsApi.fetch();
  const subproducts = await SubproductsApi.fetch();
  const products = await ProductsApi.fetch();
  //const ingredientTypes = await IngredientTypesApi.fetch();
  //const productTypes = await ProductTypesApi.fetch();

  return (
    <section className="flex w-full">
      <ProductsCart
        // className="flex flex-1 flex-wrap gap-8"
        ingredients={ingredients}
        // itemClassName="w-full md:w-1/3 lg:w-1/4"
        products={products}
        // itemClassName="w-full md:w-1/3 lg:w-1/4"
        subproducts={subproducts}
      />
    </section>
  );
}
