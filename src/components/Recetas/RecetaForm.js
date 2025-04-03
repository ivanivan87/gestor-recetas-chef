import React, { useState, useEffect, useRef } from 'react'; // Asegúrate que useRef esté importado
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import styles from './RecetaForm.module.css';
import { FaPizzaSlice, FaClipboardList, FaPlus, FaTrashAlt, FaCalculator, FaPercentage, FaDollarSign, FaBalanceScale, FaTimes } from 'react-icons/fa';

// --- DATOS Y CONSTANTES ---
const listaInsumosDisponibles = [ { id: '1', nombre: 'Tomate Perita', precioPorKg: 150.00, unidadBase: 'kg' }, { id: '2', nombre: 'Harina 0000', precioPorKg: 90.00, unidadBase: 'kg' }, { id: '3', nombre: 'Aceite Girasol', precioPorKg: 210.00, unidadBase: 'lt' }, { id: '4', nombre: 'Lomo Novillo', precioPorKg: 950.50, unidadBase: 'kg' }, { id: '5', nombre: 'Huevo', precioPorKg: 0, precioPorUnidad: 30.00, unidadBase: 'unidad'}, { id: '6', nombre: 'Pan Rallado', precioPorKg: 180.00, unidadBase: 'kg'}, ];
const configGlobal = { overheadPercentage: 15, profitMargin: 40, ivaPercentage: 21 }; // Temporal
const unidadesReceta = ['g', 'kg', 'ml', 'l', 'unidad', 'pieza', 'cucharada', 'taza'];
const categoriasPlatoIniciales = ['Entrada', 'Plato Principal', 'Postre', 'Minuta', 'Guarnición'];
const formatInsumosOptions = (insumos) => insumos.map(ins => ({ value: ins.id, label: ins.nombre, ...ins }));
const formatCategoriasOptions = (categorias) => categorias.map(cat => ({ value: cat, label: cat }));
// --- FIN DATOS Y CONSTANTES ---

function RecetaForm({ recetaToEdit, onSave, onCancel }) {
  // --- ESTADOS ---
  const [nombreReceta, setNombreReceta] = useState('');
  const [categoriaPlatoOption, setCategoriaPlatoOption] = useState(null);
  const [categoriasPlatoOptions, setCategoriasPlatoOptions] = useState(formatCategoriasOptions(categoriasPlatoIniciales));
  const [ingredientesReceta, setIngredientesReceta] = useState([]);
  const [insumoSeleccionadoOption, setInsumoSeleccionadoOption] = useState(null);
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('g');
  const [costoVariableTotal, setCostoVariableTotal] = useState(0);
  const [costoFijoCalculado, setCostoFijoCalculado] = useState(0);
  const [costoTotalBase, setCostoTotalBase] = useState(0);
  const [gananciaCalculada, setGananciaCalculada] = useState(0);
  const [precioSinIVA, setPrecioSinIVA] = useState(0);
  const [precioFinalConIVA, setPrecioFinalConIVA] = useState(0);
  const isEditing = !!recetaToEdit;
  // --- FIN ESTADOS ---

  // --- REF PARA FOCUS ---
  const insumoSelectRef = useRef(null);
  // --- FIN REF ---

  const insumosOptions = formatInsumosOptions(listaInsumosDisponibles);

  // --- useEffect para llenar form al editar ---
  useEffect(() => {
     if (recetaToEdit) {
        setNombreReceta(recetaToEdit.nombre || '');
        let catOption = categoriasPlatoOptions.find(opt => opt.value === recetaToEdit.categoria);
        if (!catOption && recetaToEdit.categoria) {
            catOption = { value: recetaToEdit.categoria, label: recetaToEdit.categoria };
            setCategoriasPlatoOptions(prev => [...prev, catOption]);
        }
        setCategoriaPlatoOption(catOption || null);
        // TODO: Cargar ingredientes correctamente al editar (necesita más lógica)
        setIngredientesReceta(recetaToEdit.ingredientesParseados || recetaToEdit.ingredientes || []);
        console.log("Cargando datos para editar:", recetaToEdit);
     } else {
       if (!isEditing) {
            setNombreReceta(''); setCategoriaPlatoOption(null); setIngredientesReceta([]);
            setInsumoSeleccionadoOption(null); setCantidad(''); setUnidad('g');
            console.log("Formulario reseteado para añadir.");
       }
     }
   }, [recetaToEdit, isEditing, categoriasPlatoOptions]); // Dependencias correctas

  // --- useEffect para calcular costos (CON LOGS DETALLADOS) ---
  useEffect(() => {
      console.log("%c--- Recalculando Costos ---", "color: blue; font-weight: bold;");
      console.log("Ingredientes Actuales:", JSON.stringify(ingredientesReceta, null, 2));
      let costoVarTotal = 0;
      ingredientesReceta.forEach((ing, index) => {
          console.log(`\nProcesando ingrediente ${index + 1}: ${ing.nombre}`);
          let costoIngrediente = 0;
          const cant = parseFloat(ing.cantidad);
          const precioKg = parseFloat(ing.precioPorKg);
          const precioUnidad = parseFloat(ing.precioPorUnidad);
          const unidadBase = ing.unidadBase?.toLowerCase();
          const unidadReceta = ing.unidad?.toLowerCase();
          console.log(`  Cantidad: ${cant}, Unidad Receta: ${unidadReceta}`);
          console.log(`  Datos Insumo -> UB: ${unidadBase}, PKg: ${precioKg}, PUni: ${precioUnidad}`);
          if (isNaN(cant) || cant <= 0) { costoIngrediente = 0; console.warn(`  Cantidad inválida (${ing.cantidad}). Costo 0.`); }
          else if (unidadBase === 'kg' && !isNaN(precioKg) && precioKg > 0) {
              if (unidadReceta === 'kg') { costoIngrediente = cant * precioKg; console.log(`  Calc(kg>kg): ${cant}*${precioKg}=${costoIngrediente}`); }
              else if (unidadReceta === 'g') { costoIngrediente = (cant / 1000) * precioKg; console.log(`  Calc(g>kg): (${cant}/1000)*${precioKg}=${costoIngrediente}`);}
              else { costoIngrediente = 0; console.warn(`  Unidad '${unidadReceta}' no compatible con base '${unidadBase}'. Costo 0.`); }
          } else if (unidadBase === 'lt' && !isNaN(precioKg) && precioKg > 0) {
              if (unidadReceta === 'l') { costoIngrediente = cant * precioKg; console.log(`  Calc(l>lt): ${cant}*${precioKg}=${costoIngrediente}`); }
              else if (unidadReceta === 'ml') { costoIngrediente = (cant / 1000) * precioKg; console.log(`  Calc(ml>lt): (${cant}/1000)*${precioKg}=${costoIngrediente}`);}
              else { costoIngrediente = 0; console.warn(`  Unidad '${unidadReceta}' no compatible con base '${unidadBase}'. Costo 0.`); }
          } else if (unidadBase === 'unidad' && !isNaN(precioUnidad) && precioUnidad > 0) {
               if (unidadReceta === 'unidad' || unidadReceta === 'pieza') { costoIngrediente = cant * precioUnidad; console.log(`  Calc(uni): ${cant}*${precioUnidad}=${costoIngrediente}`); }
               else { costoIngrediente = 0; console.warn(`  Unidad '${unidadReceta}' no compatible con base '${unidadBase}'. Costo 0.`); }
          } else { costoIngrediente = 0; console.warn(`  Precio base no encontrado para ${ing.nombre}. UB:'${unidadBase}', PKg:${precioKg}, PUni:${precioUnidad}. Costo 0.`); }
          costoVarTotal += costoIngrediente;
      });
      console.log("\nCVT Calculado:", costoVarTotal); setCostoVariableTotal(costoVarTotal);
      const overheadRate = (configGlobal.overheadPercentage || 0)/100; const marginRate = (configGlobal.profitMargin || 0)/100; const ivaRate = (configGlobal.ivaPercentage || 0)/100;
      const costoFijo = costoVarTotal * overheadRate; const costoBase = costoVarTotal + costoFijo; const ganancia = costoBase * marginRate; const precioSinIVA = costoBase + ganancia; const ivaCalculado = precioSinIVA * ivaRate; const precioConIVA = precioSinIVA + ivaCalculado;
      console.log(`Conf-> OH:${configGlobal.overheadPercentage}%, MG:${configGlobal.profitMargin}%, IVA:${configGlobal.ivaPercentage}%`);
      console.log("CFijo:", costoFijo, "| CBase:", costoBase, "| Gan:", ganancia, "| PSI:", precioSinIVA, "| IVA:", ivaCalculado, "| PFC:", precioConIVA);
      setCostoFijoCalculado(costoFijo); setCostoTotalBase(costoBase); setGananciaCalculada(ganancia); setPrecioSinIVA(precioSinIVA); setPrecioFinalConIVA(precioConIVA);
      console.log("--- Fin Recálculo Costos ---");
  }, [ingredientesReceta]);

  // --- useEffect para auto-seleccionar unidad ---
  useEffect(() => {
    if (!isEditing || (isEditing && insumoSeleccionadoOption?.value !== recetaToEdit?.ingredientes?.find(i => i.insumoId === insumoSeleccionadoOption?.value)?.insumoId ) ) {
        if (insumoSeleccionadoOption) {
            const unidadBase = insumoSeleccionadoOption.unidadBase?.toLowerCase();
            console.log(`Insumo (${insumoSeleccionadoOption.label}) tiene UB: ${unidadBase}. Sugiriendo unidad.`);
            if (unidadBase === 'kg') { setUnidad('g'); }
            else if (unidadBase === 'lt') { setUnidad('ml'); }
            else if (unidadBase === 'unidad') { setUnidad('unidad'); }
            else { setUnidad('g'); }
        }
    } else if (isEditing && insumoSeleccionadoOption === null) {
        setUnidad('g');
    }
  }, [insumoSeleccionadoOption, isEditing, recetaToEdit]);


  // --- Handlers react-select ---
  const handleCategoriaPlatoChange = (selectedOption) => setCategoriaPlatoOption(selectedOption);
  const handleCreateCategoriaPlato = (inputValue) => { const nuevaOpcion = { value: inputValue, label: inputValue }; setCategoriasPlatoOptions(prev => [...prev, nuevaOpcion]); setCategoriaPlatoOption(nuevaOpcion); };
  const handleInsumoSelectChange = (selectedOption) => { setInsumoSeleccionadoOption(selectedOption); if (!selectedOption) { setUnidad('g'); } };

  // --- Añadir Ingrediente (CON FOCUS) ---
   const handleAddIngrediente = () => {
    console.log("handleAddIngrediente ejecutado...");
    if (!insumoSeleccionadoOption || !cantidad || !unidad) { alert("Selecciona insumo, cantidad y unidad."); return; }
    const insumoEncontrado = insumoSeleccionadoOption;
    if (ingredientesReceta.some(ing => ing.insumoId === insumoEncontrado.value)) { alert(`${insumoEncontrado.label} ya está en la receta.`); return; }
    const nuevoIngrediente = { insumoId: insumoEncontrado.value, nombre: insumoEncontrado.label, cantidad: parseFloat(cantidad) || 0, unidad: unidad, precioPorKg: insumoEncontrado.precioPorKg, precioPorUnidad: insumoEncontrado.precioPorUnidad, unidadBase: insumoEncontrado.unidadBase, };
    console.log("Añadiendo ingrediente:", nuevoIngrediente);
    setIngredientesReceta(prev => [...prev, nuevoIngrediente]);
    setInsumoSeleccionadoOption(null); setCantidad(''); setUnidad('g');
    // Hacer focus en el selector de insumos
    insumoSelectRef.current?.focus();
    console.log("Foco devuelto al selector de insumos.");
  };

   // --- Quitar Ingrediente ---
   const handleRemoveIngrediente = (id) => { console.log("Quitando ingrediente ID:", id); setIngredientesReceta(prev => prev.filter(ing => ing.insumoId !== id)); };

  // --- Submit ---
  const handleSubmit = (e) => {
      e.preventDefault();
      const categoriaPlatoValue = categoriaPlatoOption ? categoriaPlatoOption.value : '';
      if (!nombreReceta || !categoriaPlatoValue || ingredientesReceta.length === 0) {
          alert("Completa nombre, categoría y añade ingredientes."); return;
      }
      const recetaData = {
          nombre: nombreReceta,
          categoria: categoriaPlatoValue,
          ingredientes: ingredientesReceta.map(ing => ({ // Guardar solo lo necesario
              insumoId: ing.insumoId,
              cantidad: ing.cantidad,
              unidad: ing.unidad
          })),
          // Opcional: guardar costos calculados en el momento
          costoVariableCalculado: costoVariableTotal,
          precioVentaCalculado: precioFinalConIVA,
      };
      onSave(recetaData, recetaToEdit ? recetaToEdit.id : null);
  };

  // --- formatCurrency ---
  const formatCurrency = (n) => {
      const num = Number(n);
      if (isNaN(num)) return '-';
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
   };

  // Log ANTES del return
  console.log("--- Estado ANTES de Renderizar JSX ---");
  console.log("CVT:", costoVariableTotal, "PFC:", precioFinalConIVA);
  console.log("-------------------------------------");

  return (
    <form onSubmit={handleSubmit} className={styles.recetaForm}>
      {/* Contenedor Columnas */}
      <div className={styles.formColumnsContainer}>
        {/* Columna Izquierda */}
        <div className={styles.leftColumn}>
           {/* Sección Datos Receta */}
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Datos de la Receta</h4>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="nombreReceta"><FaPizzaSlice className={styles.icon}/> Nombre Receta:</label>
                <input type="text" id="nombreReceta" value={nombreReceta} onChange={(e) => setNombreReceta(e.target.value)} required className={styles.input}/>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="categoriaPlato"><FaClipboardList className={styles.icon}/> Categoría Plato:</label>
                <CreatableSelect instanceId="categoria-select" id="categoriaPlato" isClearable placeholder="Selecciona o crea..." options={categoriasPlatoOptions} value={categoriaPlatoOption} onChange={handleCategoriaPlatoChange} onCreateOption={handleCreateCategoriaPlato} formatCreateLabel={(inputValue) => `Crear "${inputValue}"`} required styles={customSelectStyles} />
              </div>
            </div>
          </div>
           {/* Sección Añadir Ingredientes */}
          <div className={styles.formSection}>
             <h4 className={styles.sectionTitle}>Añadir Ingrediente</h4>
             <div className={styles.addIngredienteRow}>
               <div className={styles.formGroup} style={{flexBasis: '40%'}}>
                 <label htmlFor="insumoSelect">Insumo:</label>
                 <Select ref={insumoSelectRef} instanceId="insumo-select" id="insumoSelect" options={insumosOptions} value={insumoSeleccionadoOption} onChange={handleInsumoSelectChange} placeholder="Busca o selecciona..." isClearable isSearchable styles={customSelectStyles}/>
               </div>
               <div className={styles.formGroup} style={{flexBasis: '20%'}}>
                 <label htmlFor="cantidad">Cantidad:</label>
                 <input type="number" id="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="0" step="any" className={styles.input} placeholder="Ej: 100"/>
               </div>
               <div className={styles.formGroup} style={{flexBasis: '20%'}}>
                 <label htmlFor="unidad">Unidad:</label>
                 {/* El valor de este select se actualiza por el useEffect [insumoSeleccionadoOption] */}
                 <select id="unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} className={styles.select}>
                    {unidadesReceta.map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
               </div>
               <div className={styles.formGroup} style={{flexBasis: '15%', alignSelf: 'flex-end'}}>
                 <button type="button" onClick={handleAddIngrediente} className={styles.addButton} disabled={!insumoSeleccionadoOption || !cantidad}>
                    <FaPlus /> Añadir
                 </button>
               </div>
             </div>
          </div>
        </div>{/* Fin Columna Izquierda */}

        {/* Columna Derecha */}
        <div className={styles.rightColumn}>
          {/* Sección Desglose Costos */}
          <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Cálculo de Costos (Estimado)</h4>
              <div className={styles.costGrid}>
                  <div><FaBalanceScale className={styles.icon}/> C. Variable:</div><div>{formatCurrency(costoVariableTotal)}</div>
                  <div><FaPercentage className={styles.icon}/> + G.Grales ({configGlobal.overheadPercentage}%):</div><div>{formatCurrency(costoFijoCalculado)}</div>
                  <div className={styles.costSeparator}></div><div className={styles.costSeparator}></div>
                  <div><strong>Costo Base:</strong></div><div><strong>{formatCurrency(costoTotalBase)}</strong></div>
                  <div><FaPercentage className={styles.icon}/> + Margen ({configGlobal.profitMargin}%):</div><div>{formatCurrency(gananciaCalculada)}</div>
                  <div className={styles.costSeparator}></div><div className={styles.costSeparator}></div>
                  <div><strong>Subtotal:</strong></div><div><strong>{formatCurrency(precioSinIVA)}</strong></div>
                  <div><FaPercentage className={styles.icon}/> + IVA ({configGlobal.ivaPercentage}%):</div><div>{formatCurrency(precioSinIVA * (configGlobal.ivaPercentage / 100))}</div>
                  <div className={styles.costSeparatorTotal}></div><div className={styles.costSeparatorTotal}></div>
                  <div className={styles.finalPriceLabel}><FaDollarSign className={styles.icon}/> P. VENTA:</div><div className={styles.finalPriceValue}>{formatCurrency(precioFinalConIVA)}</div>
              </div>
              <small>Costos estimados según config. global.</small>
          </div>
        </div>{/* Fin Columna Derecha */}
      </div>{/* Fin Contenedor Columnas */}

      {/* Sección Ingredientes Añadidos (Debajo) */}
      {ingredientesReceta.length > 0 && (
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Ingredientes Añadidos</h4>
            <div className={styles.inlineIngredientContainer}>
                {ingredientesReceta.map((ing) => (
                  <span key={ing.insumoId} className={styles.ingredientTag}>
                      {ing.nombre} - {ing.cantidad} {ing.unidad}
                      <button type="button" onClick={() => handleRemoveIngrediente(ing.insumoId)} className={styles.removeTagButton} title="Quitar"><FaTimes /></button>
                  </span>
                ))}
            </div>
          </div>
      )}

      {/* Botones Principales */}
      <div className={styles.mainButtonGroup}> <button type="submit" className={styles.saveButton}>{isEditing ? 'Actualizar Receta' : 'Guardar Receta'}</button> <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button> </div>
    </form>
  );
}

// --- ESTILOS PERSONALIZADOS PARA REACT-SELECT ---
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided, minHeight: 'unset',
    height: `calc(2 * 8px + 0.9rem + 2 * 1px + 2px)`, // Ajustado para coincidir con input/select
    padding: '0 !important',
    border: state.isFocused ? '1px solid #80bdff' : '1px solid #ced4da',
    borderRadius: '4px',
    boxShadow: state.isFocused ? '0 0 0 0.15rem rgba(0, 123, 255, 0.25)' : 'none',
    fontSize: '0.9rem',
    '&:hover': { borderColor: state.isFocused ? '#80bdff' : '#adb5bd' }
  }),
  valueContainer: (provided) => ({ ...provided, padding: '0px 8px', height: `calc(2 * 8px + 0.9rem + 2 * 1px)` }),
  placeholder: (provided) => ({ ...provided, color: '#6c757d', fontSize: '0.9rem' }),
  input: (provided) => ({ ...provided, margin: '0px', padding: '0px', fontSize: '0.9rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided) => ({ ...provided, padding: '6px', color: '#ced4da' }),
  menu: (provided) => ({ ...provided, fontSize: '0.9rem', zIndex: 1052 }), // z-index alto para menú
  option: (provided, state) => ({ ...provided, fontSize: '0.9rem', backgroundColor: state.isSelected ? '#4e73df' : state.isFocused ? '#f8f9fc' : null, color: state.isSelected ? 'white' : '#495057', '&:active': { backgroundColor: !state.isSelected ? '#e9ecef' : null } }),
  createOption: (provided) => ({ ...provided, fontSize: '0.9rem' })
};
// --- FIN ESTILOS REACT-SELECT ---

export default RecetaForm;