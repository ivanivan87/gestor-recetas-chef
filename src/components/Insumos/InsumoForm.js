import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
// Quitamos import no usado 'Select' de react-select
import styles from './InsumoForm.module.css';
import { FaWarehouse, FaUserTag, FaTag, FaBox, FaDollarSign, FaWeightHanging, FaPlus } from 'react-icons/fa';
import { db } from '../../firebaseConfig'; // Verifica la ruta
import { collection, getDocs } from "firebase/firestore";

// Referencia a la colección de Firestore
const insumosCollectionRef = collection(db, "insumos");

// Datos iniciales y funciones de formato
const categoriasIniciales = ["Verdulería", "Carnicería", "Almacén", "Limpieza"];

// Estilos personalizados para react-select (ajustados para altura)
const INPUT_HEIGHT_PX = '38px'; // Altura objetivo
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided, boxSizing: 'border-box', height: INPUT_HEIGHT_PX, minHeight: INPUT_HEIGHT_PX,
    padding: '0 !important', border: state.isFocused ? '1px solid #80bdff' : '1px solid #ced4da',
    borderRadius: '4px', boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(0, 123, 255, 0.25)' : 'none',
    fontSize: '0.9rem', backgroundColor: state.isDisabled ? '#e9ecef' : 'white',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    '&:hover': { borderColor: state.isFocused ? '#80bdff' : '#adb5bd' }
  }),
  valueContainer: (provided) => ({ ...provided, paddingLeft: '35px', paddingRight: '2px', height: INPUT_HEIGHT_PX, alignItems: 'center', display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }),
  placeholder: (provided) => ({ ...provided, color: '#6c757d', fontSize: '0.9rem', marginLeft: '2px' }),
  input: (provided) => ({ ...provided, margin: '0', padding: '0', fontSize: '0.9rem', paddingLeft: '2px' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided, state) => ({ ...provided, padding: '6px', color: state.isDisabled ? '#ced4da' : '#adb5bd' }),
  menu: (provided) => ({ ...provided, fontSize: '0.9rem', zIndex: 1052 }),
  option: (provided, state) => ({ ...provided, fontSize: '0.9rem', backgroundColor: state.isSelected ? '#4e73df' : state.isFocused ? '#f8f9fc' : null, color: state.isSelected ? 'white' : '#495057', '&:active': { backgroundColor: !state.isSelected ? '#e9ecef' : null } }),
  createOption: (provided) => ({ ...provided, fontSize: '0.9rem' })
};


function InsumoForm({ insumoToEdit, onSave, onCancel }) {
  // --- ESTADOS ---
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [isAddingCategoria, setIsAddingCategoria] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(categoriasIniciales);
  const [proveedorOption, setProveedorOption] = useState(null); // Para react-select
  const [proveedorOptions, setProveedorOptions] = useState([]); // Opciones cargadas
  const [isLoadingProveedores, setIsLoadingProveedores] = useState(false);
  const [nombreInsumo, setNombreInsumo] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [precioKg, setPrecioKg] = useState('');
  const [precioTotal, setPrecioTotal] = useState(''); // Precio total de la presentación
  const isEditing = !!insumoToEdit;
  // --- FIN ESTADOS ---

  // --- useEffect para cargar proveedores ---
  useEffect(() => {
    let isMounted = true;
    const fetchProveedores = async () => {
      if (!isMounted) return; setIsLoadingProveedores(true); setProveedorOptions([]);
      console.log("InsumoForm Montado: Fetching proveedores...");
      try {
        const querySnapshot = await getDocs(insumosCollectionRef);
        if (!isMounted) return;
        const nombresProveedores = new Set();
        querySnapshot.forEach((doc) => { const prov = doc.data().proveedor?.trim(); if (prov) nombresProveedores.add(prov); });
        const options = [...nombresProveedores].map(nombre => ({ value: nombre, label: nombre }));
        console.log("Proveedores encontrados:", options);
        if (isMounted) setProveedorOptions(options);
      } catch (error) { console.error("Error fetching proveedores: ", error); /* alert(...) */ }
      finally { if (isMounted) setIsLoadingProveedores(false); }
    };
    fetchProveedores();
    return () => { isMounted = false; };
  }, []); // Solo al montar

  // --- useEffect para llenar/resetear formulario (DEPENDENCIA CORREGIDA) ---
  useEffect(() => {
    console.log("Effect Llenar/Reset Form: Editando?", isEditing, "Insumo:", insumoToEdit);
    if (insumoToEdit) {
      console.log("  Llenando formulario para editar...");
      setCategoria(insumoToEdit.categoria || '');
      let provOption = null;
      if (insumoToEdit.proveedor) {
          // Usa las opciones actuales, si falla la carga inicial, puede que no encuentre
          provOption = proveedorOptions.find(opt => opt.value === insumoToEdit.proveedor);
           if (!provOption) {
                provOption = { value: insumoToEdit.proveedor, label: insumoToEdit.proveedor };
                console.log("  Proveedor a editar no encontrado en opciones, usando temporal:", provOption);
           }
      } else {
          provOption = null; // Asegurar que sea null si no hay proveedor
      }
      setProveedorOption(provOption);
      setNombreInsumo(insumoToEdit.nombre || ''); setPresentacion(insumoToEdit.presentacion || '');
      setPrecioKg(insumoToEdit.precioPorKg?.toString() || ''); setPrecioTotal(insumoToEdit.precioTotalPresentacion?.toString() || '');
      setIsAddingCategoria(false); setNuevaCategoria('');
      if (insumoToEdit.categoria && !categoriasDisponibles.includes(insumoToEdit.categoria)) { setCategoriasDisponibles(prev => [...prev, insumoToEdit.categoria]); }
    } else {
      // Resetear solo si el modo es explícitamente 'Añadir' (isEditing es false)
      if (!isEditing) {
           console.log("  Reseteando formulario para añadir nuevo...");
           setCategoria(''); setProveedorOption(null); setNombreInsumo(''); setPresentacion('');
           setPrecioKg(''); setPrecioTotal(''); setIsAddingCategoria(false); setNuevaCategoria('');
      }
    }
  // Ejecutar SOLO si cambia el insumo a editar o el modo (isEditing)
  // Quitamos proveedorOptions de aquí para evitar el reset indeseado
  }, [insumoToEdit, isEditing]);
  // --- FIN useEffect Llenar/Reset ---


  // --- useEffect para cálculo automático de precio total ---
  useEffect(() => {
    const currentPresentacion = presentacion?.trim().toLowerCase();
    const kgPrice = parseFloat(precioKg);
    console.log(`Check PrecioTotal -> Pres: '${currentPresentacion}', PxKg: ${kgPrice}`);
    if (currentPresentacion === 'kg' && !isNaN(kgPrice) && kgPrice >= 0) {
      const newPrecioTotal = kgPrice.toFixed(2);
      setPrecioTotal(newPrecioTotal);
      console.log("  setPrecioTotal llamado con (calculado):", newPrecioTotal);
    } else {
       console.log(" -> No es 'kg' o PrecioKg inválido, no se calcula automáticamente.");
       // No limpiamos el valor aquí para permitir edición manual
    }
  }, [precioKg, presentacion]); // Depende solo de estos


  // --- Handlers Categoría ---
  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    console.log(`handleCategoriaChange llamado con valor: ${value}`);
    if (value === 'add_new') { setIsAddingCategoria(true); setCategoria(''); }
    else { setIsAddingCategoria(false); setNuevaCategoria(''); setCategoria(value); } // Aquí se setea la categoría seleccionada
  };

  // --- Handlers Proveedor ---
  const handleProveedorChange = (selectedOption) => {
    console.log("Proveedor seleccionado:", selectedOption);
    setProveedorOption(selectedOption); // Aquí se setea la opción seleccionada (existente o recién creada)
  };
  const handleCreateProveedor = (inputValue) => {
      console.log("Intentando crear proveedor:", inputValue);
      const nombreProveedor = inputValue.trim();
      if (!nombreProveedor) return;
      const nuevaOpcion = { value: nombreProveedor, label: nombreProveedor };
      // Añadir a la lista local y seleccionar
      setProveedorOptions(prev => { if (prev.some(opt => opt.value === nuevaOpcion.value)) return prev; return [...prev, nuevaOpcion]; });
      setProveedorOption(nuevaOpcion); // Seleccionar inmediatamente
      console.log("Nueva opción creada y seleccionada localmente:", nuevaOpcion);
  };

  // --- Handler Submit ---
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit ejecutado. Estado actual:", {categoria, proveedorOption, nombreInsumo, precioKg, precioTotal, isAddingCategoria, nuevaCategoria});
    if (!nombreInsumo || !precioKg) { alert('Por favor, completa nombre y precio Kg.'); return; }
    let categoriaFinal = categoria;
    // Lógica para añadir nueva categoría si aplica
    if (isAddingCategoria && nuevaCategoria.trim() !== '') {
        categoriaFinal = nuevaCategoria.trim();
        if (!categoriasDisponibles.includes(categoriaFinal)) { setCategoriasDisponibles(prev => [...prev, categoriaFinal]); }
        setCategoria(categoriaFinal); // Asegurar que el estado 'categoria' tenga el valor correcto
        setIsAddingCategoria(false); setNuevaCategoria('');
    } else if (!categoria && !isAddingCategoria) { // Validar que se haya seleccionado o añadido una categoría
       alert('Selecciona o añade una categoría.'); return;
    }

    // Obtener nombre del proveedor desde el estado 'proveedorOption'
    const proveedorNombre = proveedorOption ? proveedorOption.value : '';

    // Validar y parsear precios
    const precioKgNum = parseFloat(precioKg) || 0;
    let precioTotalNum = parseFloat(precioTotal) || 0;

    // Re-asegurar el cálculo de precioTotal si la presentación es 'kg'
    if (presentacion?.trim().toLowerCase() === 'kg') {
        precioTotalNum = precioKgNum;
        // Actualizar estado por si acaso no se reflejó por timing (aunque el effect debería hacerlo)
        if (precioTotal !== precioKgNum.toFixed(2)) {
             setPrecioTotal(precioKgNum.toFixed(2));
        }
    } else if (isNaN(precioTotalNum) || precioTotalNum <= 0) {
        // Si no es kg y el precio total es inválido, quizás alertar o poner = precioKg?
        // Por ahora, lo dejamos como 0 si es inválido y no es 'kg'
        precioTotalNum = 0;
        console.warn("Precio Total Presentación inválido o cero, guardando 0.");
    }


    const insumoData = {
      categoria: categoriaFinal,
      proveedor: proveedorNombre,
      nombre: nombreInsumo.trim(), // Guardar sin espacios extra
      presentacion: presentacion.trim(),
      precioPorKg: precioKgNum,
      precioTotalPresentacion: precioTotalNum
    };
    console.log("Datos finales a guardar:", insumoData);
    onSave(insumoData, insumoToEdit ? insumoToEdit.id : null); // Llama a handleDoSaveInsumo
  };


  return (
    <form onSubmit={handleSubmit} className={styles.insumoForm}>
      {/* Sección Categoría */}
      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="categoria">Categoría:</label>
            <div className={styles.inputWrapper}>
              <select id="categoria" value={isAddingCategoria ? 'add_new' : categoria} onChange={handleCategoriaChange} required className={styles.select}>
                 <option value="" disabled>-- Selecciona --</option>
                 {categoriasDisponibles.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                 <option value="add_new">-- Añadir Nueva Categoría --</option>
              </select>
            </div>
          </div>
          {isAddingCategoria && ( <div className={styles.formGroup}><label htmlFor="nuevaCategoria">Nueva Categoría:</label><div className={styles.inputWrapper}><FaPlus className={styles.inputIcon} /><input type="text" id="nuevaCategoria" value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="Nombre nueva categoría" className={styles.input}/></div></div>)}
          {!isAddingCategoria && <div className={styles.formGroup} style={{ visibility: 'hidden' }}></div> }
        </div>
      </div>

      {/* Sección Identificación */}
      <div className={styles.formSection}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="proveedor">Proveedor:</label>
            <div className={styles.inputWrapper}>
                <FaUserTag className={styles.inputIcon} />
                <CreatableSelect
                  instanceId="proveedor-select-insumo-final"
                  inputId="proveedor" isClearable isSearchable placeholder="Busca o crea..."
                  options={proveedorOptions} value={proveedorOption}
                  onChange={handleProveedorChange} onCreateOption={handleCreateProveedor}
                  isLoading={isLoadingProveedores} isDisabled={isLoadingProveedores}
                  formatCreateLabel={(inputValue) => `Crear proveedor "${inputValue}"`}
                  styles={customSelectStyles} // Estilos aplicados
                  noOptionsMessage={() => isLoadingProveedores ? 'Cargando...' : 'No hay proveedores existentes'}
                />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="nombreInsumo">Nombre Insumo:</label>
            <div className={styles.inputWrapper}><FaTag className={styles.inputIcon} /><input type="text" id="nombreInsumo" value={nombreInsumo} onChange={(e) => setNombreInsumo(e.target.value)} placeholder="Ej: Tomate Perita" required className={styles.input}/></div>
          </div>
        </div>
      </div>

      {/* Sección Precios y Presentación */}
      <div className={styles.formSection}>
         <div className={styles.formRow}>
            <div className={styles.formGroup}><label htmlFor="presentacion">Presentación:</label><div className={styles.inputWrapper}><FaBox className={styles.inputIcon} /><input type="text" id="presentacion" value={presentacion} onChange={(e) => setPresentacion(e.target.value)} placeholder="Ej: kg, Paquete 500g" className={styles.input}/></div></div>
            <div className={styles.formGroup}><label htmlFor="precioKg">Precio por Kg/Lt:</label><div className={styles.inputWrapper}><FaWeightHanging className={styles.inputIcon} /><input type="number" id="precioKg" value={precioKg} onChange={(e) => setPrecioKg(e.target.value)} placeholder="Ej: 150.50" required min="0" step="0.01" className={styles.input}/></div></div>
         </div>
         <div className={styles.formRow}>
             <div className={styles.formGroup}><label htmlFor="precioTotal">Precio Total (Presentación):</label><div className={styles.inputWrapper}><FaDollarSign className={styles.inputIcon} /><input type="number" id="precioTotal" value={precioTotal} onChange={(e) => setPrecioTotal(e.target.value)} placeholder="Costo total del item" min="0" step="0.01" className={styles.input} disabled={!isEditing && presentacion?.trim().toLowerCase() === 'kg'}/></div><small>Se calcula si la presentación es 'kg'. Si no, ingrésalo.</small></div>
             {/* Placeholder para alinear */}
             <div className={styles.formGroup} style={{ visibility: 'hidden' }}></div>
         </div>
      </div>

      {/* Botones */}
      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.saveButton} disabled={isLoadingProveedores}> {isEditing ? 'Actualizar Insumo' : 'Guardar Insumo'} </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
      </div>
    </form>
  );
}

export default InsumoForm;