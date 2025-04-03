import React, { useState } from 'react';
import { useModalControl } from '../components/MainLayout'; // Importa el hook del contexto
import InsumosList from '../components/Insumos/InsumosList';
// Ya no importamos Modal ni ConfirmationModal aquí directamente
import styles from './GestionInsumos.module.css';
import { FaPlusCircle } from 'react-icons/fa';

// --- DATOS DE EJEMPLO ---
const insumosDeEjemplo = [
  { id: '1', nombre: 'Tomate Perita', categoria: 'Verdulería', proveedor: 'Proveedor A', presentacion: 'kg', precioPorKg: 150.00, precioTotalPresentacion: 150.00 },
  { id: '2', nombre: 'Harina 0000', categoria: 'Almacén', proveedor: 'Proveedor B', presentacion: 'Paquete 1kg', precioPorKg: 90.00, precioTotalPresentacion: 90.00 },
  { id: '3', nombre: 'Aceite Girasol', categoria: 'Almacén', proveedor: 'Proveedor B', presentacion: 'Botella 900ml', precioPorKg: 210.00, precioTotalPresentacion: 189.00 },
  { id: '4', nombre: 'Lomo Novillo', categoria: 'Carnicería', proveedor: 'Proveedor C', presentacion: 'kg', precioPorKg: 950.50, precioTotalPresentacion: 950.50 },
];
// --- FIN DATOS DE EJEMPLO ---

// --- VALOR TEMPORAL PARA IVA ---
// Esto se reemplazará más adelante leyendo desde la configuración de Firestore
const IVA_TEMPORAL = 21; // 21%
// --- FIN VALOR TEMPORAL ---


function GestionInsumos() {
  const { openModal } = useModalControl();
  const [insumos, setInsumos] = useState(insumosDeEjemplo);

  // --- MANEJADORES PARA ABRIR MODALES ---
  const handleOpenAddForm = () => {
    openModal('addInsumo', { onSave: handleDoSaveInsumo });
  };

  const handleEditInsumo = (insumo) => {
    openModal('editInsumo', { insumoData: insumo, onSave: handleDoSaveInsumo });
  };

  const handleDeleteInsumo = (insumo) => {
    openModal('confirmDeleteInsumo', {
        nombre: insumo.nombre,
        id: insumo.id,
        confirmAction: () => handleDoDeleteInsumo(insumo.id)
    });
  };

  // --- FUNCIONES QUE REALIZAN LA LÓGICA ---
  const handleDoSaveInsumo = (insumoData, insumoIdOriginal) => {
      console.log("Ejecutando lógica de guardado para:", insumoData, "ID Original:", insumoIdOriginal);
      // Simulación
      if (insumoIdOriginal) {
          setInsumos(prevInsumos => prevInsumos.map(i =>
              i.id === insumoIdOriginal ? { ...insumoData, id: i.id } : i
          ));
          console.log("Simulando actualización...");
      } else {
          setInsumos(prevInsumos => [
              ...prevInsumos,
              { ...insumoData, id: Date.now().toString() }
          ]);
           console.log("Simulando adición...");
      }
  };

  const handleDoDeleteInsumo = (idInsumo) => {
      console.log("Ejecutando lógica de borrado para ID:", idInsumo);
      // Simulación
      setInsumos(prevInsumos => prevInsumos.filter(i => i.id !== idInsumo));
      console.log("Simulando eliminación...");
  };


  return (
    <div className={styles.gestionContainer}>
      <h1>Gestión de Insumos / Materia Prima</h1>

      <button
        onClick={handleOpenAddForm}
        className={styles.toggleFormButton}
      >
        <FaPlusCircle style={{marginRight: '8px'}}/> Añadir Nuevo Insumo
      </button>

      <hr className={styles.divider} />

      <h2>Listado de Insumos</h2>
      <InsumosList
          insumos={insumos}
          onEdit={handleEditInsumo}
          onDelete={handleDeleteInsumo}
          // Pasamos el IVA temporal como prop
          ivaPercentage={IVA_TEMPORAL}
      />

      {/* Los modales se renderizan en MainLayout */}

    </div>
  );
}

export default GestionInsumos;