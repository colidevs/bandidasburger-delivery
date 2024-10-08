import Papa from "papaparse";

import {Product, CsvProduct} from "./types";
import {PRODUCTS} from "./product";

function parseGoogleDriveLink(link: string): string {
  //! LINK STANDAR
  //https://drive.google.com/file/d/1jbgmjfOU9QJdmzdJtgkAQa4iSagsreH5/view?usp=drive_link

  // ante este caso uasr split
  //https://drive.google.com/uc?export=view&id=11BLFAfOJ1C4uhrlRf4xfx1dcIBtOmgUc

  const match = link.match(/\/d\/(.*?)\//);

  if (match && match[1]) {
    return `https://lh3.google.com/u/0/d/${match[1]}=w1920-h925-iv1`;
  } else {
    return "";
  }
}

export default {
  fetch: async (): Promise<Product[]> => {
    const productsUrl = process.env.NEXT_PUBLIC_PRODUCTS;

    if (!productsUrl) {
      throw new Error("PRODUCTS environment variable is not defined");
    }

    return fetch(productsUrl, {next: {tags: ["products"]}}).then(async (response) => {
      let csv = await response.text();

      csv = csv.split("\n").slice(1).join("\n");

      return new Promise<Product[]>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              // Eliminar la primera fila de resultados
              //results.data.shift();
              const products = (results.data as CsvProduct[]).map((row: CsvProduct) => {
                const productIngredients: {name: string; quantity: number}[] = [];

                // Recolectar dinámicamente los ingredientes y cantidades del CSV
                for (let i = 0; i <= 9; i++) {
                  const ingredientKey = i === 0 ? "ingrediente" : `ingrediente_${i}`;
                  const quantityKey = i === 0 ? "cantidad" : `cantidad_${i}`;
                  const ingredientName = row[ingredientKey as keyof CsvProduct];
                  const ingredientQuantity = row[quantityKey as keyof CsvProduct];

                  if (
                    typeof ingredientName === "string" &&
                    ingredientName.trim() !== "" &&
                    typeof ingredientQuantity === "string" &&
                    ingredientQuantity.trim() !== ""
                  ) {
                    productIngredients.push({
                      name: ingredientName,
                      quantity: parseInt(ingredientQuantity, 10),
                    });
                  }
                }
                // Validar precio antes de usar `replace`
                const priceString =
                  typeof row.precio === "string" ? row.precio.replace(/[$,]/g, "") : "0";
                const price = parseFloat(priceString);
                // Validar si el campo 'activo' está definido antes de aplicar 'toLowerCase'
                const isActive =
                  typeof row.activo === "string" ? row.activo.toLowerCase() === "si" : false;
                const product: Product = {
                  type: row.tipo || "",
                  name: row.nombre || "",
                  description: row.descripcion || "",
                  customDescription: row["descripcion personalizada"] || "",
                  image: parseGoogleDriveLink(row.imagen) || "",
                  image: parseGoogleDriveLink(row.imagen) || "",
                  price,
                  active: isActive,
                  productIngredients:
                    productIngredients.length > 0 ? productIngredients : undefined,
                };

                return product;
              });

              resolve(products);
            } catch (error) {
              reject(error);
            }
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<Product[]> => {
      return Promise.resolve(PRODUCTS);
    },
  },
};
