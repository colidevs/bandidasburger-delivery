import Papa from "papaparse";

import {Ingredient, CsvIngredient, INGREDIENTS} from "./"; // Importa la interfaz Ingredient desde donde la hayas definido

export default {
  fetch: async (): Promise<Ingredient[]> => {
    const ingredientsUrl = process.env.NEXT_PUBLIC_INGREDIENTS; // Asegúrate de tener esta variable de entorno

    if (!ingredientsUrl) {
      throw new Error("INGREDIENTS environment variable is not defined");
    }

    return fetch(ingredientsUrl, {next: {tags: ["ingredients"]}}).then(async (response) => {
      const csv = await response.text();

      return new Promise<Ingredient[]>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            // Aquí realizamos la aserción de tipo usando 'as CsvIngredient[]' para indicarle a TypeScript que los datos tienen el formato CsvIngredient
            const ingredients = (results.data as CsvIngredient[])
              .map((row: CsvIngredient) => ({
                type: row.tipo,
                name: row.nombre,
                addPrice: parseFloat(row["precio-adicional"].replace(/[$,]/g, "")), // Convierte el precio a número
                max: parseInt(row.max, 10), // Asegúrate de convertir max a número
                active: row.activo.toLowerCase() === "si", // Convierte "si" y "no" a booleano
              }))
              .filter((ingredient) => ingredient.active);

            resolve(ingredients as Ingredient[]);
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<Ingredient[]> => {
      // Puedes usar algún JSON local o datos de prueba aquí en caso de no usar una URL
      return Promise.resolve(INGREDIENTS);
    },
  },
};
