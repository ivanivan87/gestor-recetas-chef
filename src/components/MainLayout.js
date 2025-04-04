import React, { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import Sidebar from './Sidebar';
import Modal from './common/Modal';
import ConfirmationModal from './common/ConfirmationModal';
import InsumoForm from './Insumos/InsumoForm';
import RecetaForm from './Recetas/RecetaForm';
import styles from './MainLayout.module.css';
import { FaBars } from 'react-icons/fa';
import { Toaster } from 'react-hot-toast'; // Asegurar que Toaster esté importado

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const openModal = (type, data = null) => { setModalState({ type, data }); };
  const closeModal = () => { setModalState({ type: null, data: null }); };
  const toggleSidebar = () => { setIsSidebarOpen(!isSidebarOpen); };
  const applyBlur = modalState.type !== null;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ /* ... opciones ... */ }} />
      <div className={`${styles.mainLayout} ${applyBlur ? styles.blurEffect : ''}`}>
        <Sidebar isOpen={isSidebarOpen} />
        <div className={styles.contentWrapper}>
          <header className={styles.header}> <button className={styles.mobileMenuButton} onClick={toggleSidebar}> <FaBars /> </button> <div className={styles.headerTitle}> Gestor Chef v1.0 </div> <div className={styles.headerSpacer}></div> </header>
          <main className={styles.contentArea}> <Outlet context={{ openModal, closeModal }} /> </main>
        </div>
        {isSidebarOpen && (<div className={styles.mobileBackdrop} onClick={toggleSidebar}></div>)}

        {/* --- RENDERIZADO CENTRALIZADO DE MODALES --- */}

        {/* Modal Add/Edit Insumo (onSave CORREGIDO) */}
        <Modal isOpen={modalState.type === 'addInsumo' || modalState.type === 'editInsumo'} onClose={closeModal} title={modalState.type === 'editInsumo' ? 'Editar Insumo' : 'Añadir Nuevo Insumo'}>
          <InsumoForm
             insumoToEdit={modalState.type === 'editInsumo' ? modalState.data?.insumoData : null}
             // Pasa DIRECTAMENTE la función que vino en data.onSave (será handleDoSaveInsumo)
             onSave={modalState.data?.onSave}
             onCancel={closeModal}
           />
        </Modal>

        {/* Modal Add/Edit Receta (onSave corregido igual por consistencia) */}
        <Modal isOpen={modalState.type === 'addReceta' || modalState.type === 'editReceta'} onClose={closeModal} title={modalState.type === 'editReceta' ? 'Editar Receta' : 'Crear Nueva Receta'}>
          <RecetaForm
             recetaToEdit={modalState.type === 'editReceta' ? modalState.data?.recetaData : null}
             // Pasa DIRECTAMENTE la función que vino en data.onSave (será handleDoSaveReceta)
             onSave={modalState.data?.onSave}
             onCancel={closeModal}
           />
        </Modal>

        {/* Modal Confirmación (Corregido para llamar closeModal después de await) */}
        <ConfirmationModal
          isOpen={modalState.type?.startsWith('confirmDelete')}
          onClose={closeModal}
          onConfirm={async () => {
               if (modalState.data?.confirmAction) {
                   try { await modalState.data.confirmAction(); } // Ejecuta la acción (ej: handleDoDeleteInsumo)
                   catch(err) { console.error("Error en confirmAction modal:", err); }
               }
               closeModal(); // Cierra SIEMPRE después de intentar la acción
              }}
          title={modalState.data?.title ?? "Confirmar"}
          message={modalState.data?.message ?? `¿Estás seguro?`}
        />
      </div>
    </>
  );
}

export function useModalControl() { return useOutletContext(); }
export default MainLayout;