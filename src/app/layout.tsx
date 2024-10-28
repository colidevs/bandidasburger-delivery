import type {Metadata} from "next";

import {FaInstagram, FaWhatsapp} from "react-icons/fa";

import {StoreApi} from "@/modules/store";
import {ProductsApi} from "@/modules/product";
import {CartProviderClient} from "@/modules/cart";
import "./globals.css";
import {cn} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bandidas Burger",
  description: "Bandidas Burger",
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const store = await StoreApi.fetch();
  const defaultProducts = await ProductsApi.fetch();

  return (
    <html lang="en">
      <body className="bg-background">
        <div className="font-sans container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] bg-background antialiased">
          <header className="text-xl font-bold leading-[4rem]">
            <div
              className={cn(
                "to-#21040c flex h-40 w-full items-center justify-center overflow-hidden rounded bg-gradient-to-r from-[#460315] sm:h-52 lg:h-64",
              )}
            >
              {/* <img
                alt="Banner de Bandidas Burger"
                className="inset-0 h-full w-full object-contain"
                src={store.banner}
              /> */}
              <p
                className="select-none font-bleedingCowboys text-2xl text-[#ff9a21] sm:text-4xl md:text-5xl lg:text-7xl"
                style={{textShadow: "black 10px 0 10px"}}
              >
                LAS MAS RICAS DE ZONA SUR
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
              <div className="-mt-12 rounded-full sm:-mt-14 lg:-mt-16">
                <img
                  alt="Avatar de Bandidas Burger"
                  className="h-32 rounded-full sm:h-44"
                  src={store.logo}
                />
              </div>
              <div className="flex flex-col items-center gap-4 text-center sm:mt-2 sm:items-start sm:gap-2 sm:text-left lg:gap-2">
                <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:gap-2 sm:text-left lg:gap-1">
                  <h2 className="text-3xl font-bold sm:text-4xl">{store.name}</h2>
                  <p className="font-normal leading-tight text-muted-foreground">
                    {store.description}
                  </p>
                </div>
                <div className="mt-1 flex gap-2">
                  <a
                    aria-label="Instagram"
                    href={store.instagram}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex h-10 w-10 items-center justify-start rounded-full bg-transparent text-white">
                      <FaInstagram size={24} />
                    </div>
                  </a>
                  <a
                    aria-label="WhatsApp"
                    href={store.whatsapp}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <div className="flex h-10 w-10 items-center justify-start rounded-full bg-transparent text-white">
                      <FaWhatsapp size={24} />
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </header>
          <main className="pt-8">
            <CartProviderClient defaultProducts={defaultProducts} store={store}>
              {children}
            </CartProviderClient>
          </main>
          <footer className="text-center leading-[4rem] opacity-70">
            © {new Date().getFullYear()} colidevs. Todos los derechos reservados.
          </footer>
        </div>
      </body>
    </html>
  );
}
