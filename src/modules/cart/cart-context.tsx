"use client";

import type {Cart, CartItem} from "./types";

import {createContext, useCallback, useContext, useMemo, useState} from "react";

import {STORE} from "../store";

import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetFooter, SheetHeader} from "@/components/ui/sheet";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";

interface Context {
  staticValues: {
    shipping: number;
  };
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

export function CartProviderClient({
  children,
  shipping,
}: {
  children: React.ReactNode;
  shipping: number;
}) {
  const [cart, setCart] = useState<Cart>(() => new Map());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartList = useMemo(() => Array.from(cart), [cart]);

  const total = useMemo(
    () => Array.from(cart.values()).reduce((acc, i) => acc + i.quantity * i.price, 0) + shipping,
    [cart, shipping],
  );
  const quantity = useMemo(
    () => Array.from(cart.values()).reduce((acc, i) => acc + i.quantity, 0),
    [cart],
  );

  // (id: string, value: CartItem) => {
  //   // Encontrar un producto con el mismo nombre y los mismos ingredientes
  //   const existingEntry = Array.from(cart.entries()).find(
  //     ([, item]) =>
  //       item.name === value.name &&
  //       JSON.stringify(item.productIngredients) === JSON.stringify(value.productIngredients),
  //   );

  //   if (existingEntry) {
  //     // Si hay un producto idéntico, actualizar su cantidad
  //     const [existingId, existingItem] = existingEntry;

  //     cart.set(existingId, {...existingItem, quantity: existingItem.quantity + value.quantity});
  //   } else {
  //     // Si no hay un producto idéntico, agregarlo como nuevo ítem
  //     cart.set(id, value);
  //     setCart(new Map(cart));
  //   }
  const addItem = useCallback(
    (id: string, value: CartItem) => {
      cart.set(id, value);

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

  const staticValues = {shipping};
  const state = useMemo(
    () => ({cart, cartList, total, quantity}),
    [cart, cartList, total, quantity],
  );
  const actions = useMemo(
    () => ({addItem, removeItem, updateItem}),
    [addItem, removeItem, updateItem],
  );

  function Checkout() {
    console.log(cartList);
  }

  return (
    <CartContext.Provider value={{staticValues, state, actions}}>
      <>
        {children}
        {Boolean(quantity) && (
          <div className="sticky bottom-0 flex content-center items-center bg-background pb-4 sm:m-auto">
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
        {isCartOpen ? (
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="flex h-full w-full flex-col px-0 sm:pt-0">
              <SheetHeader>
                <div className="mt-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Tu pedido</h2>
                </div>
              </SheetHeader>

              <Order />

              <footer className="sticky bottom-0 space-y-4 border-t bg-background">
                <div className="flex items-center justify-between px-4 pt-4">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-lg font-semibold">$ {total}</p>
                </div>
                <Separator />
                <div className="flex gap-2 px-4">
                  <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="flex flex-1 justify-center" onClick={Checkout}>
                    <span>Confirmar pedido</span>
                  </Button>
                </div>
              </footer>
            </SheetContent>
          </Sheet>
        ) : null}
      </>
    </CartContext.Provider>
  );
}

export function useCart(): [Context["staticValues"], Context["state"], Context["actions"]] {
  const {staticValues, state, actions} = useContext(CartContext);

  return [staticValues, state, actions];
}

function Order() {
  const [{}, {cartList}, {removeItem}] = useCart();

  return (
    <section>
      <ul className="divide-y divide-gray-200">
        {cartList.map(([id, item]) => (
          <li key={id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img alt={item.name} className="h-12 w-12 rounded-sm object-cover" src={item.image} />
              <div className="flex flex-col">
                <p className="text-lg font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x {item.price}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                aria-label="Eliminar"
                className="p-2"
                size="sm"
                variant="ghost"
                onClick={() => {
                  removeItem(id);
                }}
              >
                Eliminar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
