import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Asegúrate que la ruta sea correcta
import styles from './Login.module.css';
import { FaUserAlt, FaLock } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
        setError('Por favor, ingresa email y contraseña.');
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Inicio de sesión exitoso!");
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/invalid-email') {
          setError('El formato del email no es válido.');
      } else {
          setError('Ocurrió un error al intentar iniciar sesión.');
      }
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Iniciar Sesión</h2>

        {/* --- REEMPLAZO DEL SUBTÍTULO POR EL LOGO --- */}
        <div className={styles.logoContainer}>
           <span className={styles.logo}>Chef</span><span className={styles.logoHighlight}>App</span>
        </div>
        {/* --- FIN DEL REEMPLAZO --- */}

        <form onSubmit={handleLogin} className={styles.form}>
          {/* Grupo Email */}
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <div className={styles.inputWrapper}>
              <FaUserAlt className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
                placeholder="tu.email@ejemplo.com"
              />
            </div>
          </div>

          {/* Grupo Contraseña */}
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Contraseña:</label>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.button}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}

export default Login;