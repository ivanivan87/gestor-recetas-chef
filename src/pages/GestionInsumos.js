import React, { useState, useEffect, useMemo } from 'react';
import { useModalControl } from '../components/MainLayout';
import InsumosList from '../components/Insumos/InsumosList';
import styles from './GestionInsumos.module.css';
import { FaPlusCircle, FaSearch } from 'react-icons/fa';

// --- Importar Firestore ---
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; // Todas las funciones necesarias

// --- Importar toast ---
import toast from 'react-hot-toast'; // <-- IMPORTANTE AÑADIR

// Referencia a la colección 'insumos'
const insumosCollectionRef = collection(db, "insumos");

const IVA_TEMPORAL = 21; // Temporal

function GestionInsumos() {
  const { openModal, closeModal } = useModalControl();

  const [insumos, setInsumos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // const [statusMessage, setStatusMessage] = useState({ type: '', text: '' }); // Eliminado
  const [searchTerm, setSearchTerm] = useState('');

  // useEffect para LEER insumos
  useEffect(() => {
    const fetchInsumos = async () => {
      setIsLoading(true); // setStatusMessage({ type: '', text: '' }); // No necesario
      console.log("GestionInsumos Montado: Fetching insumos...");
      try {
        const data = await getDocs(insumosCollectionRef);
        const insumosData = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        insumosData.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        setInsumos(insumosData);
      } catch (error) { console.error("Error obteniendo insumos: ", error); toast.error('Error al cargar los insumos.'); setInsumos([]); }
      finally { setIsLoading(false); }
    };
    fetchInsumos();
  }, []);

  // Lógica de Filtrado
  const filteredInsumos = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerCaseSearchTerm) return insumos;
    if (!Array.isArray(insumos)) return [];
    return insumos.filter(insumo => {
        const nombre = insumo.nombre || ''; const categoria = insumo.categoria || '';
        const proveedor = insumo.proveedor || ''; const presentacion = insumo.presentacion || '';
        return ( nombre.toLowerCase().includes(lowerCaseSearchTerm) || categoria.toLowerCase().includes(lowerCaseSearchTerm) || proveedor.toLowerCase().includes(lowerCaseSearchTerm) || presentacion.toLowerCase().includes(lowerCaseSearchTerm) );
    });
  }, [insumos, searchTerm]);

  // Handlers para abrir modales
  const handleOpenAddForm = () => { /*setStatusMessage({ type: '', text: '' });*/ openModal('addInsumo', { onSave: handleDoSaveInsumo }); };
  const handleEditInsumo = (insumo) => { /*setStatusMessage({ type: '', text: '' });*/ openModal('editInsumo', { insumoData: insumo, onSave: handleDoSaveInsumo }); };
  const handleDeleteInsumo = (insumo) => { /*setStatusMessage({ type: '', text: '' });*/ openModal('confirmDeleteInsumo', { title: "Confirmar Eliminación", message: `¿Seguro que deseas eliminar "${insumo.nombre}"?`, id: insumo.id, confirmAction: () => handleDoDeleteInsumo(insumo.id) }); };

  // --- FUNCIONES CRUD CON FIRESTORE (Usando toast) ---
  // Guardar (Añadir o Editar)
  const handleDoSaveInsumo = async (insumoData, insumoIdOriginal) => {
    setIsSaving(true);
    const dataToSave = { ...insumoData, precioPorKg: Number(insumoData.precioPorKg) || 0, precioTotalPresentacion: Number(insumoData.precioTotalPresentacion) || 0 };
    const operationPromise = insumoIdOriginal
        ? updateDoc(doc(db, "insumos", insumoIdOriginal), dataToSave)
        : addDoc(insumosCollectionRef, dataToSave);

    await toast.promise( operationPromise, {
       loading: insumoIdOriginal ? 'Actualizando...' : 'Añadiendo...',
       success: (result) => {
            if (insumoIdOriginal) { setInsumos(prev => { const u = prev.map(i => i.id === insumoIdOriginal ? { ...dataToSave, id: i.id } : i); u.sort((a,b)=>a.nombre.localeCompare(b.nombre)); return u; }); }
            else { setInsumos(prev => { const n = [...prev, { ...dataToSave, id: result.id }]; n.sort((a,b)=>a.nombre.localeCompare(b.nombre)); return n; }); }
            closeModal();
            return `Insumo "${dataToSave.nombre}" ${insumoIdOriginal ? 'actualizado' : 'añadido'}!`; },
       error: (err) => { console.error("Error Firestore:", err); return `Error: ${err.message}`; }
    });
    setIsSaving(false);
  };

  // Borrar (Usando toast y deleteDoc)
  const handleDoDeleteInsumo = async (idInsumo) => {
      if (!idInsumo) { toast.error('Error: ID inválido.'); return Promise.reject("ID inválido"); } // Devolver promesa rechazada
      setIsSaving(true); // Todavía útil para deshabilitar botones si es necesario
      const deletePromise = deleteDoc(doc(db, "insumos", idInsumo)); // La promesa de borrado

      // Envolvemos la promesa en toast.promise
      return toast.promise( deletePromise, {
          loading: 'Eliminando insumo...',
          success: () => {
              console.log("Firestore: Documento eliminado.");
              setInsumos(prevInsumos => prevInsumos.filter(i => i.id !== idInsumo)); // Actualizar UI
              setIsSaving(false); // Quitar carga
              return 'Insumo eliminado exitosamente.'; // Mensaje para toast
          },
          error: (err) => {
              console.error("Error eliminando: ", err);
              setIsSaving(false); // Quitar carga
              // Devolver mensaje para toast
              return err.code === 'permission-denied' ? 'Error de permisos al eliminar.' : 'Error al eliminar el insumo.';
          }
      });
      // Ya no necesitamos try/catch/finally aquí si toast.promise lo maneja
  };

  // --- JSX ---
  return (
    <div className={styles.gestionContainer}>
      <h1>Gestión de Insumos / Materia Prima</h1>
      <div className={styles.actionBar}> <button onClick={handleOpenAddForm} className={styles.toggleFormButton} disabled={isSaving || isLoading}> <FaPlusCircle style={{marginRight: '8px'}}/> Añadir Nuevo Insumo </button> <div className={styles.searchWrapper}> <FaSearch className={styles.searchIcon} /> <input type="text" placeholder="Buscar..." className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> </div> </div>

      {/* Ya no se necesita el statusMessage estático */}
      {(isLoading || isSaving) && <p className={styles.loadingMessage}>{isLoading ? 'Cargando...' : 'Procesando...'}</p>}

      <hr className={styles.divider} />
      <h2>Listado de Insumos</h2>
      {!isLoading && ( <InsumosList insumos={filteredInsumos} onEdit={handleEditInsumo} onDelete={handleDeleteInsumo} ivaPercentage={IVA_TEMPORAL} /> )}
      {isLoading && <p className={styles.loadingMessage}>Cargando lista...</p>}
      {!isLoading && !insumos.length && !searchTerm && ( <p className={styles.emptyMessage}>No hay insumos registrados.</p> )}
      {!isLoading && insumos.length > 0 && !filteredInsumos.length && searchTerm && ( <p className={styles.emptyMessage}>No se encontraron insumos para "{searchTerm}".</p> )}
    </div>
  );
}

export default GestionInsumos;