# CRUD de productos con Angular y Firebase

**Autor:** Steven Chimbo
**Asignatura:** Programación y Plataformas Web – UPS
**Práctica 02.2:** Desarrollo de un CRUD de productos con Angular y Firebase

## Propósito
Aplicación web en Angular que administra la colección `productos` de **Cloud Firestore**: permite crear, consultar, actualizar y eliminar productos, y los datos se conservan al recargar la página.

## Funciones del CRUD
| Operación | Cómo funciona |
|---|---|
| **Crear** | Formulario "Nuevo producto" que guarda un documento en `productos`. |
| **Consultar** | Tabla HTML con todos los documentos de la colección. Muestra mensajes de carga y "No hay productos registrados". |
| **Actualizar** | El botón *Editar* carga el producto en el formulario y guarda los cambios en el mismo documento usando su id. |
| **Eliminar** | El botón *Eliminar* pide confirmación. Si se cancela, el producto se conserva. |

Validaciones del formulario: nombre (2 a 60 caracteres, con letras), categoría (solo letras y espacios), precio (número ≥ 0, máximo 2 decimales) y stock (entero ≥ 0). Si hay datos inválidos no se envía nada y se muestran mensajes. Si una operación falla, se muestra un mensaje de error.

## Modelo de producto
```ts
interface Producto {
  id?: string;      // id del documento en Firestore
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
}
```

## Estructura
```
src/app/
├── firebase.config.ts                 # inicializa Firebase y exporta Firestore (db)
├── modelos/producto.ts                # modelo
├── servicios/producto.service.ts      # ProductoService: todo el acceso a Firestore
└── productos/                         # componente con formulario y tabla
src/environments/
├── environment.example.ts             # plantilla (sí se sube al repositorio)
└── environment.ts                     # credenciales reales (NO se sube: está en .gitignore)
scripts/generar-env.js                 # genera environment.ts desde variables de entorno (Vercel)
```

## Configuración de Firebase
1. En https://console.firebase.google.com crea un proyecto y habilita **Cloud Firestore**.
2. Crea la colección `productos` con documentos de campos `nombre`, `precio`, `stock` y `categoria`.
3. Registra una **app web** (icono `</>`) y copia el objeto `firebaseConfig`.
4. Copia `src/environments/environment.example.ts` como `src/environments/environment.ts` y pega ahí tus valores.
5. En **Firestore > Reglas** usa estas reglas y pulsa *Publicar*:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /productos/{id} {
      allow read, delete: if true;
      allow create, update: if request.resource.data.nombre is string
        && request.resource.data.nombre.size() > 0
        && request.resource.data.categoria is string
        && request.resource.data.categoria.size() > 0
        && request.resource.data.precio is number
        && request.resource.data.precio >= 0
        && request.resource.data.stock is int
        && request.resource.data.stock >= 0;
    }
  }
}
```
> Las credenciales no se suben al repositorio. La configuración web de Firebase no es una contraseña, pero la seguridad real depende de las reglas de Firestore.

## Instalación y ejecución local
```
npm install
npm start
```
Abrir `http://localhost:4200`.

## Publicación en Vercel
1. Importar el repositorio de GitHub en Vercel (framework: Angular).
2. En **Settings > Environment Variables** crear estas seis variables con los valores de `firebaseConfig`:
   `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`.
3. Pulsar **Deploy**. El comando `npm run build` ejecuta antes `scripts/generar-env.js`, que crea `environment.ts` con esas variables.

## Sitio desplegado (Vercel)
URL: https://crud-productos-angular-firebase-ten.vercel.app/

