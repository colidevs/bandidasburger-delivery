import type {Product} from "@/modules/product";

import {cn} from "@/lib/utils";

type ProductDrawerProps = {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
};

export function ProductDrawer({product, onClick, className}: ProductDrawerProps) {
  const originalPrice = product.price / (1 - product.discount / 100)

  return (
    <div
      className={cn(
        "border-white/300 relative line-clamp-3 flex h-[200px] w-full cursor-pointer items-stretch justify-between gap-2 rounded-md border p-4",
        className,
      )}
      onClick={() => onClick(product)}
    >
      {product.discount > 0 && (
        <div
          className="absolute right-2 top-4 rotate-45 transform bg-red-500 px-2 py-1 text-center text-xs font-bold text-white"
          style={{
            width: "80%",
            right: "-35%",
          }}
        >
          {product.discount}% OFF
        </div>
      )}
      <div className="flex w-3/4 flex-col justify-between">
        <h3 className="line-clamp-1 font-medium">{product.name}</h3>
        <p className="mt-2 line-clamp-5 text-sm text-muted-foreground">{product.description}</p>
        {product.discount > 0 ? (
          <div className="flex space-x-2">
            <p className="mt-auto font-medium text-green-600">${product.price}</p>
            <p className="mt-auto place-self-center text-sm text-muted-foreground line-through">
              ${originalPrice}
            </p>
          </div>
        ) : (
          <p className="mt-auto font-semibold text-green-600">${product.price}</p>
        )}
      </div>
      {product.image ? (
        <img
          alt={"imagen de " + product.name}
          className="aspect-square h-[166px] w-[166px] rounded-md object-cover"
          src={product.image}
        />
      ) : (
        <div className="flex aspect-square h-[166px] w-[166px] items-center justify-center rounded-md bg-[#460315]">
          <p
            className="select-none font-bleedingCowboys text-8xl text-[#ff9a21]"
            style={{textShadow: "black 10px 0 10px"}}
          >
            ?
          </p>
        </div>
      )}
    </div>
  );
}
