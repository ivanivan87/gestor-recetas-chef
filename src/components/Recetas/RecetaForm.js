import React, { useState, useEffect } from 'react';
import styles from './RecetaForm.module.css';
// Importa iconos necesarios
import { FaPizzaSlice, FaClipboardList, FaPlus, FaTrashAlt, FaCalculator, FaPercentage, FaDollarSign, FaBalanceScale } from 'react-icons/fa';

// --- DATOS DE EJEMPLO PARA INSUMOS (Reemplazar con Fetch a Firestore) ---
const listaInsumosDisponibles = [
  { id: '1', nombre: 'Tomate Perita', precioPorKg: 150.00, unidadBase: 'kg' },
  { id: '2', nombre: 'Harina 0000', precioPorKg: 90.00, unidadBase: 'kg' },
  { id: '3', nombre: 'Aceite Girasol', precioPorKg: 210.00, unidadBase: 'lt' }, // Asumir Lt ~ Kg para costo
  { id: '4', nombre: 'Lomo Novillo', precioPorKg: 950.50, unidadBase: 'kg' },
  { id: '5', nombre: 'Huevo', precioPorKg: 0, precioPorUnidad: 30.00, unidadBase: 'unidad'}, // Ejemplo con precio por unidad
  { id: '6', nombre: 'Pan Rallado', precioPorKg: 180.00, unidadBase: 'kg'},
];
// --- FIN DATOS EJEMPLO ---

// --- DATOS EJEMPLO CONFIG (Reemplazar con Fetch/Context) ---
const configGlobal = { overheadPercentage: 15, profitMargin: 40, ivaPercentage: 21 };
// --- FIN DATOS EJEMPLO CONFIG ---

// Unidades Comunes para Recetas
const unidadesReceta = ['g', 'kg', 'ml', 'l', 'unidad', 'pieza', 'cucharada', 'taza'];
// Categorías de Platos (vendrán de Firestore)
const categoriasPlato = ['Entrada', 'Plato Principal', 'Postre', 'Minuta', 'Guarnición'];


function RecetaForm({ recetaToEdit, onSave, onCancel }) {
  // Estado para datos básicos de la receta
  const [nombreReceta, setNombreReceta] = useState('');
  const [categoriaPlato, setCategoriaPlato] = useState('');
  // Estado para la lista de ingredientes de ESTA receta
  const [ingredientesReceta, setIngredientesReceta] = useState([]);

  // Estado para la sección de añadir ingrediente
  const [insumoSeleccionadoId, setInsumoSeleccionadoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('g'); // Unidad por defecto gramos

  // Estado para los costos calculados (inicialmente 0)
  const [costoVariableTotal, setCostoVariableTotal] = useState(0);
  const [costoFijoCalculado, setCostoFijoCalculado] = useState(0);
  const [costoTotalBase, setCostoTotalBase] = useState(0);
  const [gananciaCalculada, setGananciaCalculada] = useState(0);
  const [precioSinIVA, setPrecioSinIVA] = useState(0);
  const [precioFinalConIVA, setPrecioFinalConIVA] = useState(0);


  const isEditing = !!recetaToEdit;

  // TODO: useEffect para llenar el formulario si estamos editando (recetaToEdit)

  // --- Lógica para añadir ingrediente a la receta ---
  const handleAddIngrediente = () => {
    if (!insumoSeleccionadoId || !cantidad || !unidad) {
      alert("Selecciona un insumo e ingresa cantidad y unidad.");
      return;
    }
    const insumoEncontrado = listaInsumosDisponibles.find(i => i.id === insumoSeleccionadoId);
    if (!insumoEncontrado) {
        alert("Insumo seleccionado no válido.");
        return;
    }

    const nuevoIngrediente = {
      insumoId: insumoEncontrado.id,
      nombre: insumoEncontrado.nombre,
      cantidad: parseFloat(cantidad) || 0,
      unidad: unidad,
      // Guardamos info relevante para cálculo de costo
      precioPorKg: insumoEncontrado.precioPorKg,
      precioPorUnidad: insumoEncontrado.precioPorUnidad,
      unidadBase: insumoEncontrado.unidadBase,
    };

    // Evitar añadir el mismo insumo dos veces (se debería poder editar cantidad)
     if (ingredientesReceta.some(ing => ing.insumoId === nuevoIngrediente.insumoId)) {
        alert(`${nuevoIngrediente.nombre} ya está en la receta. Puedes editar su cantidad o eliminarlo.`);
        return;
     }


    setIngredientesReceta(prev => [...prev, nuevoIngrediente]);

    // Limpiar campos de añadir ingrediente
    setInsumoSeleccionadoId('');
    setCantidad('');
    setUnidad('g');
  };

  // --- Lógica para eliminar ingrediente de la receta ---
  const handleRemoveIngrediente = (insumoIdToRemove) => {
    setIngredientesReceta(prev => prev.filter(ing => ing.insumoId !== insumoIdToRemove));
  };


  // --- CÁLCULO DE COSTOS (SIMULADO - NECESITA LÓGICA REAL DE CONVERSIÓN) ---
  useEffect(() => {
      let costoVarTotal = 0;
      ingredientesReceta.forEach(ing => {
          let costoIngrediente = 0;
          // --- Lógica de conversión y cálculo (MUY SIMPLIFICADA) ---
          // ESTO ES LO MÁS COMPLEJO Y REQUIERE UNA BUENA DEFINICIÓN DE UNIDADES Y CONVERSIONES
          if (ing.unidadBase === 'kg' && ing.precioPorKg > 0) {
              if (ing.unidad === 'kg') costoIngrediente = ing.cantidad * ing.precioPorKg;
              else if (ing.unidad === 'g') costoIngrediente = (ing.cantidad / 1000) * ing.precioPorKg;
              // Añadir más conversiones (l, ml a kg/lt si aplica...)
          } else if (ing.unidadBase === 'unidad' && ing.precioPorUnidad > 0) {
               if (ing.unidad === 'unidad' || ing.unidad === 'pieza') costoIngrediente = ing.cantidad * ing.precioPorUnidad;
          } else {
              // Si no podemos calcular, asumimos 0 por ahora
              console.warn(`No se pudo calcular costo para ${ing.nombre}. Unidad base: ${ing.unidadBase}, Precio: ${ing.precioPorKg || ing.precioPorUnidad}`);
              costoIngrediente = 0; // O manejar error
          }
          // --- FIN LÓGICA SIMPLIFICADA ---
          costoVarTotal += costoIngrediente;
      });

      setCostoVariableTotal(costoVarTotal);

      // Aplicar porcentajes de configuración (usando los de ejemplo por ahora)
      const costoFijo = costoVarTotal * (configGlobal.overheadPercentage / 100);
      const costoBase = costoVarTotal + costoFijo;
      const ganancia = costoBase * (configGlobal.profitMargin / 100);
      const precioSinIVA = costoBase + ganancia;
      const precioConIVA = precioSinIVA * (1 + configGlobal.ivaPercentage / 100);

      setCostoFijoCalculado(costoFijo);
      setCostoTotalBase(costoBase);
      setGananciaCalculada(ganancia);
      setPrecioSinIVA(precioSinIVA);
      setPrecioFinalConIVA(precioConIVA);

  }, [ingredientesReceta]); // Recalcular cuando cambian los ingredientes


  // --- Manejador de Guardar Receta ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreReceta || !categoriaPlato || ingredientesReceta.length === 0) {
      alert("Completa el nombre, categoría y añade al menos un ingrediente.");
      return;
    }

    const recetaData = {
      nombre: nombreReceta,
      categoria: categoriaPlato,
      // Guardamos solo IDs y cantidad/unidad de ingredientes, no precios (se recalcula)
      ingredientes: ingredientesReceta.map(ing => ({
          insumoId: ing.insumoId,
          cantidad: ing.cantidad,
          unidad: ing.unidad
      })),
      // Podríamos guardar los costos calculados también si queremos "congelarlos"
      // costoVariableCalculado: costoVariableTotal,
      // precioFinalCalculado: precioFinalConIVA,
    };

    // Llama a la función onSave pasada desde GestionRecetas (que notificará a MainLayout)
    onSave(recetaData, recetaToEdit ? recetaToEdit.id : null);
  };

  // Función para formatear precios
  const formatCurrency = (number) => {
      return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(number);
  };


  return (
    <form onSubmit={handleSubmit} className={styles.recetaForm}>

      {/* Sección Datos Generales Receta */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Datos de la Receta</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="nombreReceta"><FaPizzaSlice className={styles.icon}/> Nombre Receta:</label>
            <input type="text" id="nombreReceta" value={nombreReceta} onChange={(e) => setNombreReceta(e.target.value)} required className={styles.input}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="categoriaPlato"><FaClipboardList className={styles.icon}/> Categoría Plato:</label>
            <select id="categoriaPlato" value={categoriaPlato} onChange={(e) => setCategoriaPlato(e.target.value)} required className={styles.select}>
                <option value="" disabled>-- Selecciona --</option>
                {categoriasPlato.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                {/* Añadir opción para crear nueva categoría de plato */}
            </select>
          </div>
        </div>
      </div>

      {/* Sección Añadir Ingredientes */}
      <div className={styles.formSection}>
         <h4 className={styles.sectionTitle}>Añadir Ingrediente</h4>
         <div className={styles.addIngredienteRow}>
            {/* Selección de Insumo */}
            <div className={styles.formGroup} style={{flexBasis: '40%'}}>
               <label htmlFor="insumoSelect">Insumo:</label>
               <select id="insumoSelect" value={insumoSeleccionadoId} onChange={(e) => setInsumoSeleccionadoId(e.target.value)} className={styles.select}>
                   <option value="" disabled>-- Busca o selecciona --</option>
                   {listaInsumosDisponibles.map(ins => (
                       <option key={ins.id} value={ins.id}>{ins.nombre}</option>
                   ))}
                   {/* Idealmente, esto sería un input con autocompletar */}
               </select>
            </div>
             {/* Cantidad */}
             <div className={styles.formGroup} style={{flexBasis: '20%'}}>
                <label htmlFor="cantidad">Cantidad:</label>
                <input type="number" id="cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="0" step="any" className={styles.input} placeholder="Ej: 100"/>
            </div>
             {/* Unidad */}
             <div className={styles.formGroup} style={{flexBasis: '20%'}}>
                 <label htmlFor="unidad">Unidad:</label>
                 <select id="unidad" value={unidad} onChange={(e) => setUnidad(e.target.value)} className={styles.select}>
                     {unidadesReceta.map(u => <option key={u} value={u}>{u}</option>)}
                 </select>
             </div>
             {/* Botón Añadir */}
             <div className={styles.formGroup} style={{flexBasis: '15%', alignSelf: 'flex-end'}}>
                 <button type="button" onClick={handleAddIngrediente} className={styles.addButton}>
                    <FaPlus /> Añadir
                 </button>
             </div>
         </div>
      </div>

       {/* Sección Lista de Ingredientes Añadidos */}
      {ingredientesReceta.length > 0 && (
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Ingredientes de la Receta</h4>
            <ul className={styles.ingredientesList}>
                {ingredientesReceta.map((ing, index) => (
                <li key={ing.insumoId || index}>
                    <span>{ing.nombre} - {ing.cantidad} {ing.unidad}</span>
                    {/* TODO: Añadir cálculo de costo por ingrediente aquí */}
                    <button type="button" onClick={() => handleRemoveIngrediente(ing.insumoId)} className={styles.removeButton} title="Quitar">
                        <FaTrashAlt />
                    </button>
                </li>
                ))}
            </ul>
          </div>
      )}

      {/* Sección Desglose de Costos */}
      <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Cálculo de Costos (Estimado)</h4>
          <div className={styles.costGrid}>
              <div><FaBalanceScale className={styles.icon}/> Costo Variable Total:</div>
              <div>{formatCurrency(costoVariableTotal)}</div>

              <div><FaPercentage className={styles.icon}/> + Gastos Generales ({configGlobal.overheadPercentage}%):</div>
              <div>{formatCurrency(costoFijoCalculado)}</div>

              <div><strong>Costo Total Base:</strong></div>
              <div><strong>{formatCurrency(costoTotalBase)}</strong></div>

              <div><FaPercentage className={styles.icon}/> + Margen Ganancia ({configGlobal.profitMargin}%):</div>
              <div>{formatCurrency(gananciaCalculada)}</div>

              <div><strong>Precio sin IVA:</strong></div>
              <div><strong>{formatCurrency(precioSinIVA)}</strong></div>

              <div><FaPercentage className={styles.icon}/> + IVA ({configGlobal.ivaPercentage}%):</div>
               <div>{formatCurrency(precioSinIVA * (configGlobal.ivaPercentage / 100))}</div>

               <div className={styles.finalPriceLabel}><FaDollarSign className={styles.icon}/> PRECIO FINAL VENTA:</div>
               <div className={styles.finalPriceValue}>{formatCurrency(precioFinalConIVA)}</div>
          </div>
          <small>Los costos son estimados y dependen de la configuración global y los precios de insumos.</small>
      </div>


      {/* Botones Principales */}
      <div className={styles.mainButtonGroup}>
        <button type="submit" className={styles.saveButton}>
            {isEditing ? 'Actualizar Receta' : 'Guardar Receta'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
      </div>
    </form>
  );
}

export default RecetaForm;