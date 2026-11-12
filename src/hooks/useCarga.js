import { useEffect, useState } from 'react'

// Hook para cargar datos desde la API al mostrar un componente.
//   const carga = useCarga(() => listarProductos(), [])
//   carga.cargando | carga.error | carga.estado (código HTTP del error) | carga.datos | carga.recargar()
// Cada combinación de dependencias tiene una "clave": mientras la respuesta guardada no sea de la
// clave actual, se considera que está cargando. "vigente" evita guardar respuestas de peticiones viejas.
export default function useCarga(cargar, dependencias = []) {
  const [version, setVersion] = useState(0)
  const clave = JSON.stringify([...dependencias, version])
  const [resultado, setResultado] = useState({ clave: null, datos: null, error: '', estado: null })

  useEffect(() => {
    let vigente = true
    cargar()
      .then((datos) => vigente && setResultado({ clave, datos, error: '', estado: null }))
      .catch((e) => vigente && setResultado({ clave, datos: null, error: e.message, estado: e.estado ?? null }))
    return () => { vigente = false }
  }, [clave]) // eslint-disable-line react-hooks/exhaustive-deps

  const cargando = resultado.clave !== clave
  return {
    cargando,
    datos: cargando ? null : resultado.datos,
    error: cargando ? '' : resultado.error,
    estado: cargando ? null : resultado.estado,
    recargar: () => setVersion((v) => v + 1),
  }
}
