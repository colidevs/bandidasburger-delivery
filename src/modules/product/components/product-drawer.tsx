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
      // className={cn(
      //   "border-white/300 mw-100 flex cursor-pointer items-stretch justify-between gap-2 rounded-md border p-4",
      //   className,
      // )}
      className={cn(
        "border-white/300 line-clamp-3 flex h-[200px] max-h-[300px] min-w-[300px] cursor-pointer items-stretch justify-between gap-2 rounded-md border p-4",
        className,
      )}
      onClick={() => onClick(product)}
    >
      <div className="flex flex-col justify-between">
        <h3 className="font-medium">{product.name}</h3>
        <p className="mt-2 line-clamp-5  text-sm text-muted-foreground">{product.description}</p>
        <p className="mt-auto font-medium text-green-600">${product.price}</p>
      </div>
      <img
        alt={"imagen de " + product.name}
        className="rounded-md"
        src={product.image}
        width={144}
      />
    </div>
  );
}
