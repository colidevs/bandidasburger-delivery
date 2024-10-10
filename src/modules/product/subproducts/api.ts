import Papa from "papaparse";

import {Subproduct, CsvSubproduct, SUBPRODUCTS} from "./";

export default {
  fetch: async (): Promise<Subproduct[]> => {
    const productUrl = process.env.NEXT_PUBLIC_SUBPRODUCTS;

    if (!productUrl) {
      throw new Error("SUBPRODUCTS environment variable is not defined");
    }

    return fetch(productUrl, {next: {tags: ["productTypes"]}}).then(async (response) => {
      const csv = await response.text();

      return new Promise<Subproduct[]>((resolve, reject) => {
        Papa.parse(csv, {
          header: true,
          complete: (results) => {
            const subproducts = (results.data as CsvSubproduct[])
              .map((row: CsvSubproduct) => ({
                name: row.nombre,
                price: parseFloat(row.precio.replace(/[$,]/g, "")),
                active: row.activo.toLowerCase() === "si",
              }))
              .filter((subproduct) => subproduct.active);

            resolve(subproducts as Subproduct[]);
          },
          error: (error: Error) => {
            reject(error.message);
          },
        });
      });
    });
  },
  mock: {
    fetch: (): Promise<Subproduct[]> => {
      return Promise.resolve(SUBPRODUCTS);
    },
  },
};
