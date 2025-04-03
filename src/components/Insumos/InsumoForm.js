import React, { useState, useEffect } from 'react';
import styles from './InsumoForm.module.css';
// Importamos más iconos o los que necesitemos
import { FaWarehouse, FaUserTag, FaTag, FaBox, FaDollarSign, FaWeightHanging, FaPlus } from 'react-icons/fa';

const categoriasIniciales = ["Verdulería", "Carnicería", "Almacén", "Limpieza"];

// Acepta insumoToEdit, onSave, y onCancel
function InsumoForm({ insumoToEdit, onSave, onCancel }) {
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [nombreInsumo, setNombreInsumo] = useState('');
  const [presentacion, setPresentacion] = useState('');
  const [precioKg, setPrecioKg] = useState('');
  const [precioTotal, setPrecioTotal] = useState('');
  const [isAddingCategoria, setIsAddingCategoria] = useState(false);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState(categoriasIniciales);

  const isEditing = !!insumoToEdit;

  useEffect(() => {
    if (insumoToEdit) {
      setCategoria(insumoToEdit.categoria || '');
      setProveedor(insumoToEdit.proveedor || '');
      setNombreInsumo(insumoToEdit.nombre || '');
      setPresentacion(insumoToEdit.presentacion || '');
      setPrecioKg(insumoToEdit.precioPorKg?.toString() || '');
      setPrecioTotal(insumoToEdit.precioTotalPresentacion?.toString() || '');
      setIsAddingCategoria(false);
      setNuevaCategoria('');
      if (insumoToEdit.categoria && !categoriasDisponibles.includes(insumoToEdit.categoria)) {
          setCategoriasDisponibles(prev => [...prev, insumoToEdit.categoria]);
      }
    } else {
       if (!isEditing) { // Resetear solo si NO estamos editando
            setCategoria('');
            setProveedor('');
            setNombreInsumo('');
            setPresentacion('');
            setPrecioKg('');
            setPrecioTotal('');
            setIsAddingCategoria(false);
            setNuevaCategoria('');
       }
    }
  }, [insumoToEdit, isEditing]); // Añadimos isEditing aquí


  useEffect(() => {
     if (!insumoToEdit || (insumoToEdit && presentacion.toLowerCase() === 'kg')) {
        const kg = parseFloat(precioKg);
        if (!isNaN(kg) && presentacion.toLowerCase() === 'kg') {
          setPrecioTotal(kg.toFixed(2));
        } else if (presentacion.toLowerCase() !== 'kg' && !isEditing) {
           setPrecioTotal('');
        }
     }
  }, [precioKg, presentacion, insumoToEdit, isEditing]); // Añadimos isEditing


  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    if (value === 'add_new') {
      setIsAddingCategoria(true);
      setCategoria('');
    } else {
      setIsAddingCategoria(false);
      setNuevaCategoria('');
      setCategoria(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreInsumo || !precioKg) {
      alert('Por favor, completa al menos el nombre y el precio por Kg.');
      return;
    }

    let categoriaFinal = categoria;
    if (isAddingCategoria && nuevaCategoria.trim() !== '') {
        categoriaFinal = nuevaCategoria.trim();
        console.log("Nueva categoría a guardar:", categoriaFinal);
        if (!categoriasDisponibles.includes(categoriaFinal)) {
             setCategoriasDisponibles(prev => [...prev, categoriaFinal]);
        }
        setCategoria(categoriaFinal);
        setIsAddingCategoria(false);
        setNuevaCategoria('');
    } else if (!categoria && !isAddingCategoria) {
         alert('Por favor, selecciona o añade una categoría.');
         return;
    }

    const insumoData = {
      categoria: categoriaFinal,
      proveedor,
      nombre: nombreInsumo,
      presentacion,
      precioPorKg: parseFloat(precioKg) || 0,
      precioTotalPresentacion: (!isNaN(parseFloat(precioTotal)) ? parseFloat(precioTotal) : parseFloat(precioKg)) || 0
    };

    onSave(insumoData, insumoToEdit ? insumoToEdit.id : null);
  };

  return (
    // Eliminamos el H3 de aquí, usamos el título del Modal
    <form onSubmit={handleSubmit} className={styles.insumoForm}>

      {/* Categoría (Select + Input opcional) */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          {/* Quitamos icono del label */}
          <label htmlFor="categoria">Categoría:</label>
          {/* Mantenemos el wrapper solo para consistencia o si añadimos icono al select (difícil) */}
           <div className={styles.inputWrapper}>
              {/* <FaWarehouse className={styles.inputIcon} /> Icono en Select es complicado */}
              <select id="categoria" value={isAddingCategoria ? 'add_new' : categoria} onChange={handleCategoriaChange} required className={styles.select}>
                  <option value="" disabled>-- Selecciona --</option>
                  {categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="add_new">-- Añadir Nueva Categoría --</option>
              </select>
           </div>
        </div>
        {/* Input para nueva categoría */}
        {isAddingCategoria && (
          <div className={styles.formGroup}>
             <label htmlFor="nuevaCategoria">Nueva Categoría:</label>
             <div className={styles.inputWrapper}>
               <FaPlus className={styles.inputIcon} />
                <input
                  type="text"
                  id="nuevaCategoria"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  placeholder="Nombre nueva categoría"
                  className={styles.input} // Aplicamos padding para icono
                />
             </div>
          </div>
        )}
         {/* Placeholder si es necesario */}
         {!isAddingCategoria && <div className={styles.formGroup}></div> }
      </div>

      {/* Proveedor y Nombre */}
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
           {/* Quitamos icono del label */}
          <label htmlFor="proveedor">Proveedor:</label>
          <div className={styles.inputWrapper}>
            <FaUserTag className={styles.inputIcon} /> {/* Icono dentro */}
            <input
              type="text"
              id="proveedor"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              placeholder="Nombre del proveedor"
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
           {/* Quitamos icono del label */}
          <label htmlFor="nombreInsumo">Nombre Insumo:</label>
          <div className={styles.inputWrapper}>
             <FaTag className={styles.inputIcon} /> {/* Icono dentro */}
            <input
              type="text"
              id="nombreInsumo"
              value={nombreInsumo}
              onChange={(e) => setNombreInsumo(e.target.value)}
              placeholder="Ej: Tomate Perita, Harina 0000"
              required
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Presentación y Precio Kg */}
      <div className={styles.formRow}>
         <div className={styles.formGroup}>
             {/* Quitamos icono del label */}
            <label htmlFor="presentacion">Presentación:</label>
             <div className={styles.inputWrapper}>
                <FaBox className={styles.inputIcon} /> {/* Icono dentro */}
                <input
                type="text"
                id="presentacion"
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                placeholder="Ej: kg, Paquete 500g"
                className={styles.input}
                />
            </div>
         </div>
         <div className={styles.formGroup}>
            {/* Quitamos icono del label */}
           <label htmlFor="precioKg">Precio por Kg/Lt:</label>
            <div className={styles.inputWrapper}>
                <FaWeightHanging className={styles.inputIcon} /> {/* Icono dentro */}
                <input
                    type="number"
                    id="precioKg"
                    value={precioKg}
                    onChange={(e) => setPrecioKg(e.target.value)}
                    placeholder="Ej: 150.50"
                    required
                    min="0"
                    step="0.01"
                    className={styles.input}
                />
           </div>
         </div>
      </div>

       {/* Precio Total */}
       <div className={styles.formRow}>
          <div className={styles.formGroup}>
             {/* Quitamos icono del label */}
            <label htmlFor="precioTotal">Precio Total (Presentación):</label>
             <div className={styles.inputWrapper}>
                 <FaDollarSign className={styles.inputIcon} /> {/* Icono dentro */}
                <input
                type="number"
                id="precioTotal"
                value={precioTotal}
                onChange={(e) => setPrecioTotal(e.target.value)}
                placeholder="Costo total del item"
                min="0"
                step="0.01"
                className={styles.input}
                disabled={!isEditing && presentacion.toLowerCase() === 'kg'}
                />
             </div>
            <small>Se calcula si la presentación es 'kg'. Si no, ingrésalo.</small>
          </div>
          <div className={styles.formGroup}></div> {/* Placeholder */}
       </div>

      {/* Botones */}
      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.saveButton}>
            {isEditing ? 'Actualizar Insumo' : 'Guardar Insumo'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancelar</button>
      </div>
    </form>
  );
}

export default InsumoForm;