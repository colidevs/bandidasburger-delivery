export interface ProductType {
  name: string;
  includeSubProduct: boolean;
  active: boolean;
}

export interface CsvProductType {
  nombre: string;
  "con-subproducto": string;
  activo: string;
}
