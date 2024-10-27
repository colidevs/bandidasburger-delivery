export interface Store {
  name: string;
  description: string;
  logo: string;
  banner: string;
  instagram: string;
  whatsapp: string;
  phone: string;
  location: string;
  shipping: number;
  shippingType: string[];
}

export interface CsvStore {
  nombre: string;
  descripcion: string;
  logo: string;
  banner: string;
  instagram: string;
  celular: string;
  ubicacion: string;
  envio: number;
  "opciones-envio": string;
}
