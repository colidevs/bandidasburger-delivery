"use client";

import {useState, useEffect} from "react";

import {productApi, type Product} from "@/modules/product";
import {IngredientsApi, type Ingredient} from "@/modules/product/ingredients";
import {useCart, type CartItem} from "@/modules/cart";
import {Button} from "@/components/ui/button";
import {storeApi, type Store} from "@/modules/store";

export default function HomePage() {
  //* Variables y estados
  const [{cart, cartList, total}, {addItem, removeItem, updateItem}] = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null);
  const [selectedProductIngredients, setSelectedProductIngredients] = useState<
    {name: string; quantity: number}[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [paymentAmount, setPaymentAmount] = useState<string>();
  const [lastPaymentAmount, setLastPaymentAmount] = useState<string>();
  const [direction, setDirection] = useState<string>();
  const [orderOwner, setOrderOwner] = useState<string>();
  const [paymentAmountPlaceholder, setPaymentAmountPlaceholder] = useState<string>(
    "Ingresa con cuánto abonas",
  );
  const [shippingCost, setShippingCost] = useState<number>(350); // Costo de envío fijo

  // useEffect para cargar las APIs al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storeData = await storeApi.fetch();

        setStore(storeData);
      } catch (error) {
        console.error("Error fetching store data:", error);
      }

      try {
        const ingredientData = await IngredientsApi.fetch();

        setIngredients(ingredientData);
      } catch (error) {
        console.error("Error fetching ingredient data:", error);
      }

      try {
        const productData = await productApi.fetch();

        setProducts(productData);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchData();
  }, []);

  function handleClickItem(product: Product) {
    console.log("Selected product:", product);
    addItem(crypto.randomUUID(), {...product, quantity: 1});
    setSelectedProduct(product);

    const ingredients = product.productIngredients || [];

    setSelectedProductIngredients(ingredients);
  }

  function handleAddItem(id: string, oldCartItem: CartItem) {
    const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity + 1};

    updateItem(id, newItem);
  }

  function handleRemoveItem(id: string, oldCartItem: CartItem) {
    if (oldCartItem.quantity === 1) {
      removeItem(id);
    } else {
      const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity - 1};

      updateItem(id, newItem);
    }
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

  function handleIngredientQuantityChange(name: string, newQuantity: number) {
    const updatedIngredients = selectedProductIngredients.map((ingredient) =>
      ingredient.name === name ? {...ingredient, quantity: newQuantity} : ingredient,
    );

    setSelectedProductIngredients(updatedIngredients);
  }

  function getIngredientQuantity(name: string) {
    const ingredient = selectedProductIngredients.find((i) => i.name === name);

    return ingredient ? ingredient.quantity : 0;
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

      // if (store?.whatsapp) {
      //   const whatsappUrl = `${store.whatsapp}?text=${encodeURIComponent(mensaje)}`;

      //   window.open(whatsappUrl, "_blank");
      // }
    }
  }

  return (
    <section className="flex gap-6">
      <ul className="flex flex-1 flex-col gap-8">
        {products.map((product) => (
          <li key={product.name} className="border">
            <div className="flex justify-between" onClick={() => handleClickItem(product)}>
              <div className="flex flex-col">
                <h3>{product.name}</h3>
                <p>{product.customDescription}</p>
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
              {cartList.map(([cartId, product]) => (
                <li key={cartId} className="border p-2">
                  <p>{product.name}</p>
                  <p>{product.quantity}</p>
                  <Button onClick={() => handleRemoveItem(cartId, product)}>-</Button>
                  <Button onClick={() => handleAddItem(cartId, product)}>+</Button>
                </li>
              ))}
            </ul>
            <p>
              Total (con envío): $
              {cartList.reduce((sum, [_, product]) => sum + product.price * product.quantity, 0) +
                shippingCost}
            </p>
          </article>
        ) : (
          <p>No hay productos</p>
        )}
        <Button onClick={handleOrderProducts}>Finalizar Pedido </Button>
      </aside>
      <div className="flex flex-col gap-2">
        <div className="fmt-4">
          <p className="text-lg font-medium">Método de pago:</p>
          <label className="flex items-center">
            <input
              checked={paymentMethod === "Efectivo"}
              className="mr-2"
              type="radio"
              value="Efectivo"
              onChange={handlePaymentMethodChange}
            />
            Efectivo
          </label>
          <label className="flex items-center">
            <input
              checked={paymentMethod === "Mercado Pago"}
              className="mr-2"
              type="radio"
              value="Mercado Pago"
              onChange={handlePaymentMethodChange}
            />
            Mercado Pago
          </label>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Dirección:</p>
          <input
            className="rounded border border-gray-300 px-2 py-1"
            placeholder="Ingresa la dirección de envío"
            type="text"
            value={direction}
            onChange={handleDirectionChanged}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Pedido a nombre de:</p>
          <input
            className="rounded border border-gray-300 px-2 py-1"
            placeholder="Ingresa el nombre para el pedido"
            type="text"
            value={orderOwner}
            onChange={handleOrderOwnerChanged}
          />
        </div>
        {paymentMethod === "Efectivo" && (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">Monto recibido:</p>
            <input
              className="rounded border border-gray-300 px-2 py-1"
              placeholder={paymentAmountPlaceholder}
              type="text"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
            />
          </div>
        )}
      </div>

      {selectedProduct ? (
        <div className="border p-4">
          <h2 className="text-xl font-semibold">Editando: {selectedProduct.name}</h2>
          <p>{selectedProduct.customDescription}</p>

          {/* Verificar si hay ingredientes antes de mostrar la sección */}
          {selectedProductIngredients.length > 0 && (
            <div className="mt-2">
              <h4 className="text-md font-semibold">Ingredientes</h4>
              {selectedProductIngredients.map((ingredient) => {
                const ingredientData = ingredients?.find((i) => i.name === ingredient.name);

                if (!ingredientData) return null;

                const quantity = getIngredientQuantity(ingredient.name);

                return (
                  <div key={ingredient.name} className="mt-2 flex items-center justify-between">
                    <span>{ingredient.name}</span>
                    <Button
                      className="bg-red-500 px-2 py-1 text-white"
                      onClick={() =>
                        handleIngredientQuantityChange(ingredient.name, Math.max(0, quantity - 1))
                      }
                    >
                      -
                    </Button>
                    <span>{quantity}</span>
                    <Button
                      className="bg-green-500 px-2 py-1 text-white"
                      onClick={() =>
                        handleIngredientQuantityChange(
                          ingredient.name,
                          Math.min(ingredientData.max, quantity + 1),
                        )
                      }
                    >
                      +
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
