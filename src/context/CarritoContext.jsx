// Contexto del CARRITO: el carrito lo usan el encabezado (contador), las páginas de productos
// (botón "Añadir al carrito"), la página del carrito y el checkout. En vez de pasarlo por props
// desde App, se comparte con este contexto y cada componente lo lee con useCarrito().
//
//   const { carrito, cantidad, agregar, quitar, cambiarCantidad, vaciar } = useCarrito()
//
// El carrito se guarda en localStorage ("pms_carrito") para que no se pierda al recargar.
// Las operaciones (agregar, quitar, etc.) son funciones puras de utils/carrito.js, probadas aparte.
import { createContext, useContext, useEffect, useState } from 'react'
import { agregarAlCarrito, quitarDelCarrito, cambiarCantidad as cambiarCantidadEn, contarUnidades } from '../utils/carrito.js'

export const CLAVE_CARRITO = 'pms_carrito'

const CarritoContext = createContext(null)

function leerCarrito() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CARRITO)) ?? []
  } catch {
    return []
  }
}

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarrito)

  useEffect(() => {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito))
  }, [carrito])

  const valor = {
    carrito,
    cantidad: contarUnidades(carrito),
    agregar: (producto) => setCarrito((actual) => agregarAlCarrito(actual, producto)),
    quitar: (idProducto) => setCarrito((actual) => quitarDelCarrito(actual, idProducto)),
    cambiarCantidad: (idProducto, cantidad) => setCarrito((actual) => cambiarCantidadEn(actual, idProducto, cantidad)),
    vaciar: () => setCarrito([]),
  }
  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>
}

// eslint-disable-next-line react/only-export-components -- el hook va junto a su Provider
export function useCarrito() {
  const carrito = useContext(CarritoContext)
  if (!carrito) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>')
  return carrito
}
