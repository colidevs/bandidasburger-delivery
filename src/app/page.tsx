import {IngredientsApi} from "@/modules/product/ingredients";
import {ProductsApi} from "@/modules/product";
import {SubproductsApi} from "@/modules/product/subproducts";
import {ProductsCart} from "@/modules/cart";

export default async function HomePage() {
  const ingredients = await IngredientsApi.fetch();
  const subproducts = await SubproductsApi.fetch();
  const products = await ProductsApi.fetch();

  return (
    <section className="flex w-full">
      <ProductsCart ingredients={ingredients} products={products} subproducts={subproducts} />
    </section>
  );
}
