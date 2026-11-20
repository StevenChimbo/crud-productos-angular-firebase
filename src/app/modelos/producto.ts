// Modelo de un producto de la colección "productos"
export interface Producto {
  id?: string;        // identificador del documento en Firestore
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}
