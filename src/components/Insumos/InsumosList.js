import React from 'react';
import styles from './InsumosList.module.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

// El componente ahora recibe ivaPercentage
function InsumosList({ insumos, onEdit, onDelete, ivaPercentage }) {

  const formatCurrency = (number) => {
    // Asegurarse de que number sea un número antes de formatear
    const num = Number(number);
    if (isNaN(num)) {
        return '-'; // O mostrar $0.00 o algún indicador
    }
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num);
  };

  // Si no hay insumos, muestra un mensaje
  if (!insumos || insumos.length === 0) {
    return <p className={styles.emptyMessage}>No hay insumos registrados todavía.</p>;
  }

  // Asegurarse que el IVA sea un número, si no, usar 0 por defecto para el cálculo
  const ivaRate = (Number(ivaPercentage) || 0) / 100;

  return (
    <div className={styles.tableContainer}>
      <table className={styles.insumosTable}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Presentación</th>
            <th>Precio x Kg/Lt</th>
            {/* --- TÍTULO DE COLUMNA MODIFICADO --- */}
            <th>Precio Total (IVA Incl.)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map((insumo) => {
            // --- CÁLCULO DEL PRECIO CON IVA ---
            const precioBase = Number(insumo.precioTotalPresentacion) || 0;
            const precioConIva = precioBase * (1 + ivaRate);

            return (
                <tr key={insumo.id || insumo.nombre}>
                <td data-label="Nombre">{insumo.nombre}</td>
                <td data-label="Categoría">{insumo.categoria}</td>
                <td data-label="Proveedor">{insumo.proveedor || '-'}</td>
                <td data-label="Presentación">{insumo.presentacion || '-'}</td>
                <td data-label="Precio x Kg/Lt" className={styles.priceCell}>
                    {formatCurrency(insumo.precioPorKg || 0)}
                </td>
                {/* --- MOSTRAR PRECIO CON IVA --- */}
                <td data-label="Precio Total (IVA Incl.)" className={styles.priceCell}>
                    {formatCurrency(precioConIva)}
                </td>
                <td data-label="Acciones">
                    <div className={styles.actionButtons}>
                    <button
                        onClick={() => onEdit(insumo)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar Insumo"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => onDelete(insumo)} // Pasamos el objeto insumo
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Eliminar Insumo"
                    >
                        <FaTrashAlt />
                    </button>
                    </div>
                </td>
                </tr>
            );
           })}
        </tbody>
      </table>
    </div>
  );
}

// Definir valor por defecto para ivaPercentage por si no se pasa
InsumosList.defaultProps = {
  ivaPercentage: 21, // O 0 si prefieres no sumar nada por defecto
};


export default InsumosList;