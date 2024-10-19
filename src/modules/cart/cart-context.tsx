"use client";

import type {Cart, CartItem} from "./types";

import {createContext, useCallback, useContext, useMemo, useState} from "react";

import {type Store} from "../store";

import {Button} from "@/components/ui/button";
import {Sheet, SheetContent, SheetFooter, SheetHeader} from "@/components/ui/sheet";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";

interface OrderDetails {
  paymentMethod: "Efectivo" | "MercadoPago";
  address: string;
  customerName: string;
  cashAmount: number;
  totalAmount: number;
}
interface Context {
  staticValues: {
    store: Store;
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

export function CartProviderClient({children, store}: {children: React.ReactNode; store: Store}) {
  const [cart, setCart] = useState<Cart>(() => new Map());
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const cartList = useMemo(() => Array.from(cart), [cart]);

  const total = useMemo(
    () => Array.from(cart.values()).reduce((acc, i) => acc + i.quantity * i.price, 0),
    [cart],
  );
  const quantity = useMemo(
    () => Array.from(cart.values()).reduce((acc, i) => acc + i.quantity, 0),
    [cart],
  );

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

  const staticValues: Context["staticValues"] = {store: store};
  const state = useMemo(
    () => ({cart, cartList, total, quantity}),
    [cart, cartList, total, quantity],
  );
  const actions = useMemo(
    () => ({addItem, removeItem, updateItem}),
    [addItem, removeItem, updateItem],
  );

  function generateWhatsAppOrderMessage(
    cartItems: [string, CartItem][],
    orderDetails: OrderDetails,
  ) {
    let message = "*Pedido: {*\n";

    cartItems.forEach(([id, item]) => {
      const {name, quantity, price, productIngredients, subproduct} = item;

      let description = `- ${quantity} ${name}`;

      // Agregar detalles de personalización si los hay
      const customizations = productIngredients
        .filter(
          (ing) =>
            ing.quantity! - ing.deletedQuantity! > 0 && !ing.name.toLowerCase().includes("pan"),
        )
        .map((ing) => {
          if (ing.additionalQuantity! > 0) {
            return `${ing.quantity! + ing.additionalQuantity!} ${ing.name}`;
          } else if (ing.deletedQuantity! > 0) {
            return `${ing.quantity! - ing.deletedQuantity!} ${ing.name}`;
          } else {
            if (ing.quantity === 1) {
              return `${ing.name}`;
            } else {
              return `${ing.quantity} ${ing.name}`;
            }
          }

          return null;
        })
        .filter((detail) => detail !== null);

      // Manejo especial para el pan seleccionado
      const selectedPan = productIngredients.find((ing) => ing.type === "Pan" && ing.isSelected);

      if (selectedPan && selectedPan.name) {
        customizations.push(`${selectedPan.name}`);
      }

      if (customizations.length > 0) {
        description += ` : ${customizations.join(", ")}`;
      }

      // Añadir ingredientes que se han eliminado
      const nonIng = productIngredients
        .filter(
          (ing) =>
            (!ing.isSelected && !ing.required && ing.name) ||
            ing.quantity! - ing.deletedQuantity! <= 0,
        )
        .map((ing) => ing.name);

      if (nonIng.length > 0) {
        description += ` (sin ${nonIng.join(", ")})`;
      }

      if (subproduct) {
        description += `\n[Guarnicion: ${subproduct.name}]`;
      }

      description += ` > $${price * quantity}`;
      message += `${description}\n\n`;
    });

    message = message.replace(/\n$/, "");
    message += `}\n\n*Datos:*\n`;
    message += `Forma de pago: ${orderDetails.paymentMethod}\n`;
    message += `Dirección de envío: ${orderDetails.address || "No especificada"}\n`;

    if (orderDetails.paymentMethod.toLowerCase() === "efectivo") {
      message += `Con cuánto abonás: $${orderDetails.cashAmount || "No especificado"}\n`;
    }

    message += `Pedido a nombre de: ${orderDetails.customerName || "No especificado"}\n`;

    message += `\n`;
    message += `*Total (incluye envío): $${orderDetails.totalAmount}*\n`;

    if (orderDetails.paymentMethod.toLowerCase() === "efectivo") {
      const change = orderDetails.cashAmount - orderDetails.totalAmount;

      message += `Vuelto: $${change > 0 ? change : 0}\n`;
    }

    return message;
  }

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "MercadoPago">("MercadoPago");
  const [cashAmount, setCashAmount] = useState(0);
  const [customerName, setCustomerName] = useState("");

  function Checkout() {
    const msg = generateWhatsAppOrderMessage(cartList, {
      paymentMethod: paymentMethod,
      address: address,
      customerName: customerName,
      cashAmount: cashAmount,
      totalAmount: total + store.shipping,
    });

    const wpp = `https://wa.me/${store.phone}?text=${encodeURIComponent(msg)}`;

    window.open(wpp, "_blank");
  }

  return (
    <CartContext.Provider value={{staticValues, state, actions}}>
      <>
        {children}
        {Boolean(quantity) && (
          <div className="sticky bottom-0 flex content-center items-center pb-4 sm:m-auto">
            <Button
              aria-label="Ver pedido"
              className="m-auto w-full bg-muted px-4 shadow-lg sm:w-fit"
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
                <p className="leading-6">$ {total}</p>
              </div>
            </Button>
          </div>
        )}
        {isCartOpen ? (
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent className="flex h-full w-full flex-col px-0 sm:pt-0">
              <ScrollArea className="flex-grow overflow-y-auto px-4">
                <SheetHeader>
                  <div className="mt-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Tu pedido</h2>
                  </div>
                </SheetHeader>
                <Order />
                <Separator />
                <section className="mt-4 flex flex-col gap-4">
                  <h3 className="text-lg font-semibold">Detalles del pedido</h3>
                  <RadioGroup
                    defaultValue="MercadoPago"
                    onValueChange={(e) => setPaymentMethod(e as "Efectivo" | "MercadoPago")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="r1" value="MercadoPago" />
                      <Label htmlFor="r1">MercadoPago</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="r2" value="Efectivo" />
                      <Label htmlFor="r2">Efectivo</Label>
                    </div>
                  </RadioGroup>

                  <Input
                    placeholder="Nombre"
                    type="text"
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    id="address"
                    placeholder="Direccion"
                    type="text"
                    onChange={(e) => setAddress(e.target.value)}
                  />
                  <Input
                    placeholder="Con cuanto abonas?"
                    type="number"
                    onChange={(e) => setCashAmount(parseInt(e.target.value))}
                  />
                </section>
              </ScrollArea>
              <footer className="sticky bottom-0 space-y-4 border-t bg-background">
                <div className="flex items-center justify-between px-4 pt-4">
                  <p className="text-lg font-semibold">Total (incluye envío)</p>
                  <p className="text-lg font-semibold">$ {total + store.shipping}</p>
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
      <ul className="divide-y divide-muted">
        {cartList.map(([id, item]) => (
          <li key={id} className="flex flex-col gap-2 py-4">
            <div className="ml-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-row">
                  <p className="text-lg font-semibold">
                    {item.name}: ${item.price}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  aria-label="Eliminar"
                  className="p-2"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    removeItem(id);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>

            {/* Mostrar los ingredientes adicionales */}
            {item.productIngredients && item.productIngredients.length > 0 ? (
              <div className="ml-1 w-full text-sm text-muted-foreground">
                {/* Ingredientes modificados */}
                {item.productIngredients.some(
                  (ing) =>
                    ing.additionalQuantity! !== 0 ||
                    ing.deletedQuantity! !== 0 ||
                    (!ing.isSelected && !ing.required),
                ) && <p className="font-semibold">Modificaciones:</p>}

                <ul className="pl-4">
                  {item.productIngredients
                    .filter(
                      (ing) =>
                        ing.additionalQuantity! !== 0 ||
                        ing.deletedQuantity! !== 0 ||
                        (!ing.isSelected && !ing.required),
                    )
                    .map((ing) => {
                      // Si el ingrediente está eliminado completamente
                      if (!ing.isSelected && !ing.required) {
                        return (
                          <li key={ing.name} className="before:mr-2 before:content-['•']">
                            Sin {ing.name}
                          </li>
                        );
                      }

                      // Si la cantidad modificada resulta en cero, mostramos "Sin [nombre del ingrediente]"
                      if (ing.quantity! - ing.deletedQuantity! <= 0) {
                        return (
                          <li key={ing.name} className="before:mr-2 before:content-['•']">
                            Sin {ing.name}
                          </li>
                        );
                      }

                      // Mostrar ingredientes añadidos o restados
                      if (ing.additionalQuantity! > 0) {
                        return (
                          <li key={ing.name} className="flex justify-between">
                            <span className="before:mr-2 before:content-['•']">
                              +{ing.additionalQuantity} {ing.name}
                            </span>
                            <span className="pr-3">+ ${ing.price * ing.additionalQuantity!}</span>
                          </li>
                        );
                      } else {
                        return (
                          <li key={ing.name} className="flex justify-between">
                            <span className="before:mr-2 before:content-['•']">
                              -{Math.abs(ing.deletedQuantity!)} {ing.name}
                            </span>
                            {/* No mostramos el precio si se eliminó cantidad */}
                          </li>
                        );
                      }
                    })}
                </ul>
                {/* Mostrar subproducto si fue modificado */}
                <li key="subproduct" className="flex justify-between">
                  <p className="pt-2 font-semibold">{item.subproduct?.name}</p>
                  {item.subproduct !== undefined && item.subproduct?.price !== 0 ? (
                    <p className="pr-3 pt-2 font-semibold">+ ${item.subproduct?.price}</p>
                  ) : null}
                </li>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
