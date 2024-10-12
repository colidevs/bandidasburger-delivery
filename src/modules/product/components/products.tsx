import {ProductDrawer, type Product} from "@/modules/product";
import {cn} from "@/lib/utils";

type ProductsProps = {
  products: Product[];
  onClick: (product: Product) => void;
  className?: string;
  itemClassName?: string;
};

export function Products({products, onClick, className, itemClassName}: ProductsProps) {
  return (
    <ul className={cn(className)}>
      {products.map((product) => (
        <li key={product.name} className={itemClassName}>
          <ProductDrawer product={product} onClick={onClick} />
        </li>
      ))}
    </ul>
  );
}
