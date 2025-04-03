import React from 'react';
import { Outlet } from 'react-router-dom'; // Importa Outlet
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Ajusta la ruta si es necesario
import Navbar from './Navbar'; // Importa el Navbar
import styles from './MainLayout.module.css'; // Importa los estilos del módulo

function MainLayout() {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Cierre de sesión exitoso");
      // App.js manejará la redirección a /login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className={styles.mainLayout}> {/* Clase del módulo CSS */}
      <header className={styles.header}> {/* Clase del módulo CSS */}
        {/* Logo o Título Principal */}
        <div className={styles.headerTitle}> {/* Clase del módulo CSS */}
           Gestor Chef v1.0
        </div>
        {/* Botón de Logout */}
        <button onClick={handleLogout} className={styles.logoutButton}>Cerrar Sesión</button> {/* Clase del módulo CSS */}
      </header>

      {/* Barra de Navegación */}
      <Navbar />

      {/* Área Principal de Contenido */}
      <main className={styles.contentArea}> {/* Clase del módulo CSS */}
        {/* Outlet renderizará aquí los componentes de las rutas anidadas */}
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;