import {ProductDrawer, type Product} from "@/modules/product";
import {cn} from "@/lib/utils";

type ProductsProps = {
  products: Product[];
  onClick: (product: Product) => void;
  className?: string;
};

export function Products({products, onClick, className}: ProductsProps) {
  return (
    <ul className={cn(className)}>
      {products.map((product) => (
        <li key={product.name} className="border">
          <ProductDrawer product={product} onClick={onClick} />
        </li>
      ))}
    </ul>
  );
}
