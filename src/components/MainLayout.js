import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Modal from './common/Modal';
import ConfirmationModal from './common/ConfirmationModal';
// Importamos AMBOS formularios
import InsumoForm from './Insumos/InsumoForm';
import RecetaForm from './Recetas/RecetaForm'; // Importa RecetaForm
import styles from './MainLayout.module.css';
import { FaBars } from 'react-icons/fa';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const openModal = (type, data = null) => {
    console.log(`Opening modal: ${type}`, data);
    setModalState({ type, data });
  };

  const closeModal = () => {
    console.log("Closing modal");
    setModalState({ type: null, data: null });
  };

  // --- Callbacks específicos para pasar a los formularios ---
  // Estos callbacks son llamados por los formularios cuando tienen éxito
  // y a su vez llaman a la función de lógica REAL que se pasó en 'data' desde la página hija

  // Callback para cuando InsumoForm guarda con éxito
  const handleInsumoSaveSuccess = (insumoData, insumoIdOriginal) => {
    if (modalState.data?.onSave) {
      modalState.data.onSave(insumoData, insumoIdOriginal); // Llama a handleDoSaveInsumo
    }
    closeModal(); // Cierra el modal
  };

  // Callback para cuando RecetaForm guarda con éxito
  const handleRecetaSaveSuccess = (recetaData, recetaIdOriginal) => {
     if (modalState.data?.onSave) {
       modalState.data.onSave(recetaData, recetaIdOriginal); // Llama a handleDoSaveReceta
     }
     closeModal(); // Cierra el modal
  };


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const applyBlur = modalState.type !== null;

  return (
    <div className={`${styles.mainLayout} ${applyBlur ? styles.blurEffect : ''}`}>
      <Sidebar isOpen={isSidebarOpen} />

      <div className={styles.contentWrapper}>
         <header className={styles.header}>
          <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
            <FaBars />
          </button>
          <div className={styles.headerTitle}>
             Gestor Chef v1.0
          </div>
          <div className={styles.headerSpacer}></div>
        </header>

        <main className={styles.contentArea}>
          {/* Pasamos las funciones de control de modales a las páginas hijas */}
          <Outlet context={{ openModal, closeModal }} />
        </main>
      </div>

       {/* Backdrop del menú lateral móvil */}
       {isSidebarOpen && (
          <div className={styles.mobileBackdrop} onClick={toggleSidebar}></div>
       )}

      {/* --- RENDERIZADO CENTRALIZADO DE MODALES --- */}

      {/* Modal para Añadir/Editar Insumo */}
      <Modal
        isOpen={modalState.type === 'addInsumo' || modalState.type === 'editInsumo'}
        onClose={closeModal}
        title={modalState.type === 'editInsumo' ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}
      >
        <InsumoForm
           // Pasamos el insumo a editar si existe en data.insumoData
           insumoToEdit={modalState.type === 'editInsumo' ? modalState.data?.insumoData : null}
           // onSave llama al callback que a su vez llama a la función original de GestionInsumos
           onSave={handleInsumoSaveSuccess}
           onCancel={closeModal}
         />
      </Modal>

       {/* --- NUEVO: Modal para Añadir/Editar Receta --- */}
      <Modal
        isOpen={modalState.type === 'addReceta' || modalState.type === 'editReceta'}
        onClose={closeModal}
        title={modalState.type === 'editReceta' ? 'Editar Receta' : 'Crear Nueva Receta'}
      >
        <RecetaForm
           // Pasamos la receta a editar si existe en data.recetaData
           recetaToEdit={modalState.type === 'editReceta' ? modalState.data?.recetaData : null}
           // onSave llama al callback que a su vez llama a la función original de GestionRecetas
           onSave={handleRecetaSaveSuccess}
           onCancel={closeModal}
         />
      </Modal>


      {/* Modal para Confirmar Eliminación (Genérico ahora basado en data) */}
      <ConfirmationModal
        isOpen={modalState.type?.startsWith('confirmDelete')} // Detecta cualquier confirmación de borrado
        onClose={closeModal}
        onConfirm={() => {
             if (modalState.data?.confirmAction) {
                 modalState.data.confirmAction(); // Ejecuta la acción de borrado (pasada desde la página)
             }
             closeModal();
            }}
        // Usamos ?? para dar un título por defecto si no viene en data
        title={modalState.data?.title ?? "Confirmar Acción"}
        // Usamos ?? para dar un mensaje por defecto
        message={modalState.data?.message ?? `¿Estás seguro de realizar esta acción?`}
      />

    </div>
  );
}

// Hook para que los hijos usen el contexto
export function useModalControl() {
  return useOutletContext();
}

export default MainLayout;