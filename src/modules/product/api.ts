import {BlobOptions} from "buffer";

import Papa from "papaparse";

import {Product, CsvProduct} from "./types";
import {PRODUCTS} from "./product";
import {Ingredient, IngredientsApi} from "./ingredients";

function parseGoogleDriveLink(link: string): string {
  const match = link.match(/\/d\/(.*?)\//);

  return match && match[1] ? `https://lh3.google.com/u/0/d/${match[1]}=w1920-h925-iv1` : "";
}

function formatIngredientName(name: string, quantity: number): string {
  if (name.toLowerCase().startsWith("medallon")) {
    if (quantity === 1) {
      return "Medallon de 150gr";
    } else if (quantity === 2) {
      return `Doble medallon de 110gr`;
    } else if (quantity === 3) {
      return `Triple medallon de 110gr`;
    } else if (quantity === 4) {
      return `Cuadruple medallon de 110gr`;
    } else if (quantity === 5) {
      return `Quintuple medallon de 110gr`;
    } else if (quantity === 6) {
      return `Sextuple medallon de 110gr`;
    } else if (quantity === 7) {
      return `Septuple medallon de 110gr`;
    } else if (quantity === 8) {
      return `Octuple medallon de 110gr`;
    } else if (quantity > 8) {
      return `${quantity} medallones de 110gr`;
    }
  }

  if (name.toLowerCase().startsWith("feta")) {
    const ingredientName = name.slice(5).trim(); // Extrae el nombre después de "feta"

    if (quantity === 1) return `${quantity} feta de ${ingredientName}`;

    return `${quantity} fetas de ${ingredientName}`;
  }

  if (name.toLowerCase().startsWith("medida")) {
    if (quantity === 1) return `${quantity} medida de bacon`;
    else return `${quantity} medidas de bacon`;
  }

  return name;
}

export default {
  fetch: async (): Promise<Product[]> => {
    const productsUrl = process.env.NEXT_PUBLIC_PRODUCTS;

    if (!productsUrl) {
      throw new Error("PRODUCTS environment variable is not defined");
    }

    const ingredients = await IngredientsApi.fetch();

    const response = await fetch(productsUrl, {next: {tags: ["products"]}});

    const text = await response.text();

    const csv = text.split("\n").slice(1).join("\n");

    const {data} = Papa.parse(csv, {header: true, skipEmptyLines: true});
    const csvProducts = data as CsvProduct[];

    const products = csvProducts
      .map((row: CsvProduct) => {
        const productIngredientsCsv: {name: string; quantity: number}[] = [];

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
            productIngredientsCsv.push({
              name: ingredientName,
              quantity: parseInt(ingredientQuantity, 10),
            });
          }
        }

        // Mover el pan al final de la lista de ingredientes
        const sortedIngredients = [
          ...productIngredientsCsv.filter((ing) => !ing.name.toLowerCase().includes("pan")),
          ...productIngredientsCsv.filter((ing) => ing.name.toLowerCase().includes("pan")),
        ];

        // Crear una descripción formateada a partir de los ingredientes
        const formattedDescription = sortedIngredients
          .map((ingredient) => formatIngredientName(ingredient.name, ingredient.quantity))
          .join(" - ");

        const description: string =
          row["descripcion personalizada"] || formattedDescription || row.descripcion || "";

        const priceString: string =
          typeof row.precio === "string" ? row.precio.replace(/[$,]/g, "") : "0";
        const price: number = parseFloat(priceString);
        const isActive: boolean =
          typeof row.activo === "string" ? row.activo.toLowerCase() === "si" : false;

        const productIngredients: Ingredient[] = sortedIngredients.map((ingredient) => {
          const ingredientData: Ingredient | undefined = ingredients.find(
            (ing) => ing.name === ingredient.name,
          );

          if (!ingredientData) {
            return {active: false} as Ingredient;
          }

          const quantity = ingredient.quantity;

          return {
            ...ingredientData,
            quantity,
            name: formatIngredientName(ingredientData.name, quantity),
          };
        });

        const product: Product = {
          type: row.tipo || "",
          name: row.nombre || "",
          description,
          customDescription: row["descripcion personalizada"] || "",
          image: row.imagen,
          subproduct: row.subproducto,
          price,
          active: isActive,
          productIngredients: productIngredients,
        };

        return product;
      })
      .filter((p) => p.active);

    return products;
  },
  mock: {
    fetch: (): Promise<Product[]> => {
      return Promise.resolve(PRODUCTS);
    },
  },
};
