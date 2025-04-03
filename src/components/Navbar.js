import React from 'react';
import { NavLink } from 'react-router-dom'; // Usamos NavLink para estilos activos
import styles from './Navbar.module.css'; // Importa los estilos del módulo CSS
import { FaChartPie, FaBoxOpen, FaBook, FaCog } from 'react-icons/fa'; // Iconos

function Navbar() {
  return (
    <nav className={styles.navbar}> {/* Clase del módulo CSS */}
      <ul className={styles.navList}> {/* Clase del módulo CSS */}
        <li className={styles.navItem}> {/* Clase del módulo CSS */}
          {/* Usamos NavLink para que agregue la clase 'active' automáticamente */}
          <NavLink
            to="/" // Ruta raíz del layout protegido
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} // Clases del módulo CSS
            end // 'end' asegura que solo esté activo en la ruta exacta "/"
          >
            <FaChartPie className={styles.navIcon} /> {/* Clase del módulo CSS */}
            <span>Dashboard</span> {/* Texto */}
          </NavLink>
        </li>
        <li className={styles.navItem}> {/* Clase del módulo CSS */}
          <NavLink
            to="/insumos"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} // Clases del módulo CSS
          >
            <FaBoxOpen className={styles.navIcon} /> {/* Clase del módulo CSS */}
            <span>Insumos</span>
          </NavLink>
        </li>
        <li className={styles.navItem}> {/* Clase del módulo CSS */}
          <NavLink
            to="/recetas"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} // Clases del módulo CSS
          >
            <FaBook className={styles.navIcon} /> {/* Clase del módulo CSS */}
            <span>Recetas</span>
          </NavLink>
        </li>
        <li className={styles.navItem}> {/* Clase del módulo CSS */}
          <NavLink
            to="/configuracion"
            className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink} // Clases del módulo CSS
          >
            <FaCog className={styles.navIcon} /> {/* Clase del módulo CSS */}
            <span>Configuración</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;