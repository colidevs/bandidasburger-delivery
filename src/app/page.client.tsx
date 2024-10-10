"use client";

import {useState} from "react";

import {Product} from "@/modules/product";
import {Ingredient} from "@/modules/product/ingredients";
import {IngredientType} from "@/modules/product/ingredient-types";
import {ProductType} from "@/modules/product/product-types";
import {useCart, type CartItem} from "@/modules/cart";
import {Button} from "@/components/ui/button";
import {Store} from "@/modules/store";
import {Subproduct} from "@/modules/product/subproducts";

type HomePageClientProps = {
  storeData: Store;
  ingredientData: Ingredient[];
  productData: Product[];
  ingredientTypesData: IngredientType[];
  productTypesData: ProductType[];
  subproductsData: Subproduct[];
};

export default function HomePageClient({
  storeData,
  ingredientData,
  productData,
  ingredientTypesData,
  productTypesData,
  subproductsData,
}: HomePageClientProps) {
  //* Variables y estados
  const [{cart, cartList, total}, {addItem, removeItem, updateItem}] = useCart();
  const [products, setProducts] = useState<Product[]>(productData);
  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const [defaultSelectedProduct, setDefaultSelectedProduct] = useState<Product>();
  const [store, setStore] = useState<Store>(storeData);
  const [ingredients, setIngredients] = useState<Ingredient[]>(ingredientData);
  const [productQuantity, setQuantity] = useState(1); // Estado para el contador de cantidad
  const [currentPrice, setCurrentPrice] = useState(0); // Estado para el precio total dinámico del producto

  // Nuevos estados para eliminar los errores
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [lastPaymentAmount, setLastPaymentAmount] = useState<string>("");
  const [direction, setDirection] = useState<string>("");
  const [orderOwner, setOrderOwner] = useState<string>("");
  const [paymentAmountPlaceholder, setPaymentAmountPlaceholder] = useState<string>(
    "Ingresa con cuánto abonas",
  );

  const increaseQuantity = () => setQuantity((prev) => (prev < 5 ? prev + 1 : prev));
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  function handleClickItem(product: Product) {
    setSelectedProduct({...product});
    setDefaultSelectedProduct({...product});
    setCurrentPrice(product.price);
  }

  function calculateTotalPrice() {
    if (!selectedProduct || !defaultSelectedProduct) return;

    let total = defaultSelectedProduct.price;

    selectedProduct.productIngredients?.forEach((ingredient) => {
      const defaultIngredient = defaultSelectedProduct.productIngredients?.find(
        (i) => i.name === ingredient.name,
      );
      const ingredientData = ingredients.find((i) => i.name === ingredient.name);

      if (ingredientData && defaultIngredient) {
        const additionalQuantity = ingredient.quantity - defaultIngredient.quantity;

        if (additionalQuantity > 0) {
          total += additionalQuantity * ingredientData.addPrice;
        }
      }
    });

    if (selectedProduct.subproduct !== defaultSelectedProduct.subproduct) {
      const selectedSubproduct = subproductsData.find(
        (subproduct) => subproduct.name === selectedProduct.subproduct,
      );

      if (selectedSubproduct) {
        total += selectedSubproduct.price;
      }
    }

    setCurrentPrice(total);
  }

  function handleAddItem(id: string, oldCartItem: CartItem) {
    const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity + 1};

    updateItem(id, newItem);
  }

  function handleAddProducToCart() {
    if (selectedProduct) {
      addItem(crypto.randomUUID(), {...selectedProduct, quantity: productQuantity});
      setQuantity(1);
    }
  }

  function handleRemoveItem(id: string, oldCartItem: CartItem) {
    if (oldCartItem.quantity === 1) {
      removeItem(id);
    } else {
      const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity - 1};

      updateItem(id, newItem);
    }
  }

  function handleIngredientQuantityChange(name: string, newQuantity: number) {
    if (selectedProduct) {
      const updatedIngredients = selectedProduct.productIngredients?.map((ingredient) =>
        ingredient.name === name ? {...ingredient, quantity: newQuantity} : ingredient,
      );

      setSelectedProduct({
        ...selectedProduct,
        productIngredients: updatedIngredients,
      });

      calculateTotalPrice();
    }
  }

  // Al cambiar el subproducto, recalcular el precio total
  function handleSubproductChange(newSubproduct: string) {
    if (selectedProduct) {
      setSelectedProduct((prevProduct) => {
        const updatedProduct = prevProduct
          ? {...prevProduct, subproduct: newSubproduct}
          : prevProduct;

        calculateTotalPrice();

        return updatedProduct;
      });
    }
  }

  function getIngredientQuantity(name: string) {
    if (!selectedProduct) return 0;
    const ingredient = selectedProduct.productIngredients?.find((i) => i.name === name);

    return ingredient ? ingredient.quantity : 0;
  }

  function handlePaymentMethodChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const selectedPaymentMethod = evt.target.value;

    if (selectedPaymentMethod === "Mercado Pago") {
      setPaymentAmountPlaceholder("Solo efectivo");
      setLastPaymentAmount(paymentAmount);
      setPaymentAmount("");
    } else {
      setPaymentAmount(lastPaymentAmount || "");
      setPaymentAmountPlaceholder("Ingresa con cuánto abonas");
    }
    setPaymentMethod(selectedPaymentMethod);
  }

  function handlePaymentAmountChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const value = evt.target.value;

    if (/^\d*$/.test(value)) {
      setPaymentAmount(value);
    }
  }

  function handleDirectionChanged(evt: React.ChangeEvent<HTMLInputElement>) {
    setDirection(evt.target.value);
  }

  function handleOrderOwnerChanged(evt: React.ChangeEvent<HTMLInputElement>) {
    setOrderOwner(evt.target.value);
  }

  function handleOrderProducts() {
    const products = cartList.map((burga) => burga[1]);
    let mensaje;

    if (
      (paymentMethod === "Efectivo" || paymentMethod === "Mercado Pago") &&
      direction &&
      orderOwner &&
      (paymentMethod === "Efectivo" ? paymentAmount && Number(paymentAmount) > total : true)
    ) {
      if (paymentMethod === "Efectivo") {
        mensaje =
          `*Pedido:*\n` +
          products
            .map((burga) => {
              return `*${burga.name} (${burga.quantity}) - ${burga.quantity * burga.price}`;
            })
            .join("\n") +
          `\n\n--\n\n*Datos:*\n* Forma de pago: ${paymentMethod}\n* Con cuanto abonas: ${paymentAmount}\n* Dirección de envío: ${direction}\n* Pedido a nombre de: ${orderOwner}\n\n--\n\n*Total (envío incluido): $${total}*\n*Vuelto: $${Number(paymentAmount) - total}*`;
      } else {
        mensaje =
          `*Pedido:*\n` +
          products
            .map((burga) => {
              return `*${burga.name} (${burga.quantity}) - ${burga.quantity * burga.price}`;
            })
            .join("\n") +
          `\n\n--\n\n*Datos:*\n* Forma de pago: ${paymentMethod}\n* Dirección de envío: ${direction}\n* Pedido a nombre de: ${orderOwner}\n\n--\n\n*Total (envío incluido): $${total}*`;
      }

      console.log(mensaje);
    }
  }

  function formatCartIngredientName(name, quantity) {
    if (name.toLowerCase().startsWith("medallon")) {
      if (quantity === 1) return "Medallon de 150gr";
      if (quantity === 2) return "Doble medallon de 110gr";
      if (quantity === 3) return "Triple medallon de 110gr";
      if (quantity === 4) return "Cuadruple medallon de 110gr";
      if (quantity === 5) return "Quintuple medallon de 110gr";
      if (quantity === 6) return "Sextuple medallon de 110gr";
      if (quantity === 7) return "Septuple medallon de 110gr";
      if (quantity === 8) return "Octuple medallon de 110gr";

      return `${quantity} medallones de 110gr`;
    }

    if (name.toLowerCase().startsWith("feta")) {
      const ingredientName = name.slice(5).trim();

      return quantity === 1
        ? `${quantity} feta de ${ingredientName}`
        : quantity > 1
          ? `${quantity} fetas de ${ingredientName}`
          : `Sin fetas de ${ingredientName}`;
    }

    if (name.toLowerCase().startsWith("medida")) {
      return quantity === 1
        ? `${quantity} medida de bacon`
        : quantity > 1
          ? `${quantity} medidas de bacon`
          : `Sin medidas de bacon`;
    }

    if (name.toLowerCase().startsWith("pan")) {
      return name; // Solo muestra el nombre del pan sin la cantidad
    }

    // Si quantity es 0, mostrar "Sin [nombre]"
    if (quantity === 0) {
      return `Sin ${name}`;
    }

    return `${quantity} ${name}`;
  }

  return (
    <section className="flex gap-6">
      <ul className="flex flex-1 flex-col gap-8">
        {products.map((product) => (
          <li key={product.name} className="border">
            <div className="flex justify-between" onClick={() => handleClickItem(product)}>
              <div className="flex flex-col">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <p>{product.price}</p>
              </div>
              <img alt={"imagen de " + product.name} src={product.image} width={144} />
            </div>
          </li>
        ))}
      </ul>
      <aside className="w-4xl border p-8">
        {cart.size !== 0 ? (
          <article>
            <h2>Carrito!</h2>
            <ul className="flex flex-col gap-4">
              {cartList.map(([cartId, product]) => {
                const defaultProduct = products.find((p) => p.name === product.name);

                // Compara los ingredientes del producto actual con los de la versión original
                const isCustomized =
                  defaultProduct &&
                  product.productIngredients?.some((ingredient) => {
                    const defaultIngredient = defaultProduct.productIngredients?.find(
                      (i) => i.name === ingredient.name,
                    );

                    // Considera una personalización si el nombre o la cantidad es diferente
                    return (
                      !defaultIngredient ||
                      ingredient.quantity !== defaultIngredient.quantity ||
                      ingredient.name !== defaultIngredient.name
                    );
                  });

                return (
                  <li key={cartId} className="border p-2">
                    <p>{product.name}</p>

                    {isCustomized ? (
                      <>
                        <p>Personalización:</p>
                        <ul>
                          {product.productIngredients?.map((ingredient) => {
                            const defaultIngredient = defaultProduct?.productIngredients?.find(
                              (i) => i.name === ingredient.name,
                            );

                            // Muestra solo ingredientes personalizados
                            if (
                              !defaultIngredient ||
                              ingredient.quantity !== defaultIngredient.quantity ||
                              ingredient.name !== defaultIngredient.name
                            ) {
                              return (
                                <li key={ingredient.name}>
                                  {formatCartIngredientName(ingredient.name, ingredient.quantity)}
                                </li>
                              );
                            }

                            return null;
                          })}
                        </ul>
                      </>
                    ) : (
                      <p>Cantidad: {product.quantity}</p>
                    )}

                    <Button onClick={() => handleRemoveItem(cartId, product)}>-</Button>
                    <Button onClick={() => handleAddItem(cartId, product)}>+</Button>
                  </li>
                );
              })}
            </ul>
          </article>
        ) : (
          <p>No hay productos</p>
        )}
        <Button onClick={handleOrderProducts}>Finalizar Pedido </Button>
      </aside>
      {selectedProduct ? (
        <div className="border p-4">
          <h2 className="text-xl font-semibold">Editando: {selectedProduct.name}</h2>
          <p className="text-wrap ">{selectedProduct.description}</p>

          {selectedProduct.productIngredients && selectedProduct.productIngredients.length > 0 ? (
            <div className="mt-2">
              <h4 className="text-md font-semibold">Ingredientes</h4>
              {selectedProduct.productIngredients.map((ingredient) => {
                const ingredientData = ingredients.find((i) => i.name === ingredient.name);

                if (!ingredientData) return null;

                return (
                  <div key={ingredient.name} className="mt-2 flex items-center justify-between">
                    {(() => {
                      const fullIngredient = ingredients.find((i) => i.name === ingredient.name);

                      if (!fullIngredient) return null;

                      const ingredientType = ingredientTypesData.find(
                        (type) => type.name === fullIngredient.type,
                      );

                      if (!ingredientType) return null;

                      const isRequired = ingredientType.required;
                      const maxQuantity = fullIngredient.max;

                      // Obtener todos los ingredientes activos del mismo tipo
                      const activeIngredientsOfType = ingredients.filter(
                        (i) => i.type === fullIngredient.type && i.active,
                      );

                      // Caso: Dropdown para `required === true` y `max === 1` (e.g., Panes) y múltiples ingredientes activos
                      if (isRequired && maxQuantity === 1 && activeIngredientsOfType.length > 1) {
                        return (
                          <div className="flex w-full items-center gap-4">
                            <p className="font-medium">{fullIngredient.type}</p>
                            <select
                              className="w-full rounded-md border border-gray-400 bg-gray-200 px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={ingredient.name}
                              onChange={(e) => {
                                const newName = e.target.value;

                                handleIngredientQuantityChange(newName, 1);

                                setSelectedProduct((prevProduct) => {
                                  if (!prevProduct) return null;
                                  const updatedIngredients = prevProduct.productIngredients?.map(
                                    (ing) =>
                                      ing.name === ingredient.name ? {...ing, name: newName} : ing,
                                  );

                                  return {...prevProduct, productIngredients: updatedIngredients};
                                });
                              }}
                            >
                              {activeIngredientsOfType.map((option) => (
                                <option key={option.name} value={option.name}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      }

                      // Caso: Dropdown con contador para `required === true` y `max > 1` (e.g., Medallones) y múltiples ingredientes activos
                      if (isRequired && maxQuantity > 1 && activeIngredientsOfType.length > 1) {
                        return (
                          <div className="flex w-full items-center gap-4">
                            <p className="font-medium">{fullIngredient.type}</p>
                            <select
                              className="w-full rounded-md border border-gray-400 bg-gray-200 px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={ingredient.name}
                              onChange={(e) => {
                                const newName = e.target.value;

                                handleIngredientQuantityChange(newName, ingredient.quantity);

                                setSelectedProduct((prevProduct) => {
                                  if (!prevProduct) return null;
                                  const updatedIngredients = prevProduct.productIngredients?.map(
                                    (ing) =>
                                      ing.name === ingredient.name ? {...ing, name: newName} : ing,
                                  );

                                  return {...prevProduct, productIngredients: updatedIngredients};
                                });
                              }}
                            >
                              {activeIngredientsOfType.map((option) => (
                                <option key={option.name} value={option.name}>
                                  {option.name}
                                </option>
                              ))}
                            </select>
                            <div className="flex items-center space-x-1">
                              <Button
                                className="bg-red-500 px-2 py-1 text-white"
                                onClick={() =>
                                  handleIngredientQuantityChange(
                                    ingredient.name,
                                    Math.max(1, ingredient.quantity - 1), // No permite bajar a 0 si `required === true`
                                  )
                                }
                              >
                                -
                              </Button>
                              <span>{ingredient.quantity}</span>
                              <Button
                                className="bg-green-500 px-2 py-1 text-white"
                                onClick={() =>
                                  handleIngredientQuantityChange(
                                    ingredient.name,
                                    Math.min(maxQuantity, ingredient.quantity + 1),
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>
                            {maxQuantity > 1 && (
                              <span className="text-gray-500">+${fullIngredient.addPrice} c/u</span>
                            )}
                          </div>
                        );
                      }

                      // Caso: Checkbox para `required !== true` y `max === 1` (Toppings)
                      if (!isRequired && maxQuantity === 1) {
                        return (
                          <div className="flex items-center gap-2">
                            <input
                              checked={ingredient.quantity > 0}
                              type="checkbox"
                              onChange={(e) =>
                                handleIngredientQuantityChange(
                                  ingredient.name,
                                  e.target.checked ? 1 : 0,
                                )
                              }
                            />
                            <span>{fullIngredient.name}</span>
                          </div>
                        );
                      }

                      // Caso: Contador para otros ingredientes que no cumplen con las condiciones anteriores
                      return (
                        <div className="flex items-center gap-2">
                          <span>{fullIngredient.name}</span>
                          <div className="flex items-center space-x-1">
                            <Button
                              className="bg-red-500 px-2 py-1 text-white"
                              onClick={() =>
                                handleIngredientQuantityChange(
                                  ingredient.name,
                                  isRequired
                                    ? Math.max(1, ingredient.quantity - 1)
                                    : Math.max(0, ingredient.quantity - 1), // Si es `required`, no permite bajar a 0
                                )
                              }
                            >
                              -
                            </Button>
                            <span>{ingredient.quantity}</span>
                            <Button
                              className="bg-green-500 px-2 py-1 text-white"
                              onClick={() =>
                                handleIngredientQuantityChange(
                                  ingredient.name,
                                  Math.min(maxQuantity, ingredient.quantity + 1),
                                )
                              }
                            >
                              +
                            </Button>
                          </div>
                          {maxQuantity > 1 && (
                            <span className="text-gray-500">+${fullIngredient.addPrice} c/u</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          ) : null}

          {selectedProduct.subproduct ? (
            <div className="mt-4">
              <p className="font-semibold">El combo viene con guarnición incluida!</p>
              <div className="mt-2">
                {subproductsData
                  .filter((subproduct) => subproduct.active)
                  .map((subproduct) => (
                    <label key={subproduct.name} className="flex items-center gap-2">
                      <input
                        checked={selectedProduct.subproduct === subproduct.name}
                        name="subproduct"
                        type="radio"
                        value={subproduct.name}
                        onChange={() => {
                          setSelectedProduct((prevProduct) =>
                            prevProduct
                              ? {...prevProduct, subproduct: subproduct.name}
                              : prevProduct,
                          );
                        }}
                      />
                      <span>
                        {subproduct.name}
                        {/* Muestra el precio solo si es mayor a cero */}
                        {subproduct.price > 0 && ` - $${subproduct.price}`}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          ) : null}

          <Button onClick={handleAddProducToCart}>Agregar al carrito</Button>
          <Button onClick={decreaseQuantity}>-</Button>
          <span style={{margin: "0 10px"}}>{productQuantity}</span>
          <Button onClick={increaseQuantity}>+</Button>
        </div>
      ) : null}
    </section>
  );
}
