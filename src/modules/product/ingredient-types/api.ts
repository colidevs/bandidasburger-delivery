import Papa from "papaparse";

import {IngredientType, CsvIngredientType, INGREDIENT_TYPES} from "./";

export default {
  fetch: async (): Promise<IngredientType[]> => {
    const productTypesUrl = process.env.NEXT_PUBLIC_INGREDIENTS_TYPES;

    if (!productTypesUrl) {
      throw new Error("PRODUCTS_TYPES environment variable is not defined");
    }

    return fetch(productTypesUrl, {next: {tags: ["productTypes"]}}).then(async (response) => {
      const csv = await response.text();

      return new Promise<IngredientType[]>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            // Aquí realizamos la aserción de tipo usando 'as CsvIngredient[]' para indicarle a TypeScript que los datos tienen el formato CsvIngredient
            const productTypes = (results.data as CsvIngredientType[])
              .map((row: CsvIngredientType) => ({
                name: row.nombre,
                required: row.requerido.toLowerCase() === "si",
                switchable: row.intercambiable.toLowerCase() === "si",
                active: row.activo.toLowerCase() === "si",
              }))
              .filter((ingredientType) => ingredientType.active);

            resolve(productTypes as IngredientType[]);
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<IngredientType[]> => {
      // Puedes usar algún JSON local o datos de prueba aquí en caso de no usar una URL
      return Promise.resolve(INGREDIENT_TYPES);
    },
  },
};
