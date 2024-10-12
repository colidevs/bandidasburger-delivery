import Papa from "papaparse";

import {Ingredient, CsvIngredient, INGREDIENTS} from "./"; // Importa la interfaz Ingredient desde donde la hayas definido

function isRequired(tipo: string): boolean {
  return tipo === "Pan" || tipo === "Medallon";
}

export default {
  fetch: async (): Promise<Ingredient[]> => {
    const ingredientsUrl = process.env.NEXT_PUBLIC_INGREDIENTS; // Asegúrate de tener esta variable de entorno

    if (!ingredientsUrl) {
      throw new Error("INGREDIENTS environment variable is not defined");
    }

    const response = await fetch(ingredientsUrl, {next: {tags: ["ingredients"]}});

    const text = await response.text();

    const csv = text.split("\n").join("\n");

    const {data} = Papa.parse(csv, {header: true});

    const ingredientsCsv = data as CsvIngredient[];

    const ingredients = ingredientsCsv
      .map((row: CsvIngredient) => {
        const obj = {
          type: row.tipo,
          name: row.nombre,
          price: parseFloat(row.precio.replace(/[$,]/g, "")), // Convierte el precio a número
          required: isRequired(row.tipo), // Asegúrate de definir required y switchable
          max: parseInt(row.max, 10), // Asegúrate de convertir max a número
          active: row.activo.toLowerCase() === "si",
        };

        return obj;
      })
      .filter((ingredient) => ingredient.active);

    return ingredients;
  },
  mock: {
    fetch: (): Promise<Ingredient[]> => {
      // Puedes usar algún JSON local o datos de prueba aquí en caso de no usar una URL
      return Promise.resolve(INGREDIENTS);
    },
  },
};
