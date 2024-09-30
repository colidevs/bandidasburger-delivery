"use client";

import {useState} from "react";

import {PRODUCTS, type Product} from "@/modules/product";
import {useCart, type CartItem} from "@/modules/cart";
import {Button} from "@/components/ui/button";

export default function HomePage() {
  //* DISCARD `_` Cuando no usamos algo de lo que se nos esta proveyendo, es una forma estandar de decir ignorar
  const [{cart, cartList, total}, {addItem, removeItem, updateItem}] = useCart();
  const [selected, setSelected] = useState<Product>();
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const [paymentAmount, setPaymentAmount] = useState<string>();
  const [lastPaymentAmount, setLastPaymentAmount] = useState<string>();
  const [direction, setDirection] = useState<string>();
  const [orderOwner, setOrderOwner] = useState<string>();
  const [paymentAmountPlaceholder, setPaymentAmountPlaceholder] = useState<string>(
    "Ingresa con cuánto abonas",
  );

  function handleClickItem(product: Product) {
    addItem(crypto.randomUUID(), {...product, quantity: 1});
    setSelected(product);
  }

  function handleAddItem(id: string, oldCartItem: CartItem) {
    const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity + 1};

    addItem(id, newItem);
  }

  function handleRemoveItem(id: string, oldCartItem: CartItem) {
    if (oldCartItem.quantity == 1) removeItem(id);
    else {
      const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity - 1};

      updateItem(id, newItem);
    }
  }

  function handlePaymentMethodChange(evt: React.ChangeEvent<HTMLInputElement>) {
    if (evt.target.value === "Mercado Pago") {
      setPaymentAmountPlaceholder("Solo efectivo");
      setLastPaymentAmount(paymentAmount);
      setPaymentAmount(undefined);
    } else {
      setPaymentAmount(lastPaymentAmount);
      if (lastPaymentAmount !== "0" && lastPaymentAmount !== undefined) {
        setPaymentAmountPlaceholder(lastPaymentAmount?.toString());
      } else {
        setPaymentAmountPlaceholder("Ingresa con cuánto abonas");
      }
    }

    setPaymentMethod(evt.target.value);
  }

  function handlePaymentAmountChange(evt: React.ChangeEvent<HTMLInputElement>) {
    const value = evt.target.value;

    if (/^\d*$/.test(value)) setPaymentAmount(value === "" ? "" : value);
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
      direction !== null &&
      direction !== undefined &&
      direction !== "" &&
      orderOwner !== null &&
      orderOwner !== undefined &&
      orderOwner !== "" &&
      (paymentMethod === "Efectivo"
        ? paymentAmount === "0"
          ? false
          : paymentAmount === undefined
            ? false
            : Number(paymentAmount) <= total
              ? false
              : true
        : Number(paymentAmount) <= total
          ? false
          : true)
    ) {
      if (paymentMethod === "Efectivo") {
        mensaje =
          `*Pedido:*\n` +
          products
            .map((burga) => {
              return `*${burga.title} (${burga.quantity}) - ${burga.quantity * burga.price}`;
            })
            .join("\n") +
          `\n\n--\n\n*Datos:*
* Forma de pago: ${paymentMethod}
* Con cuanto abonas: ${paymentAmount}
* Dirección de envío: ${direction}
* Pedido a nombre de: ${orderOwner}\n\n--\n\n*Total (envío incluido): $${total}*
*Vuelto: $${Number(paymentAmount) - total}*`;
      } else {
        mensaje =
          `*Pedido:*\n` +
          products
            .map((burga) => {
              return `*${burga.title} (${burga.quantity}) - ${burga.quantity * burga.price}`;
            })
            .join("\n") +
          `\n\n--\n\n*Datos:*
* Forma de pago: ${paymentMethod}
* Dirección de envío: ${direction}
* Pedido a nombre de: ${orderOwner}\n\n--\n\n*Total (envío incluido): $${total}*`;
      }

      console.log(mensaje);

      // const whatsappUrl = `https://wa.me/${STORE_DATA.phone}?text=${encodeURIComponent(mensaje)}`;
      // window.open(whatsappUrl, "_blank");
    }
  }

  return (
    <section className="flex gap-6">
      <ul className="flex flex-1 flex-col gap-8">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="border">
            <div className="flex justify-between" onClick={() => handleClickItem(product)}>
              <div className="flex flex-col">
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <p>{product.price}</p>
              </div>
              <img alt={"imagen de " + product.title} src={product.image} width={144} />
            </div>
          </li>
        ))}
      </ul>
      <aside className="w-4xl border p-8">
        <div>
          {cart.size !== 0 ? (
            <article>
              <h2>Carrito!</h2>

              <ul className="flex flex-col gap-4">
                {cartList.map(([cartId, product]) => (
                  // ITEM DEL CARRITO

                  <li key={crypto.randomUUID()} className="border p-2">
                    <p>{product.title}</p>
                    <p>{product.quantity}</p>
                    <Button onClick={() => handleRemoveItem(cartId, product)}>-</Button>
                    <Button onClick={() => handleAddItem(cartId, product)}>+</Button>
                  </li>
                ))}
              </ul>
            </article>
          ) : (
            <p>No hay productos</p>
          )}
        </div>
        <Button onClick={() => handleOrderProducts()}>Finalizar Pedido </Button>
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
          <label>
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
            className="rounded border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none"
            placeholder="Ingresa tu dirección"
            type="text"
            onBlur={handleDirectionChanged}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Con cuanto abonas:</p>
          <input
            className="rounded border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none"
            disabled={paymentMethod !== "Efectivo"}
            placeholder={paymentAmount === undefined ? paymentAmountPlaceholder : ""}
            type="text"
            value={paymentAmount === undefined ? "" : paymentAmount}
            onInput={handlePaymentAmountChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium">Pedido a nombre de:</p>
          <input
            className="rounded border border-gray-300 px-4 py-2 text-black focus:border-blue-500 focus:outline-none"
            placeholder="Ingresa tu nombre"
            type="text"
            onBlur={handleOrderOwnerChanged}
          />
        </div>
      </div>
    </section>
  );
}
