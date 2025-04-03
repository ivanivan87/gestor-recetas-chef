import React, { useState, useEffect } from 'react';
// Importaremos funciones de Firestore más adelante
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from '../firebaseConfig';
import styles from './Configuracion.module.css';
// Importamos icono de porcentaje o billete/impuesto si existe
import { FaPercent, FaSave, FaFileInvoiceDollar } from 'react-icons/fa';

function Configuracion() {
  // Estados locales para los valores de los inputs
  const [overheadPercentage, setOverheadPercentage] = useState('');
  const [profitMargin, setProfitMargin] = useState('');
  // --- NUEVO ESTADO PARA IVA ---
  const [ivaPercentage, setIvaPercentage] = useState('21'); // Valor por defecto 21%

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // --- Lógica para cargar datos de Firestore (FUTURO) ---
  // useEffect(() => { ... cargar overhead, margin, Y AHORA TAMBIÉN IVA ... });


  // --- Lógica para guardar datos en Firestore (FUTURO) ---
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    const overhead = parseFloat(overheadPercentage);
    const margin = parseFloat(profitMargin);
    // --- OBTENER Y VALIDAR IVA ---
    const iva = parseFloat(ivaPercentage);

    // Validaciones básicas (incluyendo IVA)
    if (isNaN(overhead) || overhead < 0 || isNaN(margin) || margin < 0 || isNaN(iva) || iva < 0) {
        setStatusMessage('Error: Por favor, ingresa valores numéricos válidos y positivos para todos los porcentajes.');
        setIsLoading(false);
        return;
    }

    // --- GUARDAR LOS TRES VALORES ---
    const configData = {
        overheadPercentage: overhead,
        profitMargin: margin,
        ivaPercentage: iva // Añadir IVA a los datos
    };

    console.log("Intentando guardar configuración (simulado):", configData);

    try {
      // const configRef = doc(db, 'configuracion', 'global');
      // await setDoc(configRef, configData, { merge: true });

      await new Promise(resolve => setTimeout(resolve, 500));
      setStatusMessage('¡Configuración guardada exitosamente! (Simulado)');
      console.log("Configuración guardada (simulado)");

    } catch (error) {
      console.error("Error guardando configuración (simulado): ", error);
      setStatusMessage('Error al guardar la configuración. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.configContainer}>
      <h1>Configuración General de Costos e IVA</h1> {/* Título actualizado */}
      <p className={styles.description}>
        Define los porcentajes globales que se aplicarán al cálculo
        del costo final de cada plato.
      </p>

      <form onSubmit={handleSaveConfig} className={styles.configForm}>
        {/* Campo Gastos Generales */}
        <div className={styles.inputGroup}>
          <label htmlFor="overhead" className={styles.label}>
            <FaPercent className={styles.icon} />
            Porcentaje Adicional (Gastos Generales):
          </label>
          <input
            type="number"
            id="overhead"
            value={overheadPercentage}
            onChange={(e) => setOverheadPercentage(e.target.value)}
            className={styles.input}
            placeholder="Ej: 15 (para 15%)"
            min="0"
            step="0.1"
          />
           <small className={styles.helperText}>
             Este % se suma al costo variable de ingredientes para cubrir otros gastos.
           </small>
        </div>

        {/* Campo Margen de Ganancia */}
        <div className={styles.inputGroup}>
          <label htmlFor="margin" className={styles.label}>
            <FaPercent className={styles.icon} />
            Margen de Ganancia Deseado (%):
          </label>
          <input
            type="number"
            id="margin"
            value={profitMargin}
            onChange={(e) => setProfitMargin(e.target.value)}
            className={styles.input}
            placeholder="Ej: 40 (para 40%)"
            min="0"
            step="0.1"
          />
          <small className={styles.helperText}>
             Este % se calcula sobre (costo variable + gastos generales) para obtener la ganancia.
           </small>
        </div>

        {/* --- NUEVO CAMPO PARA IVA --- */}
        <div className={styles.inputGroup}>
          <label htmlFor="iva" className={styles.label}>
            {/* Usamos un icono diferente para IVA */}
            <FaFileInvoiceDollar className={styles.icon} />
            Porcentaje de IVA (%):
          </label>
          <input
            type="number"
            id="iva"
            value={ivaPercentage}
            onChange={(e) => setIvaPercentage(e.target.value)}
            className={styles.input}
            placeholder="Ej: 21 (para 21%)"
            min="0"
            step="0.1" // Permitir decimales si algún día cambia
            required // Hacerlo requerido
          />
           <small className={styles.helperText}>
             Este % (ej. 21% en Argentina) se suma al costo base (ingredientes + gastos + ganancia) para obtener el precio final de venta al público.
           </small>
        </div>
        {/* --- FIN NUEVO CAMPO IVA --- */}


        <button
           type="submit"
           className={styles.saveButton}
           disabled={isLoading}
         >
          <FaSave style={{ marginRight: '8px' }} />
          {isLoading ? 'Guardando...' : 'Guardar Configuración'}
        </button>

        {statusMessage && (
          <p className={`${styles.statusMessage} ${statusMessage.includes('Error') ? styles.error : styles.success}`}>
            {statusMessage}
          </p>
        )}

      </form>
    </div>
  );
}

export default Configuracion;