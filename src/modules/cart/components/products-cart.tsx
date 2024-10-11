"use client";
import {useState} from "react";
import {IndentDecrease, MinusCircle, MinusSquare, PlusCircle, PlusSquare} from "lucide-react";

import {type Product, Products} from "@/modules/product";
import {useCart} from "@/modules/cart";
import {cn} from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {IngredientsApi, type Ingredient} from "@/modules/product/ingredients";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Checkbox} from "@/components/ui/checkbox";

type ProductsCartProps = {
  products: Product[];
  ingredients: Ingredient[];
  className?: string;
};

export function ProductsCart({products, ingredients, className}: ProductsCartProps) {
  const [{shipping}, {cart, cartList, quantity, total}, {addItem, removeItem, updateItem}] =
    useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [customQuantity, setCustomQuantity] = useState(1);
  const [open, setOpen] = useState(false);

  function addToCart(product: Product | null, quantity: number) {
    if (!product) {
      alert("No se ha seleccionado un producto");

      return;
    }

    addItem(crypto.randomUUID(), {...product, quantity: quantity});
  }

  function handleOnClickItem(product: Product) {
    setProduct(product);
  }

  function handleClose(onClose?: () => void) {
    setProduct(null);
    setOpen(false);

    if (onClose) {
      onClose();
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Products className={cn(className)} products={products} onClick={handleOnClickItem} />
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col px-0 sm:pt-0">
        <ScrollArea className="flex-grow overflow-y-auto">
          <SheetHeader className="px-4 pb-4">
            <div className="flex justify-center sm:max-h-96 sm:max-w-96">
              <img
                alt=""
                className="aspect-square max-h-64 max-w-64 rounded-md object-cover object-center sm:max-h-none sm:max-w-none"
                src={product?.image}
              />
            </div>
            <SheetTitle className="text-start">{product?.name}</SheetTitle>
            <SheetDescription>{product?.description}</SheetDescription>
          </SheetHeader>
          <Separator />
          <section className="px-4 pt-4">
            <IngredientsDrawer
              allIngredients={ingredients}
              className="flex flex-col gap-2"
              ingredients={product?.productIngredients ?? []}
              itemClassName="p-1 border-t m-2"
            />
          </section>
        </ScrollArea>
        <footer className="sticky bottom-0 space-y-4 border-t bg-background pt-4">
          <div className="flex items-center justify-between px-4">
            <p className="font-semibold">Cantidad</p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={() => setCustomQuantity((x) => x - 1)}>
                <MinusCircle />
              </Button>
              <span className="flex items-center justify-center font-semibold">
                {customQuantity}
              </span>
              <Button size="icon" variant="ghost" onClick={() => setCustomQuantity((x) => x + 1)}>
                <PlusCircle />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between px-4">
            <Button variant="outline" onClick={() => handleClose()}>
              Cancelar
            </Button>
            <Button onClick={() => handleClose(() => addToCart(product, customQuantity))}>
              Añadir al carrito
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

type IngredientsDrawerProps = {
  ingredients: Ingredient[];
  allIngredients: Ingredient[];
  className?: string;
  itemClassName?: string;
};

function IngredientsDrawer({
  ingredients,
  allIngredients,
  className,
  itemClassName,
}: IngredientsDrawerProps) {
  const ingredientsGroupByType = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.type;

    return {...acc, [category]: [...(acc[category] ?? []), ingredient]};
  }, {});

  const ingredientCategories = Object.keys(ingredientsGroupByType);

  return !ingredients ? null : (
    <div>
      <ul className={cn(className)}>
        {ingredientCategories.map((category) => {
          const ingredients = ingredientsGroupByType[category];

          const source = allIngredients.filter((item) => item.type === category);

          return (
            <div key={category}>
              <ul>
                {ingredients.map((ingredient) => (
                  <IngredientDrawer
                    key={crypto.randomUUID()}
                    className={itemClassName}
                    ingredient={ingredient}
                    source={source}
                    type={ingredient.type}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </ul>
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IngredientDrawerProps = {
  ingredient: Ingredient;
  type: string;
  source: Ingredient[];
  className?: string;
};

function IngredientDrawer({ingredient, source, type, className}: IngredientDrawerProps) {
  if (type === "Aderezo") {
    return <Checkbox>{ingredient.name}</Checkbox>;
  }

  if (type === "Pan") {
    const list = source.filter((item) => item.type === "Pan");

    return <SelectIngredient ingredient={ingredient} list={list} />;
  }

  if (type === "Medallon") {
    const list = source.filter((item) => item.type === "Medallon");

    return <SelectIngredient ingredient={ingredient} list={list} />;
  }

  return (
    <div className={cn(className)}>
      <h2>{ingredient.name}</h2>
    </div>
  );
}

type SelectIngredientProps = {
  ingredient: Ingredient;
  list: Ingredient[];
  className?: string;
};

function SelectIngredient({ingredient, list, className}: SelectIngredientProps) {
  const amount = list.length;

  return (
    <Select>
      <SelectTrigger className={cn("w-full", className)} disabled={amount <= 1}>
        <SelectValue placeholder={ingredient.type} />
      </SelectTrigger>
      <SelectContent>
        {list.map((item) => (
          <SelectItem key={item.name} value={item.name}>
            <p>
              {item.name} - ${item.price}
            </p>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
