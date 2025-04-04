import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Modal from './common/Modal';
import ConfirmationModal from './common/ConfirmationModal';
import InsumoForm from './Insumos/InsumoForm'; // Importa InsumoForm
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

  // La lógica de guardar/confirmar ahora vive completamente en las páginas hijas (GestionInsumos, GestionRecetas)
  // y ellas se encargan de llamar a closeModal() al finalizar.

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const applyBlur = modalState.type !== null;

  return (
    <div className={`${styles.mainLayout} ${applyBlur ? styles.blurEffect : ''}`}>
      <Sidebar isOpen={isSidebarOpen} />

      <div className={styles.contentWrapper}>
         <header className={styles.header}>
          <button className={styles.mobileMenuButton} onClick={toggleSidebar}> <FaBars /> </button>
          <div className={styles.headerTitle}> Gestor Chef v1.0 </div>
          <div className={styles.headerSpacer}></div>
        </header>
        <main className={styles.contentArea}>
          {/* Pasamos las funciones de control de modales */}
          <Outlet context={{ openModal, closeModal }} />
        </main>
      </div>

       {/* Backdrop menú lateral móvil */}
       {isSidebarOpen && (<div className={styles.mobileBackdrop} onClick={toggleSidebar}></div>)}

      {/* --- RENDERIZADO CENTRALIZADO DE MODALES --- */}

      {/* Modal para Añadir/Editar Insumo */}
      <Modal
        isOpen={modalState.type === 'addInsumo' || modalState.type === 'editInsumo'}
        onClose={closeModal}
        title={modalState.type === 'editInsumo' ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}
      >
        {/* Renderizamos InsumoForm. Le pasamos directamente la función onSave
            que viene en modalState.data (que es handleDoSaveInsumo) y closeModal para onCancel */}
        <InsumoForm
           insumoToEdit={modalState.type === 'editInsumo' ? modalState.data?.insumoData : null}
           onSave={modalState.data?.onSave} // Pasa la función handleDoSaveInsumo directamente
           onCancel={closeModal} // Cancelar simplemente cierra el modal
         />
      </Modal>

       {/* Modal para Añadir/Editar Receta */}
      <Modal
        isOpen={modalState.type === 'addReceta' || modalState.type === 'editReceta'}
        onClose={closeModal}
        title={modalState.type === 'editReceta' ? 'Editar Receta' : 'Crear Nueva Receta'}
      >
        <RecetaForm
           recetaToEdit={modalState.type === 'editReceta' ? modalState.data?.recetaData : null}
           onSave={modalState.data?.onSave} // Pasa la función handleDoSaveReceta
           onCancel={closeModal}
         />
      </Modal>


      {/* Modal para Confirmar Eliminación */}
      <ConfirmationModal
        isOpen={modalState.type?.startsWith('confirmDelete')}
        onClose={closeModal}
        onConfirm={() => {
             if (modalState.data?.confirmAction) {
                 modalState.data.confirmAction(); // Ejecuta handleDoDeleteInsumo/Receta
             }
             // La lógica de cierre ahora está DENTRO de handleDoDelete... o la llamamos aquí si falla
             // closeModal(); // Quitado de aquí, se llama desde el handler de la página
            }}
        title={modalState.data?.title ?? "Confirmar Acción"}
        message={modalState.data?.message ?? `¿Estás seguro? Esta acción no se puede deshacer.`}
      />

    </div>
  );
}

// Hook de contexto (sin cambios)
export function useModalControl() { return useOutletContext(); }

export default MainLayout;