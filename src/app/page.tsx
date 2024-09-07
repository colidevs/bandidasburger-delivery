"use client";

import {PRODUCTS} from "@/modules/product";
import {useCart, type CartItem} from "@/modules/cart";

export default function HomePage() {
  //* DISCARD `_` Cuando no usamos algo de lo que se nos esta proveyendo, es una forma estandar de decir ignorar
  const [_, {addItem}] = useCart();

  function handleClick(id: string, cartItem: CartItem) {
    addItem(id, cartItem);
  }

  return (
    <section>
      <ul className="flex flex-col gap-8">
        {PRODUCTS.map(({id, category, title, description, image, price}) => (
          <li key={id} className="border">
            <div
              onClick={() =>
                handleClick(crypto.randomUUID(), {
                  id: id,
                  title: title,
                  category: category,
                  description: description,
                  image: image,
                  price: price,
                  quantity: 1,
                })
              }
            >
              <h3>{title}</h3>
              <p>{description}</p>
              <img alt={"imagen de " + title} src={image} />
              <p>{price}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
