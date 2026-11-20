// Se ejecuta antes de "npm run build" (por ejemplo, en Vercel).
// Si existen las variables FIREBASE_* crea src/environments/environment.ts con ellas.
// Así las credenciales no se guardan en el repositorio.
const fs = require('fs');

const ruta = 'src/environments/environment.ts';

if (!process.env.FIREBASE_API_KEY) {
  if (fs.existsSync(ruta)) {
    console.log('Sin variables FIREBASE_*: se usa el environment.ts local.');
    process.exit(0);
  }
  console.error('Faltan las variables FIREBASE_* y no existe src/environments/environment.ts');
  process.exit(1);
}

const contenido = `export const environment = {
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
    appId: '${process.env.FIREBASE_APP_ID}'
  }
};
`;

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync(ruta, contenido);
console.log('environment.ts generado desde las variables FIREBASE_*');
