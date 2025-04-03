import React, { useState } from 'react';
import { useModalControl } from '../components/MainLayout'; // Importa el hook del contexto
// Importaremos RecetasList más adelante
// import RecetasList from '../components/Recetas/RecetasList';
// Ya no importamos RecetaForm aquí (se renderiza en MainLayout)
import styles from './GestionRecetas.module.css';
import { FaPlusCircle } from 'react-icons/fa'; // Icono para el botón

// --- DATOS DE EJEMPLO (para RecetasList más adelante) ---
const recetasDeEjemplo = [
    // { id: 'r1', nombre: 'Milanesa Napo c/Fritas', categoria: 'Plato Principal', costoVariable: 152.08, precioFinal: 392.88},
    // { id: 'r2', nombre: 'Ensalada Cesar', categoria: 'Entrada', costoVariable: 120.50, precioFinal: 310.00},
];
// --- FIN DATOS DE EJEMPLO ---

function GestionRecetas() {
  // Hook para controlar modales (desde MainLayout)
  const { openModal } = useModalControl();

  // Estado para la lista de recetas (lo usaremos después)
  const [recetas, setRecetas] = useState(recetasDeEjemplo);
  // Estado para la receta en edición (lo usaremos después)
  // const [recetaActual, setRecetaActual] = useState(null);

  // --- MANEJADORES PARA ABRIR MODALES ---
  const handleOpenAddForm = () => {
    // Le decimos a MainLayout que abra un modal tipo 'addReceta'
    // Pasamos la función que manejará el guardado como parte de 'data'
    openModal('addReceta', { onSave: handleDoSaveReceta });
  };

  // const handleEditReceta = (receta) => {
  //   openModal('editReceta', { recetaData: receta, onSave: handleDoSaveReceta });
  // };

  // const handleDeleteReceta = (receta) => {
  //   openModal('confirmDeleteReceta', { // Necesitaríamos otro tipo de modal o pasar más data
  //       nombre: receta.nombre,
  //       id: receta.id,
  //       confirmAction: () => handleDoDeleteReceta(receta.id)
  //   });
  // };

  // --- FUNCIONES QUE REALIZAN LA LÓGICA (Simuladas por ahora) ---
  const handleDoSaveReceta = (recetaData, recetaIdOriginal) => {
      console.log("Ejecutando lógica de guardado para RECETA:", recetaData, "ID Original:", recetaIdOriginal);
      // Lógica futura con Firestore para guardar/actualizar receta
      if (recetaIdOriginal) {
          console.log("Simulando actualización de receta...");
          // Actualizar estado 'recetas'
      } else {
           console.log("Simulando adición de receta...");
           // Añadir a estado 'recetas'
      }
      // closeModal() se llama automáticamente desde MainLayout ahora
  };

  // const handleDoDeleteReceta = (idReceta) => {
  //     console.log("Ejecutando lógica de borrado para RECETA ID:", idReceta);
  //     // Lógica futura con Firestore
  //     // Actualizar estado 'recetas'
  //     // closeModal() se llama automáticamente desde MainLayout
  // };


  return (
    <div className={styles.gestionContainer}>
      {/* Título Principal */}
      <h1>Gestión de Recetas</h1>

      {/* Botón para abrir el modal de Crear Receta */}
      <button
        onClick={handleOpenAddForm}
        className={styles.toggleFormButton}
      >
        <FaPlusCircle style={{marginRight: '8px'}}/> Crear Nueva Receta
      </button>

      {/* Línea Divisora */}
      <hr className={styles.divider} />

      {/* Título Secundario */}
      <h2>Recetario</h2>
      {/* Placeholder para la lista */}
      <p>Próximamente: Listado de recetas existentes...</p>
      {/* <RecetasList recetas={recetas} onEdit={handleEditReceta} onDelete={handleDeleteReceta} /> */}

       {/* Los modales se renderizan en MainLayout */}
    </div>
  );
}

export default GestionRecetas;