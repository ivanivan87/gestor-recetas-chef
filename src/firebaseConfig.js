// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Leemos la configuración desde las variables de entorno (archivo .env)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// Opcional pero recomendado: Una pequeña validación para asegurarnos
// de que las variables se cargaron correctamente desde el .env
if (!firebaseConfig.apiKey) {
   console.warn("¡Advertencia! La variable REACT_APP_API_KEY no se encontró en el archivo .env. Firebase podría no funcionar.");
   // Puedes añadir más validaciones si quieres
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos
export const auth = getAuth(app);
export const db = getFirestore(app); // db es el nombre común para Firestore