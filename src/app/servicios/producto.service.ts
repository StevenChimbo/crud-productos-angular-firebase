import { Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { Producto } from '../modelos/producto';

// Aquí está TODO el acceso a Firestore. Los componentes solo llaman a estos métodos.
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private coleccion = collection(db, 'productos');

  // CONSULTAR: trae todos los documentos de la colección
  async obtenerTodos(): Promise<Producto[]> {
    const resultado = await getDocs(this.coleccion);
    return resultado.docs
      .map(d => {
        const datos: any = d.data();
        return {
          id: d.id,                          // se conserva el id para editar y eliminar
          nombre: String(datos.nombre ?? ''),
          precio: Number(datos.precio),
          stock: Number(datos.stock),
          categoria: String(datos.categoria ?? '')
        };
      })
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  // CREAR: agrega un documento nuevo (Firestore genera el id)
  async crear(producto: Producto): Promise<void> {
    await addDoc(this.coleccion, this.datos(producto));
  }

  // ACTUALIZAR: modifica el documento que tiene ese id
  async actualizar(id: string, producto: Producto): Promise<void> {
    await updateDoc(doc(db, 'productos', id), this.datos(producto));
  }

  // ELIMINAR: borra el documento que tiene ese id
  async eliminar(id: string): Promise<void> {
    await deleteDoc(doc(db, 'productos', id));
  }

  // Solo se guardan los cuatro campos (el id no se guarda dentro del documento)
  private datos(p: Producto) {
    return { nombre: p.nombre, precio: p.precio, stock: p.stock, categoria: p.categoria };
  }
}
