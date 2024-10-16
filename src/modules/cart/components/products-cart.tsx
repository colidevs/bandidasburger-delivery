"use client";
import {useEffect, useRef, useState} from "react";
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

type ChangeType = "checkbox" | "select" | "counter";

type OnChangeType = {ingredient: Ingredient; changeType: ChangeType; value: number | Ingredient};

export function ProductsCart({products, ingredients, className, itemClassName}: ProductsCartProps) {
  const [{store}, {cart, cartList, quantity, total}, {addItem, removeItem, updateItem}] = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const {customPrice, setCustomPrice} = useCustomPrice();
  const [open, setOpen] = useState<boolean>(false);

  const [subtotals, setSubtotals] = useState<{[key: string]: number}>({});
  const [modifiedProduct, setModifiedProduct] = useState<Product | null>(null);
  const [defaultPan, setDefaultPan] = useState<Ingredient | null>(null);

  function addToCart(product: Product | null, quantity: number) {
    if (!product) {
      alert("No se ha seleccionado un producto");

      return;
    }

    addItem(crypto.randomUUID(), {...product, quantity: quantity});
  }

  function handleOnClickItem(selectedProduct: Product) {
    setProduct(selectedProduct);
    setCustomPrice(selectedProduct.price);
    setSubtotals({});

    // Iniciamos el producto modificado con la copia del producto original
    setModifiedProduct({
      ...selectedProduct,
      productIngredients: selectedProduct.productIngredients.map((ingredient) => ({
        ...ingredient,
        additionalQuantity: 0, // Añadimos un campo para las cantidades adicionales
        isSelected: true, // Añadimos un campo para saber si el ingrediente está seleccionado
      })),
    });

    // Guardamos el pan por defecto para hacer comparaciones más tarde
    const defaultBun = selectedProduct.productIngredients.find((ing) => ing.type === "Pan");

    setDefaultPan(defaultBun!);
  }

  function handleClose(onClose?: () => void) {
    setOpen(false);
    setCustomQuantity(1);

    if (onClose) {
      onClose();
    }
  }

  function handleIngredientsPrice({ingredient, changeType, value}: OnChangeType) {
    // if (!modifiedProduct) return;
    // const baseQuantity = ingredient.quantity!;
    // setSubtotals((prev) => {
    //   const updatedSubtotals = {...prev};
    //   // Si la cantidad es mayor a la base, calculamos el subtotal del ingrediente
    //   if (quantity > baseQuantity) {
    //     const additionalQuantity = quantity - baseQuantity;
    //     updatedSubtotals[ingredient.name] = ingredient.price * additionalQuantity;
    //   } else {
    //     // Si la cantidad es igual o menor a la base, eliminamos el subtotal del ingrediente
    //     delete updatedSubtotals[ingredient.name];
    //   }
    //   // Recalculamos el precio personalizado considerando el subtotal multiplicado por la cantidad de productos
    //   const additionalPrice = Object.values(updatedSubtotals).reduce(
    //     (acc, subtotal) => acc + subtotal,
    //     0,
    //   );
    //   setCustomPrice(product!.price * customQuantity + additionalPrice * customQuantity);
    //   // Actualizamos el producto modificado para reflejar los cambios en los ingredientes
    //   setModifiedProduct((prevProduct) => {
    //     if (!prevProduct) return null;
    //     return {
    //       ...prevProduct,
    //       productIngredients: prevProduct.productIngredients.map((ing) =>
    //         ing.name === ingredient.name
    //           ? {
    //               ...ing,
    //               additionalQuantity: quantity > baseQuantity ? quantity - baseQuantity : 0,
    //             }
    //           : ing,
    //       ),
    //     };
    //   });
    //   return updatedSubtotals;
    // });

    if (!modifiedProduct) return;

    setModifiedProduct((prevProduct) => {
      if (!prevProduct) return null;

      return {
        ...prevProduct,
        productIngredients: prevProduct.productIngredients.map((ing) => {
          if (ing.name === ingredient.name) {
            if (changeType === "counter") {
              // Actualizar cantidad adicional
              return {
                ...ing,
                additionalQuantity:
                  Number(value) > ing.quantity! ? Number(value) - ing.quantity! : 0,
              };
            } else if (changeType === "checkbox") {
              // Actualizar si el ingrediente está seleccionado
              return {
                ...ing,
                isSelected: Boolean(value),
              };
            } else if (changeType === "select") {
              // Actualizar el nombre del ingrediente seleccionado
              // const a = value as Ingredient;

              // return {
              //   ...a,
              // };

              const selectedIngredient = value as Ingredient;

              if (
                defaultPan &&
                selectedIngredient.name === defaultPan.name &&
                selectedIngredient.price === defaultPan.price
              ) {
                // Si el pan es el mismo que el por defecto, no hacemos cambios en el precio
                return {
                  ...selectedIngredient,
                  isSelected: true,
                };
              }

              // Si el pan es diferente, lo reemplazamos
              return {
                ...selectedIngredient,
                isSelected: true,
              };
            }
          }

          return ing;
        }),
      };
    });

    // Recalcular el precio personalizado
    // setCustomPrice(() => {
    //   const basePrice = product!.price * customQuantity;
    //   let additionalPrice = 0;

    //   modifiedProduct?.productIngredients.forEach((ing) => {
    //     if (ing.additionalQuantity! > 0) {
    //       additionalPrice += ing.additionalQuantity! * ing.price;
    //     } else if (ing.isSelected && ing.price > 0) {
    //       additionalPrice += ing.price;
    //     }
    //   });

    //   return basePrice + additionalPrice * customQuantity;
    // });

    // setCustomPrice(() => {
    //   const basePrice = product!.price * customQuantity;
    //   let additionalPrice = 0;

    //   modifiedProduct?.productIngredients.forEach((ing) => {
    //     // Sumar precios adicionales según el tipo de cambio

    //     if (ing.type === "Pan") {
    //       console.log("PAN: ", ing);

    //       return;
    //     }

    //     if (ing.additionalQuantity! > 0) {
    //       console.log("SUMA: ", ing);
    //       additionalPrice += ing.additionalQuantity! * ing.price;
    //     } else if (ing.isSelected && !ing.required && ing.price > 0) {
    //       console.log("ADD: ", ing);
    //       additionalPrice += ing.price;
    //     }

    //     console.log("PRICE: ", additionalPrice);
    //   });

    //   const panPrice = modifiedProduct?.productIngredients.find((ing) => ing.type === "Pan")?.price;

    //   if (panPrice) {
    //     additionalPrice += panPrice;
    //   }

    //   return basePrice + additionalPrice * customQuantity;
    // });

    // setSubtotals((prevSubtotals) => {
    //   const updatedSubtotals = {...prevSubtotals};

    //   if (changeType === "counter") {
    //     // Si el ingrediente tiene cantidad adicional
    //     if (value > ingredient.quantity!) {
    //       const additionalQuantity = value - ingredient.quantity!;

    //       updatedSubtotals[ingredient.name] = ingredient.price * additionalQuantity;
    //     } else {
    //       delete updatedSubtotals[ingredient.name];
    //     }
    //   } else if (changeType === "checkbox") {
    //     // Si es un checkbox, agregar o quitar según esté seleccionado
    //     if (Boolean(value)) {
    //       updatedSubtotals[ingredient.name] = ingredient.price;
    //     } else {
    //       delete updatedSubtotals[ingredient.name];
    //     }
    //   } else if (changeType === "select") {
    //     // Si es un select, actualizar el subtotal con el nuevo ingrediente seleccionado
    //     const selectedIngredient = value as Ingredient;

    //     updatedSubtotals[selectedIngredient.name] = selectedIngredient.price;
    //   }

    //   // Actualizar el precio personalizado usando los subtotales
    //   const additionalPrice = Object.values(updatedSubtotals).reduce(
    //     (acc, subtotal) => acc + subtotal,
    //     0,
    //   );

    //   setCustomPrice(product!.price * customQuantity + additionalPrice * customQuantity);

    //   return updatedSubtotals;
    // });
    setSubtotals((prevSubtotals) => {
      const updatedSubtotals = {...prevSubtotals};

      if (changeType === "counter") {
        if (Number(value) > ingredient.quantity!) {
          const additionalQuantity = Number(value) - ingredient.quantity!;

          updatedSubtotals[ingredient.name] = ingredient.price * additionalQuantity;
        } else {
          delete updatedSubtotals[ingredient.name];
        }
      } else if (changeType === "checkbox") {
        if (Boolean(value)) {
          updatedSubtotals[ingredient.name] = ingredient.price;
        } else {
          delete updatedSubtotals[ingredient.name];
        }
      } else if (changeType === "select") {
        const selectedIngredient = value as Ingredient;

        if (
          defaultPan &&
          selectedIngredient.name === defaultPan.name &&
          selectedIngredient.price === defaultPan.price
        ) {
          // Si el pan es igual al pan por defecto, no se cambia el subtotal
          delete updatedSubtotals[selectedIngredient.name];
        } else {
          updatedSubtotals[selectedIngredient.name] = selectedIngredient.price;
        }
      }

      // Recalcular el precio personalizado usando los subtotales
      const additionalPrice = Object.values(updatedSubtotals).reduce(
        (acc, subtotal) => acc + subtotal,
        0,
      );

      setCustomPrice(product!.price * customQuantity + additionalPrice * customQuantity);

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
              Hamburguesas (todas vienen con papas!)
            </h2>
            <Products
              className={cn(className, "grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3")}
              itemClassName={cn(itemClassName, "min-w-[250px]")}
              products={burgers}
              onClick={handleOnClickItem}
            />
          </div>
          <div className="w-full">
            <h2 className="mb-8 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Guarniciones
            </h2>
            <Products
              className={cn(className, "grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3")}
              itemClassName={cn(itemClassName, "min-w-[250px]")}
              products={others}
              onClick={handleOnClickItem}
            />
          </div>
        </div>
      </SheetTrigger>
      <SheetContent className="flex h-full w-full flex-col px-0 sm:pt-0">
        <ScrollArea className="flex-grow overflow-y-auto px-4">
          {/* <SheetHeader className="px-4 pb-4">
            <img
              alt=""
              className="aspect-square max-h-64 max-w-64 rounded-md object-cover object-center sm:max-h-none sm:max-w-none"
              src={product?.image}
            />
            <SheetTitle className="text-start">{product?.name}</SheetTitle>
            <SheetDescription>{product?.description}</SheetDescription>
          </SheetHeader> */}
          <SheetHeader className="flex flex-col items-center px-4 pb-4 ">
            <img
              alt=""
              className="max-h-42 aspect-square max-w-64 rounded-md object-cover object-center"
              src={product?.image}
            />
            <SheetTitle className="w-full text-left">{product?.name}</SheetTitle>
            <SheetDescription className="text-left">{product?.description}</SheetDescription>
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
          <div className="flex gap-2 px-4 pt-4">
            <Button variant="outline" onClick={() => handleClose()}>
              Cancelar
            </Button>
            <Button
              className="flex flex-1 justify-between"
              onClick={() =>
                handleClose(() =>
                  addToCart(
                    {
                      ...modifiedProduct,
                      price: customPrice,
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
  onChange?: (evt: OnChangeType) => void;
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
                    onChange={onChange}
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
  onChange?: (evt: OnChangeType) => void;
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
      <CheckboxIngredient
        key={ingredient.name}
        className={className}
        ingredient={ingredient}
        onChange={(value) => onChange({ingredient, changeType: "checkbox", value})}
      />
    );
  }

  if (type === "Pan") {
    const list = source.filter((item) => item.type === "Pan");

    return (
      <SelectIngredient
        className={cn(className)}
        ingredient={ingredient}
        list={list}
        onChange={(value) => onChange({ingredient, changeType: "select", value})}
      />
    );
  }

  if (type === "Medallon") {
    const list = source.filter((item) => item.type === "Medallon");

    return (
      <div className="flex w-full">
        <SelectIngredient
          className={cn(className)}
          ingredient={ingredient}
          list={list}
          onChange={(value) => onChange({ingredient, changeType: "select", value})}
        />
        <Counter
          className="w-fit"
          disabled={(value) => value === 0}
          disabledMax={(value) => value === ingredient.max}
          value={ingredientFromProduct?.quantity ?? 1}
          onChange={(value) => onChange({ingredient, changeType: "counter", value})}
        />
      </div>
    );
  }

  if (type === "Topping") {
    if (ingredient.max <= 1) {
      return (
        <CheckboxIngredient
          className={className}
          ingredient={ingredient}
          onChange={(value) => onChange({ingredient, changeType: "checkbox", value})}
        />
      );
    }

    return (
      <Counter
        disabled={(value) => value === 0}
        disabledMax={(value) => value === ingredient.max}
        value={ingredientFromProduct?.quantity ?? 1}
        onChange={(value) => onChange({ingredient, changeType: "counter", value})}
      >
        {ingredient.name}
      </Counter>
    );
  }

  return null;
}

type SelectIngredientProps = {
  ingredient: Ingredient;
  onChange?: (value: Ingredient) => void;
  list: Ingredient[];
  className?: string;
};

function SelectIngredient({
  ingredient,
  list,
  className,
  onChange = () => {},
}: SelectIngredientProps) {
  const amount = list.length;

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(ingredient);

  function handleOnChange(value: string) {
    const selectedIngredient = list.find((item) => item.name === value);

    if (selectedIngredient) {
      console.log("SELECTED: ", selectedIngredient);

      onChange(selectedIngredient);
      setSelectedIngredient(selectedIngredient);
    }
  }

  return (
    <Select value={selectedIngredient.name} onValueChange={handleOnChange}>
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
  onChange?: (value: number) => void;
};

function CheckboxIngredient({ingredient, className, onChange = () => {}}: CheckboxIngredientProps) {
  function handleOnChange(checked: boolean) {
    onChange(checked ? 1 : 0);
  }

  return (
    <div className={cn("space-x-3", className)}>
      <Checkbox defaultChecked id={ingredient.name} onCheckedChange={handleOnChange} />
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
  disabledMax?: (value: number) => boolean;
  className?: string;
  children?: React.ReactNode;
};

function Counter({
  onChange = () => {},
  value = 1,
  disabled = (value) => value === 1,
  disabledMax = (value) => value >= 10,
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
        <Button
          disabled={disabledMax(count)}
          size="icon"
          variant="ghost"
          onClick={() => handleSetCustomQuantity((x) => x + 1)}
        >
          <PlusCircle />
        </Button>
      </div>
    </div>
  );
}
