import React, { useState, useEffect } from 'react';
// Importaremos funciones de Firestore más adelante
// import { doc, getDoc, setDoc } from 'firebase/firestore';
// import { db } from '../firebaseConfig';
import styles from './Configuracion.module.css'; // Crearemos este archivo
import { FaPercent, FaSave } from 'react-icons/fa'; // Iconos

function Configuracion() {
  // Estados locales para los valores de los inputs
  const [overheadPercentage, setOverheadPercentage] = useState(''); // Porcentaje gastos generales
  const [profitMargin, setProfitMargin] = useState(''); // Margen de ganancia
  const [isLoading, setIsLoading] = useState(false); // Para feedback visual
  const [statusMessage, setStatusMessage] = useState(''); // Mensajes de éxito/error

  // --- Lógica para cargar datos de Firestore (la añadiremos después) ---
  // useEffect(() => {
  //   const loadConfig = async () => {
  //     setIsLoading(true);
  //     // const configRef = doc(db, 'configuracion', 'global');
  //     // const docSnap = await getDoc(configRef);
  //     // if (docSnap.exists()) {
  //     //   setOverheadPercentage(docSnap.data().overheadPercentage || '');
  //     //   setProfitMargin(docSnap.data().profitMargin || '');
  //     // } else {
  //     //   console.log("No existe documento de configuración global.");
  //     // }
  //     setIsLoading(false);
  //   };
  //   loadConfig();
  // }, []);


  // --- Lógica para guardar datos en Firestore (la añadiremos después) ---
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage('');

    const overhead = parseFloat(overheadPercentage);
    const margin = parseFloat(profitMargin);

    // Validaciones básicas
    if (isNaN(overhead) || overhead < 0 || isNaN(margin) || margin < 0) {
        setStatusMessage('Error: Por favor, ingresa valores numéricos válidos y positivos.');
        setIsLoading(false);
        return;
    }

    console.log("Intentando guardar (simulado):", { overheadPercentage: overhead, profitMargin: margin });

    try {
      // const configRef = doc(db, 'configuracion', 'global');
      // await setDoc(configRef, {
      //   overheadPercentage: overhead,
      //   profitMargin: margin
      // }, { merge: true }); // merge:true actualiza o crea sin sobreescribir otros campos

      // Simulación de éxito por ahora
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular demora de red
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
      <h1>Configuración General de Costos</h1>
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
            min="0" // No permitir negativos
            step="0.1" // Permitir decimales
          />
           <small className={styles.helperText}>
             Este % se suma al costo variable de ingredientes para cubrir otros gastos (luz, gas, etc.).
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
             Este % se calcula sobre (costo variable + gastos generales) para obtener el precio final.
           </small>
        </div>

        <button
           type="submit"
           className={styles.saveButton}
           disabled={isLoading} // Deshabilitar mientras guarda
         >
          <FaSave style={{ marginRight: '8px' }} />
          {isLoading ? 'Guardando...' : 'Guardar Configuración'}
        </button>

        {/* Mensaje de estado */}
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