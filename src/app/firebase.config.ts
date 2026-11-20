import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { environment } from '../environments/environment';

// Se inicializa Firebase una sola vez y se exporta la instancia de Firestore
const app = initializeApp(environment.firebase);
export const db = getFirestore(app);
