"use client";
import {useEffect, useState} from "react";
import {IndentDecrease, MinusCircle, MinusSquare, PlusCircle, PlusSquare} from "lucide-react";

import {type Product, Products} from "@/modules/product";
import {useCart} from "@/modules/cart";
import {categoryToPlural, cn} from "@/lib/utils";
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
  itemClassName?: string;
};

const useCustomPrice = () => {
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [ingredientCount, setIngredientCount] = useState<number>(0);

  return {customPrice, setCustomPrice, ingredientCount, setIngredientCount};
};

const useIngredientsPreCart = (ingredients: Ingredient[], product: Product) => {
  const [ingredientsPreCart, setIngredientsPreCart] = useState<Map<string, number>>(new Map());
  const [price, setPrice] = useState<number>(0);

  const handleIngredientsPrice = (ingredient: Ingredient, quantity: number) => {
    const basePrice = product.price;
    const baseQuantity = ingredient.quantity!;

    setIngredientsPreCart((prev) => {
      const updatedIngredients = new Map(prev);

      if (quantity > baseQuantity) {
        updatedIngredients.set(ingredient.name, quantity - baseQuantity);
      } else {
        updatedIngredients.delete(ingredient.name);
      }

      let additionalPrice = 0;

      updatedIngredients.forEach((extraQuantity, name) => {
        const ingredientToAdd = ingredients.find((ing) => ing.name === name);

        if (ingredientToAdd) {
          additionalPrice += ingredientToAdd.price * extraQuantity;
        }
      });

      setPrice(basePrice + additionalPrice);

      return updatedIngredients;
    });
  };

  return {ingredientsPreCart, setIngredientsPreCart};
};

export function ProductsCart({products, ingredients, className, itemClassName}: ProductsCartProps) {
  const [{shipping}, {cart, cartList, quantity, total}, {addItem, removeItem, updateItem}] =
    useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const {customPrice, setCustomPrice} = useCustomPrice();
  const [open, setOpen] = useState<boolean>(false);

  const [subtotals, setSubtotals] = useState<{[key: string]: number}>({});

  function addToCart(product: Product | null, quantity: number) {
    if (!product) {
      alert("No se ha seleccionado un producto");

      return;
    }

    addItem(crypto.randomUUID(), {...product, quantity: quantity});
  }

  function handleOnClickItem(product: Product) {
    setProduct(product);
    setCustomPrice(product.price);
    setSubtotals({});
  }

  function handleClose(onClose?: () => void) {
    setOpen(false);
    setCustomQuantity(1);

    if (onClose) {
      onClose();
    }
  }

  function handleIngredientsPrice(ingredient: Ingredient, quantity: number) {
    // `basePrice` siempre se mantiene igual
    const basePrice = product!.price;
    const baseQuantity = ingredient.quantity!; // Cantidad base del ingrediente

    // Calcular el precio adicional solo si la cantidad es mayor a la base
    // if (quantity > baseQuantity) {
    //   const additionalPrice = ingredient.price * (quantity - baseQuantity);

    //   setCustomPrice(basePrice + additionalPrice);
    // } else {
    //   // Si la cantidad es menor o igual a la base, el precio adicional se elimina
    //   setCustomPrice(basePrice);
    // }

    // setAdditionalIngredients((prev) => {
    //   const updatedIngredients = new Map(prev);

    //   // Si la cantidad es mayor a la base, se agrega/modifica el ingrediente
    //   if (quantity > baseQuantity) {
    //     updatedIngredients.set(ingredient.name, quantity - baseQuantity);
    //   } else {
    //     // Si la cantidad es igual o menor a la base, eliminamos el ingrediente de la lista
    //     updatedIngredients.delete(ingredient.name);
    //   }

    //   // Calculamos el precio adicional
    //   let additionalPrice = 0;

    //   updatedIngredients.forEach((extraQuantity, name) => {
    //     const ingredientToAdd = ingredients.find((ing) => ing.name === name);

    //     if (ingredientToAdd) {
    //       additionalPrice += ingredientToAdd.price * extraQuantity;
    //     }
    //   });

    //   // Actualizamos el precio personalizado
    //   setCustomPrice(basePrice + additionalPrice);

    //   return updatedIngredients;
    // });

    setSubtotals((prev) => {
      const updatedSubtotals = {...prev};

      // Si la cantidad es mayor a la base, calculamos el subtotal del ingrediente
      if (quantity > baseQuantity) {
        const additionalQuantity = quantity - baseQuantity;

        updatedSubtotals[ingredient.name] = ingredient.price * additionalQuantity;
      } else {
        // Si la cantidad es igual o menor a la base, eliminamos el subtotal del ingrediente
        delete updatedSubtotals[ingredient.name];
      }

      // Calculamos el precio personalizado basado en los subtotales actuales
      let additionalPrice = 0;

      for (const key in updatedSubtotals) {
        additionalPrice += updatedSubtotals[key];
      }

      // El precio personalizado es el precio base más el precio adicional de los ingredientes
      setCustomPrice(product!.price + additionalPrice);

      return updatedSubtotals;
    });
  }

  function handleQuantityChange(newQuantity: number) {
    setCustomQuantity(newQuantity);

    // Recalculamos el precio personalizado considerando los subtotales y la nueva cantidad de productos
    setCustomPrice((prevPrice) => {
      const basePrice = product!.price * newQuantity;
      const additionalPrice =
        Object.values(subtotals).reduce((acc, subtotal) => acc + subtotal, 0) * newQuantity;

      return basePrice + additionalPrice;
    });
  }

  const burgers = products.filter((product) => product.type === "Hamburguesas");
  const others = products.filter((product) => product.type !== "Hamburguesas");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <h2 className="mb-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Hamburguesas
            </h2>
            <Products
              className={cn(className)}
              itemClassName={itemClassName}
              products={burgers}
              onClick={handleOnClickItem}
            />
          </div>
          <div className="w-full">
            <h2 className="mb-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Guarniciones
            </h2>
            <Products
              className={cn(className)}
              itemClassName={itemClassName}
              products={others}
              onClick={handleOnClickItem}
            />
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col px-0 sm:pt-0">
        <ScrollArea className="flex-grow overflow-y-auto px-4" color="white">
          <SheetHeader className="px-4 pb-4">
            <img
              alt=""
              className="aspect-square max-h-64 max-w-64 rounded-md object-cover object-center sm:max-h-none sm:max-w-none"
              src={product?.image}
            />
            <SheetTitle className="text-start">{product?.name}</SheetTitle>
            <SheetDescription>{product?.description}</SheetDescription>
          </SheetHeader>
          <Separator />
          <section className="px-4 pt-4">
            <IngredientsDrawer
              allIngredients={ingredients}
              className="flex flex-col gap-4"
              ingredients={product?.productIngredients ?? []}
              itemClassName="px-2"
              product={product!}
              onChange={handleIngredientsPrice}
            />
          </section>
        </ScrollArea>
        <footer className="sticky bottom-0 space-y-4 border-t bg-background">
          <div className="flex items-center justify-between px-4">
            {/* <Counter
              value={customQuantity}
              onChange={(x) => {
                setCustomQuantity(x);
                setCustomPrice((prev) => {
                  const b = customPrice * x;

                  return b;
                });
              }}
            >
              Cantidad
            </Counter> */}
            <Counter value={customQuantity} onChange={handleQuantityChange}>
              Cantidad
            </Counter>
          </div>

          <Separator />

          <div className="flex gap-2 px-4">
            <Button variant="outline" onClick={() => handleClose()}>
              Cancelar
            </Button>
            <Button
              className="flex flex-1 justify-between"
              onClick={() =>
                handleClose(() =>
                  addToCart(
                    {
                      ...product,
                      price: product!.price + (customPrice - product!.price * customQuantity),
                    } as Product,
                    customQuantity,
                  ),
                )
              }
            >
              <span>Agregar</span>
              <span>$ {customPrice}</span>
            </Button>
          </div>
        </footer>
      </SheetContent>
    </Sheet>
  );
}

type IngredientsDrawerProps = {
  product: Product;
  ingredients: Ingredient[];
  allIngredients: Ingredient[];
  className?: string;
  itemClassName?: string;
  onChange?: (ingredient: Ingredient, quantity: number) => void;
};

interface IngredientPerCategory {
  [category: string]: Ingredient[];
}

function IngredientsDrawer({
  product,
  ingredients,
  allIngredients,
  className,
  itemClassName,
  onChange = () => {},
}: IngredientsDrawerProps) {
  const ingredientsGroupByType: IngredientPerCategory = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.type;

    if (!category) {
      return acc;
    }

    return {...acc, [category]: [...(acc[category] ?? []), ingredient]};
  }, {} as IngredientPerCategory);

  const ingredientCategories = Object.keys(ingredientsGroupByType);

  return !ingredients ? null : (
    <div>
      <ul className={cn(className)}>
        {ingredientCategories.map((category) => {
          const ingredients = ingredientsGroupByType[category];

          const source = allIngredients.filter((item) => item.type === category);

          return (
            <div key={category}>
              <h4 className="mb-3 border-b pb-1">
                {source.length <= 1 ? category : categoryToPlural(category)}
              </h4>
              <ul className="flex flex-col items-start justify-center gap-2">
                {ingredients.map((ingredient) => (
                  <IngredientDrawer
                    key={`${ingredient.name}-${ingredient.type}`}
                    className={itemClassName}
                    ingredient={ingredient}
                    product={product}
                    source={source}
                    type={ingredient.type}
                    onChange={(ingredient, quantity) => onChange(ingredient, quantity)}
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
  product: Product;
  ingredient: Ingredient;
  type: string;
  source: Ingredient[];
  onChange?: (ingredient: Ingredient, quantity: number) => void;
  className?: string;
};

function IngredientDrawer({
  product,
  ingredient,
  source,
  type,
  className,
  onChange = () => {},
}: IngredientDrawerProps) {
  const ingredientFromProduct = product.productIngredients.find(
    (item) => item.name === ingredient.name,
  );

  if (type === "Aderezo") {
    return (
      <CheckboxIngredient key={ingredient.name} className={className} ingredient={ingredient} />
    );
  }

  if (type === "Pan") {
    const list = source.filter((item) => item.type === "Pan");

    return <SelectIngredient className={cn(className)} ingredient={ingredient} list={list} />;
  }

  if (type === "Medallon") {
    const list = source.filter((item) => item.type === "Medallon");

    return (
      <div className="flex w-full">
        <SelectIngredient className={cn(className)} ingredient={ingredient} list={list} />
        <Counter
          className="w-fit"
          value={ingredientFromProduct?.quantity ?? 1}
          onChange={(value) => onChange(ingredient, value)}
        />
      </div>
    );
  }

  if (type === "Topping") {
    if (ingredient.max <= 1) {
      return <CheckboxIngredient className={className} ingredient={ingredient} />;
    }

    return (
      <Counter
        disabled={(value) => value === 0}
        value={ingredientFromProduct?.quantity ?? 1}
        onChange={(value) => onChange(ingredient, value)}
      >
        {ingredient.name}
      </Counter>
    );
  }

  return null;
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
      <SelectTrigger className={cn("w-full", className)} disabled={amount === 1}>
        <SelectValue placeholder={ingredient.name} />
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

type CheckboxIngredientProps = {
  ingredient: Ingredient;
  className?: string;
  onChange?: (ingredient: Ingredient) => void;
};

function CheckboxIngredient({ingredient, className}: CheckboxIngredientProps) {
  return (
    <div className={cn("space-x-3", className)}>
      <Checkbox defaultChecked id={ingredient.name} />
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        htmlFor={ingredient.name}
      >
        {ingredient.name}
      </label>
    </div>
  );
}

type CounterProps = {
  onChange?: (value: number) => void;
  value?: number;
  disabled?: (value: number) => boolean;
  className?: string;
  children?: React.ReactNode;
};

function Counter({
  onChange = () => {},
  value = 1,
  disabled = (value) => value === 1,
  className,
  children,
}: CounterProps) {
  const [count, setCount] = useState(value);

  function handleSetCustomQuantity(quantityLambda: (x: number) => number) {
    setCount((x) => {
      const q = quantityLambda(x);

      onChange(q);

      return q;
    });
  }

  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <span>{children}</span>
      <div className="flex gap-2">
        <Button
          disabled={disabled(count)}
          size="icon"
          variant="ghost"
          onClick={() => handleSetCustomQuantity((x) => x - 1)}
        >
          <MinusCircle />
        </Button>
        <span className="flex items-center justify-center font-semibold">{count}</span>
        <Button size="icon" variant="ghost" onClick={() => handleSetCustomQuantity((x) => x + 1)}>
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
}
