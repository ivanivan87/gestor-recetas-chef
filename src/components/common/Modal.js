import React from 'react';
import styles from './Modal.module.css'; // Crearemos este CSS
import { FaTimes } from 'react-icons/fa'; // Icono para cerrar

// Componente Modal Genérico Reutilizable
function Modal({ isOpen, onClose, title, children, footerContent }) {
  // Si el modal no está abierto, no renderiza nada
  if (!isOpen) {
    return null;
  }

  // Evita que el clic dentro del contenido del modal lo cierre
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // El backdrop (fondo oscuro semi-transparente)
    // Al hacer clic en el backdrop (fuera del contenido), se cierra el modal (llama a onClose)
    <div className={styles.modalBackdrop} onClick={onClose}>
      {/* El contenedor del contenido del modal */}
      <div className={styles.modalContent} onClick={handleContentClick}>
        {/* Encabezado del Modal */}
        <div className={styles.modalHeader}>
          {/* Muestra el título si se proporciona */}
          {title && <h3 className={styles.modalTitle}>{title}</h3>}
          {/* Botón para cerrar el modal */}
          <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar modal">
            <FaTimes />
          </button>
        </div>

        {/* Cuerpo del Modal (contenido principal) */}
        <div className={styles.modalBody}>
          {children} {/* Aquí se renderizará el contenido pasado al modal */}
        </div>

        {/* Footer del Modal (opcional, para botones) */}
        {footerContent && (
          <div className={styles.modalFooter}>
            {footerContent} {/* Aquí se renderizarán los botones u otro contenido del footer */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;