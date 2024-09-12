"use client";

import {useState} from "react";

import {PRODUCTS, type Product} from "@/modules/product";
import {useCart, type CartItem} from "@/modules/cart";
import {Button} from "@/components/ui/button";
import {STORE_DATA} from "@/modules/store";

export default function HomePage() {
  //* DISCARD `_` Cuando no usamos algo de lo que se nos esta proveyendo, es una forma estandar de decir ignorar
  const [{cart, cartList, total}, {addItem, removeItem, updateItem}] = useCart();
  const [selected, setSelected] = useState<Product>();

  function handleClick(product: Product) {
    addItem(crypto.randomUUID(), {...product, quantity: 1});
    setSelected(product);
  }

  function handleRemoveItem(id: string, oldCartItem: CartItem) {
    if (oldCartItem.quantity == 1) removeItem(id);
    else {
      const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity - 1};

      updateItem(id, newItem);
    }
  }

  function handleaddItem(id: string, oldCartItem: CartItem) {
    const newItem: CartItem = {...oldCartItem, quantity: oldCartItem.quantity + 1};

    addItem(id, newItem);
  }

  function handleOrderProducts() {
    const products = cartList.map((burga) => burga[1]);

    console.log(products);

    const mensaje =
      `*Pedido:*\n` +
      products
        .map((burga) => {
          return `*${burga.title} (${burga.quantity}) - ${burga.quantity * burga.price}`;
        })
        .join("\n") +
      `\n\n--\n\n*Datos:*
* Forma de pago: Efectivo
* Dirección de envío: Los Naranjos 93
* Con cuanto abonas: $20.000* Pedido a nombre de: Federico Di Napoli\n\n--\n\n*Total: $${total}*
*Vuelto: $${20000 - total}*`;

    console.log(mensaje);

    const whatsappUrl = `https://wa.me/${STORE_DATA.phone}?text=${encodeURIComponent(mensaje)}`;

    window.open(whatsappUrl, "_blank");
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
                    <Button onClick={() => handleaddItem(cartId, product)}>+</Button>
                  </li>
                ))}
              </ul>
            </article>
          ) : (
            <p>No hay productos</p>
          )}
        </div>
        <button onClick={() => handleOrderProducts()}>Finalizar Pedido </button>
      </aside>
    </section>
  );
}
