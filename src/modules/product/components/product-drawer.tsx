import type {Product} from "@/modules/product";

import {cn} from "@/lib/utils";

type ProductDrawerProps = {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
};

export function ProductDrawer({product, onClick, className}: ProductDrawerProps) {
  return (
    <div
      className={cn(
        "border-white/300 items-strech line-clamp-3 flex h-[200px] w-full cursor-pointer justify-between gap-2 rounded-md border p-4",
        className,
      )}
      onClick={() => onClick(product)}
    >
      <div className="flex flex-col justify-between">
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        <p className="mt-2 line-clamp-5 text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-auto font-medium text-green-600">${product.price}</p>
      </div>
      <img
        alt={"imagen de " + product.name}
        className="aspect-square rounded-md"
        src={product.image}
      />
    </div>
  );
}
