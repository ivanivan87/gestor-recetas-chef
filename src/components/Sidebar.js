import React from 'react';
import { NavLink } from 'react-router-dom';
// Importamos el CSS Module
import styles from './Sidebar.module.css';
import { FaChartPie, FaBoxOpen, FaBook, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';

// El componente ahora recibe la prop 'isOpen'
function Sidebar({ isOpen }) {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Cierre de sesión exitoso desde Sidebar");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Construimos las clases dinámicamente
  const sidebarClasses = `${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`;

  return (
    // Aplicamos las clases CSS dinámicas al elemento aside
    <aside className={sidebarClasses}>
      <div className={styles.sidebarHeader}>
        <span className={styles.logo}>Chef</span><span className={styles.logoHighlight}>App</span>
      </div>

      <nav className={styles.sidebarNav}>
        <NavLink to="/" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} end>
          <FaChartPie className={styles.navIcon} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/insumos" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
          <FaBoxOpen className={styles.navIcon} />
          <span>Insumos</span>
        </NavLink>
        <NavLink to="/recetas" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
          <FaBook className={styles.navIcon} />
          <span>Recetas</span>
        </NavLink>
        <NavLink to="/configuracion" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
          <FaCog className={styles.navIcon} />
          <span>Configuración</span>
        </NavLink>
      </nav>

       <div className={styles.sidebarFooter}>
         <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt className={styles.navIcon} />
            <span>Cerrar Sesión</span>
         </button>
       </div>
    </aside>
  );
}

export default Sidebar;