"use client";

import type {Cart, CartItem} from "./types";

import {createContext, useCallback, useContext, useMemo, useState} from "react";

import {STORE} from "../store";

import {Button} from "@/components/ui/button";

interface Context {
  state: {
    cart: Cart;
    cartList: [string, CartItem][];
    total: number;
    quantity: number;
  };
  actions: {
    addItem: (id: string, value: CartItem) => void;
    removeItem: (id: string) => void;
    updateItem: (id: string, value: CartItem) => void;
  };
}

const CartContext = createContext({} as Context);

export function CartProviderClient({children}: {children: React.ReactNode}) {
  const [cart, setCart] = useState<Cart>(() => new Map());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartList = useMemo(() => Array.from(cart), [cart]);

  const total = useMemo(
    () =>
      Array.from(cart.values()).reduce((acc, i) => acc + i.quantity * i.price, 0) + STORE.shipping,
    [cart],
  );
  const quantity = useMemo(
    () => Array.from(cart.values()).reduce((acc, i) => acc + i.quantity, 0),
    [cart],
  );

  const addItem = useCallback(
    // (id: string, value: CartItem) => {
    //   cart.set(id, value);

    //   setCart(new Map(cart));
    (id: string, value: CartItem) => {
      // Encontrar un producto con el mismo nombre y los mismos ingredientes
      const existingEntry = Array.from(cart.entries()).find(
        ([, item]) =>
          item.name === value.name &&
          JSON.stringify(item.productIngredients) === JSON.stringify(value.productIngredients),
      );

      if (existingEntry) {
        // Si hay un producto idéntico, actualizar su cantidad
        const [existingId, existingItem] = existingEntry;

        cart.set(existingId, {...existingItem, quantity: existingItem.quantity + value.quantity});
      } else {
        // Si no hay un producto idéntico, agregarlo como nuevo ítem
        cart.set(id, value);
      }

      setCart(new Map(cart));
    },
    [cart],
  );

  const removeItem = useCallback(
    (id: string) => {
      cart.delete(id);

      setCart(new Map(cart));
    },
    [cart],
  );

  const updateItem = useCallback(
    (id: string, value: CartItem) => {
      cart.set(id, value);

      setCart(new Map(cart));
    },
    [cart],
  );

  const state = useMemo(
    () => ({cart, cartList, total, quantity}),
    [cart, cartList, total, quantity],
  );
  const actions = useMemo(
    () => ({addItem, removeItem, updateItem}),
    [addItem, removeItem, updateItem],
  );

  return (
    <CartContext.Provider value={{state, actions}}>
      <>
        {children}
        {Boolean(quantity) && (
          <div className="sticky bottom-0 flex content-center items-center pb-4 sm:m-auto">
            <Button
              aria-label="Ver pedido"
              className="m-auto w-full px-4 shadow-lg sm:w-fit"
              data-testid="show-cart"
              size="lg"
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCartOpen(true);
              }}
            >
              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="leading-6">Ver pedido</p>
                  <p className="rounded-sm bg-black/25 px-2 py-1 text-xs font-semibold text-white/90">
                    {quantity} item
                  </p>
                </div>
                <p className="leading-6">{total}</p>
              </div>
            </Button>
          </div>
        )}
      </>
    </CartContext.Provider>
  );
}

export function useCart(): [Context["state"], Context["actions"]] {
  const {state, actions} = useContext(CartContext);

  return [state, actions];
}
