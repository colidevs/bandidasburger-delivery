import type {Product} from "@/modules/product";

import {cn} from "@/lib/utils";

type ProductDrawerProps = {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
};

export function ProductDrawer({product, onClick, className}: ProductDrawerProps) {
  return (
    <div className={cn("flex justify-between", className)} onClick={() => onClick(product)}>
      <div className="flex flex-col">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p>{product.price}</p>
      </div>
      <img alt={"imagen de " + product.name} src={product.image} width={144} />
    </div>
  );
}
