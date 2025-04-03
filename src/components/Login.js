import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Asegúrate que la ruta sea correcta
// Importamos el archivo CSS Module. 'styles' será un objeto con nuestras clases CSS.
import styles from './Login.module.css';
// Importamos los iconos deseados (ej. de Font Awesome)
import { FaUserAlt, FaLock } from "react-icons/fa"; // Iconos de Usuario y Candado

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Previene que la página se recargue
    setError(''); // Limpia errores previos

    if (!email || !password) {
        setError('Por favor, ingresa email y contraseña.');
        return;
    }

    try {
      // Intenta iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      // Si tiene éxito, el listener en App.js detectará el cambio y redirigirá
      console.log("Inicio de sesión exitoso!");
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      // Mensajes de error más amigables
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
          setError('El formato del email no es válido.');
      }
       else {
          setError('Ocurrió un error al intentar iniciar sesión.');
      }
    }
  };

  // Usamos className y el objeto 'styles' para aplicar las clases del CSS Module
  return (
    <div className={styles.loginContainer}> {/* Contenedor principal */}
      <div className={styles.loginBox}>  {/* Caja del formulario */}
        <h2 className={styles.title}>Iniciar Sesión</h2>
        <p className={styles.subtitle}>Gestor de Recetas del Chef</p>
        <form onSubmit={handleLogin} className={styles.form}>

          {/* Grupo Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            {/* Añadimos el div wrapper */}
            <div className={styles.inputWrapper}>
              {/* Añadimos el componente del icono */}
              <FaUserAlt className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input} // Clase para el input
                placeholder="tu.email@ejemplo.com" // Placeholder útil
              />
            </div>
          </div>

          {/* Grupo Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña:</label>
             {/* Añadimos el div wrapper */}
            <div className={styles.inputWrapper}>
               {/* Añadimos el componente del icono */}
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input} // Clase para el input
                placeholder="••••••••" // Placeholder útil
              />
            </div>
          </div>

          {/* Mostramos el error si existe */}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>Ingresar</button>
        </form>
        {/* Podríamos añadir un enlace a Registro aquí si quisiéramos */}
        {/* <div className={styles.registerLink}>
             ¿No tienes cuenta? <a href="/registro">Regístrate</a>
           </div> */}
      </div>
    </div>
  );
}

export default Login;