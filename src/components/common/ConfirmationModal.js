import React from 'react';
import Modal from './Modal'; // Importa el Modal genérico
import styles from './ConfirmationModal.module.css'; // CSS específico para botones

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {/* Contenido del cuerpo del modal */}
      <p className={styles.message}>{message}</p>

      {/* Contenido del footer: los botones de Confirmar/Cancelar */}
      {/* Se pasa como prop 'footerContent' al componente Modal */}
      <div className={styles.buttonContainer}>
        <button onClick={onConfirm} className={`${styles.button} ${styles.confirmButton}`}>
          Confirmar
        </button>
        <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;