import Papa from "papaparse";

import {ProductType, CsvProductType, PRODUCT_TYPES} from "./";

export default {
  fetch: async (): Promise<ProductType[]> => {
    const productTypesUrl = process.env.NEXT_PUBLIC_PRODUCTS_TYPES;

    if (!productTypesUrl) {
      throw new Error("PRODUCTS_TYPES environment variable is not defined");
    }

    return fetch(productTypesUrl, {next: {tags: ["productTypes"]}}).then(async (response) => {
      const csv = await response.text();

      return new Promise<ProductType[]>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            // Aquí realizamos la aserción de tipo usando 'as CsvIngredient[]' para indicarle a TypeScript que los datos tienen el formato CsvIngredient
            const productTypes = (results.data as CsvProductType[]).map((row: CsvProductType) => ({
              name: row.nombre,
              active: row.activo.toLowerCase() === "si",
            }));

            resolve(productTypes as ProductType[]);
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<ProductType[]> => {
      // Puedes usar algún JSON local o datos de prueba aquí en caso de no usar una URL
      return Promise.resolve(PRODUCT_TYPES);
    },
  },
};
