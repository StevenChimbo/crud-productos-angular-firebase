import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ProductoService } from '../servicios/producto.service';
import { Producto } from '../modelos/producto';

// Validador del nombre: 2 a 60 caracteres, con al menos una letra.
// Solo permite letras (con tildes y ñ), números, espacios y . , - ( ) / % +
function nombreValido(control: AbstractControl): ValidationErrors | null {
  const v = typeof control.value === 'string' ? control.value.trim() : '';
  if (v.length === 0) return { vacio: true };
  if (v.length < 2) return { corto: true };
  if (v.length > 60) return { largo: true };
  if (!/\p{L}/u.test(v)) return { sinLetras: true };
  if (!/^[\p{L}\p{N} .,\-()\/%+]+$/u.test(v)) return { caracteres: true };
  return null;
}

// Validador de la categoría: 2 a 30 caracteres y solo letras (con tildes y ñ) y espacios
function categoriaValida(control: AbstractControl): ValidationErrors | null {
  const v = typeof control.value === 'string' ? control.value.trim() : '';
  if (v.length === 0) return { vacio: true };
  if (v.length < 2) return { corto: true };
  if (v.length > 30) return { largo: true };
  if (!/^[\p{L} ]+$/u.test(v)) return { caracteres: true };
  return null;
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicio = inject(ProductoService);

  // Estado de la pantalla (signals: Angular actualiza la vista al cambiarlos)
  productos = signal<Producto[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  mensaje = signal('');
  error = signal('');
  idEditando = signal<string | null>(null);   // null = estamos creando; con id = editando

  // Formulario con sus validaciones
  formulario = this.fb.group({
        nombre: ['', [nombreValido]],
    categoria: ['', [categoriaValida]],
    precio: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100000), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
    stock: [null as number | null, [Validators.required, Validators.min(0), Validators.max(1000000), Validators.pattern(/^\d+$/)]]
  });

  ngOnInit() {
    this.cargar();
  }

  // ---------- CONSULTAR ----------
  async cargar() {
    this.cargando.set(true);
    try {
      this.productos.set(await this.servicio.obtenerTodos());
    } catch (e) {
      this.error.set('No se pudieron cargar los productos desde Firestore.');
    }
    this.cargando.set(false);
  }

  // ---------- CREAR o ACTUALIZAR (según idEditando) ----------
  async guardar() {
    this.mensaje.set('');
    this.error.set('');

    // Si el formulario es inválido, se muestran los mensajes y NO se envía nada
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const v = this.formulario.value;
    const producto: Producto = {
      nombre: v.nombre!.trim(),
      categoria: v.categoria!.trim(),
      precio: Number(v.precio),
      stock: Number(v.stock)
    };

    this.guardando.set(true);
    try {
      const id = this.idEditando();
      if (id) {
        await this.servicio.actualizar(id, producto);
        this.mensaje.set('Producto actualizado correctamente.');
      } else {
        await this.servicio.crear(producto);
        this.mensaje.set('Producto creado correctamente.');
      }
      this.limpiarFormulario();
      await this.cargar();            // la tabla se actualiza después de escribir
    } catch (e) {
      this.error.set('No se pudo guardar el producto. Intenta de nuevo.');
    }
    this.guardando.set(false);
  }

  // ---------- Cargar un producto en el formulario para editarlo ----------
  editar(producto: Producto) {
    this.mensaje.set('');
    this.error.set('');
    this.idEditando.set(producto.id!);
    this.formulario.setValue({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock
    });
  }

  // ---------- ELIMINAR (con confirmación) ----------
  async eliminar(producto: Producto) {
    this.mensaje.set('');
    this.error.set('');

    // Si el usuario cancela, no se hace nada y el producto se conserva
    if (!confirm('¿Seguro que deseas eliminar "' + producto.nombre + '"?')) {
      return;
    }

    try {
      await this.servicio.eliminar(producto.id!);
      if (this.idEditando() === producto.id) {
        this.limpiarFormulario();
      }
      this.mensaje.set('Producto eliminado correctamente.');
      await this.cargar();
    } catch (e) {
      this.error.set('No se pudo eliminar el producto. Intenta de nuevo.');
    }
  }

  // ---------- Cancelar la edición / limpiar ----------
  limpiarFormulario() {
    this.idEditando.set(null);
    this.formulario.reset();
  }

  // Indica si se debe mostrar el mensaje de error de un campo
  mostrarError(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

    // Texto del mensaje de validación de cada campo
  mensajeError(campo: string): string {
    const e = this.formulario.get(campo)?.errors;
    if (!e) return '';

    if (campo === 'nombre') {
      if (e['vacio']) return 'El nombre es obligatorio.';
      if (e['corto']) return 'El nombre debe tener al menos 2 caracteres.';
      if (e['largo']) return 'El nombre no puede tener más de 60 caracteres.';
      if (e['sinLetras']) return 'El nombre debe contener letras.';
      return 'El nombre solo puede tener letras, números, espacios y los signos . , - ( ) / % +';
    }
    if (campo === 'categoria') {
      if (e['vacio']) return 'La categoría es obligatoria.';
      if (e['corto']) return 'La categoría debe tener al menos 2 letras.';
      if (e['largo']) return 'La categoría no puede tener más de 30 caracteres.';
      return 'La categoría solo puede tener letras y espacios.';
    }
    if (campo === 'precio') {
      if (e['required']) return 'El precio es obligatorio.';
      if (e['min']) return 'El precio no puede ser negativo.';
      if (e['max']) return 'El precio no puede superar $100000.';
      return 'El precio debe ser numérico, con máximo 2 decimales.';
    }
    // stock
    if (e['required']) return 'El stock es obligatorio.';
    if (e['min']) return 'El stock no puede ser negativo.';
    if (e['max']) return 'El stock no puede superar 1000000.';
    return 'El stock debe ser un número entero (sin decimales).';
  }
}
