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
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Subproduct} from "@/modules/product/subproducts";

type ProductsCartProps = {
  products: Product[];
  ingredients: Ingredient[];
  subproducts: Subproduct[];
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

type OnChangeIngredientType = {
  ingredient: Ingredient;
  changeType: ChangeType;
  value: number | Ingredient;
};

type OnChangeSubproductType = {
  subproducts: Subproduct[];
  changeType: ChangeType;
  value: number | Subproduct;
};

export function ProductsCart({
  products,
  ingredients,
  subproducts,
  className,
  itemClassName,
}: ProductsCartProps) {
  const [{store}, {cart, cartList, quantity, total}, {addItem, removeItem, updateItem}] = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const {customPrice, setCustomPrice} = useCustomPrice();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedSubproduct, setSelectedSubproduct] = useState<Subproduct | null>(null);
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
        deletedQuantity: 0,
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

  function handleSubproductPrice({subproducts, value}: OnChangeSubproductType) {
    const selectedSubproduct = value as Subproduct;

    setSubtotals((prevSubtotals) => {
      const updatedSubtotals = {...prevSubtotals};

      updatedSubtotals["subproduct"] = selectedSubproduct.price;

      const additionalPrice = Object.values(updatedSubtotals).reduce(
        (acc, subtotal) => acc + subtotal,
        0,
      );

      setCustomPrice(product!.price * customQuantity + additionalPrice * customQuantity);

      return updatedSubtotals;
    });
  }

  function handleIngredientsPrice({ingredient, changeType, value}: OnChangeIngredientType) {
    if (!modifiedProduct) return;

    setModifiedProduct((prevProduct) => {
      if (!prevProduct) return null;

      return {
        ...prevProduct,
        productIngredients: prevProduct.productIngredients.map((ing) => {
          if (ing.name === ingredient.name) {
            const additionalQuantity =
              Number(value) > ing.quantity! ? Number(value) - ing.quantity! : 0;
            const deletedQuantity =
              Number(value) < ing.quantity! ? ing.quantity! - Number(value) : 0;

            if (changeType === "counter") {
              return {
                ...ing,
                additionalQuantity,
                deletedQuantity,
              };
            } else if (changeType === "checkbox") {
              // Actualizar si el ingrediente está seleccionado
              return {
                ...ing,
                additionalQuantity,
                deletedQuantity,
                isSelected: Boolean(value),
              };
            } else if (changeType === "select") {
              // Actualizar el nombre del ingrediente seleccionado
              const selectedIngredient = value as Ingredient;

              if (
                defaultPan &&
                selectedIngredient.name === defaultPan.name &&
                selectedIngredient.price === defaultPan.price
              ) {
                // Si el pan es el mismo que el por defecto, no hacemos cambios en el precio
                return {
                  ...selectedIngredient,
                  additionalQuantity,
                  deletedQuantity,
                  isSelected: true,
                };
              }

              // Si el pan es diferente, lo reemplazamos
              return {
                ...selectedIngredient,
                additionalQuantity,
                deletedQuantity,
                isSelected: true,
              };
            }
          }

          return ing;
        }),
      };
    });

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
          (defaultPan &&
            selectedIngredient.name === defaultPan.name &&
            selectedIngredient.price === defaultPan.price) ||
          selectedIngredient.price <= defaultPan!.price
        ) {
          for (const key in updatedSubtotals) {
            delete updatedSubtotals[key]; // Eliminar cada propiedad del objeto
          }

          // Si el pan es igual al pan por defecto, no se cambia el subtotal
        } else {
          for (const key in updatedSubtotals) {
            delete updatedSubtotals[key]; // Eliminar cada propiedad del objeto
          }
          updatedSubtotals[selectedIngredient.name] = selectedIngredient.price - defaultPan!.price;
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

  function updateProductSubproduct(product: Product, subproduct: Subproduct) {
    setModifiedProduct((prevProduct) => {
      if (!prevProduct) return null;

      return {
        ...prevProduct,
        subproduct: subproduct,
      };
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
              Pan={defaultPan}
              allIngredients={ingredients}
              className="flex flex-col gap-4"
              ingredients={product?.productIngredients ?? []}
              itemClassName="px-2"
              product={product!}
              onChange={handleIngredientsPrice}
            />
          </section>
          <section className="px-4 pt-4">
            <SubproductsDrawer
              className="mb-2 flex flex-col gap-4"
              itemClassName="px-2"
              product={product!}
              subProducts={subproducts}
              updateProductSubproduct={updateProductSubproduct}
              onChange={handleSubproductPrice}
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

type SubProductsDrawerProps = {
  product: Product;
  subProducts: Subproduct[];
  className?: string;
  itemClassName?: string;
  onChange?: (evt: OnChangeSubproductType) => void;
  updateProductSubproduct: (product: Product, subproduct: Subproduct) => void;
};

type IngredientsDrawerProps = {
  product: Product;
  Pan?: Ingredient | null;
  ingredients: Ingredient[];
  allIngredients: Ingredient[];
  className?: string;
  itemClassName?: string;
  onChange?: (evt: OnChangeIngredientType) => void;
};

interface IngredientPerCategory {
  [category: string]: Ingredient[];
}

function SubproductsDrawer({
  product,
  subProducts,
  className,
  itemClassName,
  onChange = () => {},
  updateProductSubproduct,
}: SubProductsDrawerProps) {
  const defaultSubproduct = subProducts.reduce((prev, curr) =>
    prev.price < curr.price ? prev : curr,
  );

  const [selectedSubproduct, setSelectedSubproduct] = useState<Subproduct>(defaultSubproduct);

  function handleSubProductChange(selectedSubproduct: string) {
    const selectedSubp = subProducts.find((subp) => subp.name === selectedSubproduct);

    if (selectedSubp) {
      setSelectedSubproduct(selectedSubp);
      // Actualiza el subproducto en el producto principal
      updateProductSubproduct(product, selectedSubp);

      onChange({
        subproducts: subProducts,
        changeType: "select",
        value: selectedSubp,
      });
    }
  }

  if (product.type !== "Hamburguesas") {
    return null;
  }

  return (
    <div className={className}>
      <h4 className="border-b pb-1">Guarnición</h4>
      <RadioGroup
        className="flex flex-col gap-4"
        value={selectedSubproduct.name}
        onValueChange={handleSubProductChange}
      >
        {subProducts.map((subp) => (
          <div key={subp.name} className="flex items-center justify-between space-x-2">
            <div className="flex items-center">
              <RadioGroupItem id={subp.name} value={subp.name} />
              <label className="ml-2 text-sm font-medium" htmlFor={subp.name}>
                {subp.name}
              </label>
            </div>
            <span className="text-sm font-medium">{subp.price > 0 ? `+ $${subp.price}` : ""}</span>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function IngredientsDrawer({
  product,
  ingredients,
  Pan,
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
                    Pan={Pan!}
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
  Pan: Ingredient | null;
  ingredient: Ingredient;
  type: string;
  source: Ingredient[];
  onChange?: (evt: OnChangeIngredientType) => void;
  className?: string;
};

function IngredientDrawer({
  product,
  Pan,
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
        DefaultPan={Pan}
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
      <div className="flex w-full items-center justify-between space-x-2">
        {list.length === 1 ? (
          <div className="flex w-full justify-between">
            <span className={cn(className, "p-0")}>{list[0].name}</span>
            <span className={cn(className, "p-0 text-muted-foreground")}>+${list[0].price}</span>
          </div>
        ) : (
          <SelectIngredient
            className={cn(className)}
            ingredient={ingredient}
            list={list}
            onChange={(value) => onChange({ingredient, changeType: "select", value})}
          />
        )}
        <Counter
          className="w-fit"
          disabled={(value) => value === 1}
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
  DefaultPan?: Ingredient | null;
  ingredient: Ingredient;
  onChange?: (value: Ingredient) => void;
  list: Ingredient[];
  className?: string;
};

function SelectIngredient({
  ingredient,
  DefaultPan,
  list,
  className,
  onChange = () => {},
}: SelectIngredientProps) {
  const amount = list.length;

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient>(ingredient);

  function handleOnChange(value: string) {
    const selectedIngredient = list.find((item) => item.name === value);

    if (selectedIngredient) {
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
              {item.name}
              {item.price !== 0 && item.name !== DefaultPan?.name && item.price > DefaultPan!.price
                ? ` + $${item.price - DefaultPan!.price}`
                : ""}
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
    <div className={cn("flex space-x-3")}>
      <Checkbox
        defaultChecked
        className="self-center"
        id={ingredient.name}
        onCheckedChange={handleOnChange}
      />
      <label htmlFor={ingredient.name}>{ingredient.name}</label>
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
      <div className="flex">
        <Button
          disabled={disabled(count)}
          size="icon"
          variant="ghost"
          onClick={() => handleSetCustomQuantity((x) => x - 1)}
        >
          <MinusCircle />
        </Button>
        <span className="ml-1 mr-1 w-4 items-center justify-center self-center text-center font-semibold">
          {count}
        </span>
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
