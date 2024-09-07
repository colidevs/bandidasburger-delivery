"use client";

import {stringify} from "querystring";

import {useState} from "react";

import {PRODUCTS, type Product} from "@/modules/product";
import {useCart, type CartItem} from "@/modules/cart";
import {Button} from "@/components/ui/button";

export default function HomePage() {
  //* DISCARD `_` Cuando no usamos algo de lo que se nos esta proveyendo, es una forma estandar de decir ignorar
  const [{cart, cartList}, {addItem, removeItem, updateItem}] = useCart();
  const [selected, setSelected] = useState<Product>();

  function handleClick(product: Product) {
    addItem(crypto.randomUUID(), {...product, quantity: 1});
    setSelected(product);
  }

  function handleRemoveItem(id: string, oldCartItem: CartItem) {
    const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity - 1};

    updateItem(id, newItem);
  }

  return (
    <section className="flex gap-6">
      <ul className="flex flex-1 flex-col gap-8">
        {PRODUCTS.map((product) => (
          <li key={product.id} className="border">
            <div className="flex justify-between" onClick={() => handleClick(product)}>
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
                </li>
              ))}
            </ul>
          </article>
        ) : (
          <p>No hay productos</p>
        )}
      </aside>
    </section>
  );
}
