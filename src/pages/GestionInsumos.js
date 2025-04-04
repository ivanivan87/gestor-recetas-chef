import React, { useState, useEffect } from 'react'; // Añadir useEffect
import { useModalControl } from '../components/MainLayout';
import InsumosList from '../components/Insumos/InsumosList';
import styles from './GestionInsumos.module.css';
import { FaPlusCircle } from 'react-icons/fa';

// --- Importar funciones de Firestore ---
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs } from "firebase/firestore"; // Añadir getDocs para lectura futura

// --- Referencia a la colección 'insumos' ---
const insumosCollectionRef = collection(db, "insumos");

// --- VALOR TEMPORAL PARA IVA ---
const IVA_TEMPORAL = 21;
// --- FIN VALOR TEMPORAL ---

function GestionInsumos() {
  const { openModal, closeModal } = useModalControl();

  // El estado 'insumos' empieza vacío. Se llenará desde Firestore.
  const [insumos, setInsumos] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para carga inicial de datos
  const [isSaving, setIsSaving] = useState(false); // Estado para guardado/borrado
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // --- NUEVO: useEffect para LEER insumos de Firestore al cargar ---
  // (Implementación básica de lectura - la mejoraremos después con listeners)
  useEffect(() => {
    const fetchInsumos = async () => {
      setIsLoading(true);
      try {
        console.log("Intentando obtener insumos de Firestore...");
        const data = await getDocs(insumosCollectionRef);
        const insumosData = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log("Insumos obtenidos:", insumosData);
        setInsumos(insumosData);
        setStatusMessage({ type: 'info', text: `Se encontraron ${insumosData.length} insumos.` });
      } catch (error) {
        console.error("Error obteniendo insumos: ", error);
        setStatusMessage({ type: 'error', text: 'Error al cargar los insumos.' });
        setInsumos([]); // Asegurar que esté vacío si hay error
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsumos();
  // El array vacío [] significa que este efecto se ejecuta solo una vez, al montar el componente
  }, []);


  // --- MANEJADORES PARA ABRIR MODALES ---
  const handleOpenAddForm = () => {
    setStatusMessage({ type: '', text: '' });
    // Pasamos directamente la función async que guarda
    openModal('addInsumo', { onSave: handleDoSaveInsumo });
  };

  const handleEditInsumo = (insumo) => {
     setStatusMessage({ type: '', text: '' });
     // Pasamos la función async y el insumo a editar
    openModal('editInsumo', { insumoData: insumo, onSave: handleDoSaveInsumo });
  };

  const handleDeleteInsumo = (insumo) => {
     setStatusMessage({ type: '', text: '' });
    // Pasamos la función async de borrado
    openModal('confirmDeleteInsumo', {
        nombre: insumo.nombre,
        id: insumo.id,
        confirmAction: () => handleDoDeleteInsumo(insumo.id)
    });
  };

  // --- FUNCIONES QUE REALIZAN LA LÓGICA CON FIRESTORE ---

  // MODIFICADO: handleDoSaveInsumo ahora interactúa con Firestore
  const handleDoSaveInsumo = async (insumoData, insumoIdOriginal) => {
    console.log("Intentando guardar/actualizar insumo en Firestore:", insumoData, "ID Original:", insumoIdOriginal);
    setIsSaving(true);
    setStatusMessage({ type: '', text: '' });

    if (insumoIdOriginal) { // Lógica de EDICIÓN (PENDIENTE)
        console.warn("Lógica de actualización aún no implementada.");
        // TODO: Implementar updateDoc(doc(db, "insumos", insumoIdOriginal), insumoData);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular
        // TODO: Actualizar estado local de forma más eficiente o refetchear
        setInsumos(prev => prev.map(i => i.id === insumoIdOriginal ? { ...insumoData, id: i.id } : i));
        setStatusMessage({ type: 'success', text: 'Insumo actualizado! (Simulado)' });

    } else { // Lógica de AÑADIR NUEVO
        try {
            console.log("Añadiendo a Firestore...");
            // Usamos addDoc para que Firestore genere el ID
            const docRef = await addDoc(insumosCollectionRef, insumoData);
            console.log("Documento añadido con ID: ", docRef.id);
            setStatusMessage({ type: 'success', text: `Insumo "${insumoData.nombre}" añadido.` });
            // --- OPCIONAL: Actualizar lista local al añadir (forma básica) ---
            // Añadimos el nuevo insumo al estado local para verlo inmediatamente
            // Lo ideal a futuro es usar un listener de Firestore (onSnapshot)
            setInsumos(prevInsumos => [...prevInsumos, { ...insumoData, id: docRef.id }]);
            // --- Fin opcional ---

        } catch (error) {
            console.error("Error añadiendo documento: ", error);
            setStatusMessage({ type: 'error', text: 'Error al guardar. Verifica la consola.' });
            // No cerramos modal si hubo error, para no perder datos
            setIsSaving(false); // Asegurarse de quitar estado de carga
            return; // Salir para no llamar a closeModal()
        }
    }
    // Si todo fue bien (o en la simulación de editar)
    setIsSaving(false);
    closeModal(); // Llama a la función del contexto para cerrar el modal
  };

  // MODIFICADO: handleDoDeleteInsumo (pendiente Firestore real)
  const handleDoDeleteInsumo = async (idInsumo) => {
      console.log("Intentando borrar insumo ID:", idInsumo);
      setIsSaving(true);
      setStatusMessage({ type: '', text: '' });
      try {
          console.warn("Lógica de borrado aún no implementada.");
          // TODO: Implementar deleteDoc(doc(db, "insumos", idInsumo));
          await new Promise(resolve => setTimeout(resolve, 500)); // Simular
          // Actualizar estado local
          setInsumos(prevInsumos => prevInsumos.filter(i => i.id !== idInsumo));
          setStatusMessage({ type: 'success', text: 'Insumo eliminado! (Simulado)' });
          console.log("Simulando eliminación...");
      } catch (error) {
          console.error("Error eliminando insumo (simulado): ", error);
          setStatusMessage({ type: 'error', text: 'Error al eliminar.' });
      } finally {
         setIsSaving(false);
         // closeModal() se llama desde MainLayout
      }
  };


  return (
    <div className={styles.gestionContainer}>
      <h1>Gestión de Insumos / Materia Prima</h1>

      <button
        onClick={handleOpenAddForm}
        className={styles.toggleFormButton}
        disabled={isSaving || isLoading} // Deshabilitar si carga o guarda
      >
        <FaPlusCircle style={{marginRight: '8px'}}/> Añadir Nuevo Insumo
      </button>

      {/* Mensajes de Estado */}
      {statusMessage.text && (
          <p className={`${styles.statusMessage} ${statusMessage.type === 'error' ? styles.error : styles.success}`}>
              {statusMessage.text}
          </p>
      )}
      {/* Indicador de Carga/Guardado */}
      {(isLoading || isSaving) && <p className={styles.loadingMessage}>{isLoading ? 'Cargando insumos...' : 'Guardando...'}</p>}

      <hr className={styles.divider} />

      <h2>Listado de Insumos</h2>
      {/* Renderizamos la lista con los datos leídos (o vacía si aún no carga) */}
      {!isLoading && (
        <InsumosList
            insumos={insumos}
            onEdit={handleEditInsumo}
            onDelete={handleDeleteInsumo}
            ivaPercentage={IVA_TEMPORAL}
        />
      )}

    </div>
  );
}

export default GestionInsumos;