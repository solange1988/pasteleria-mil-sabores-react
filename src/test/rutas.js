// Ayudas para probar componentes que usan React Router y los contextos de sesión y carrito.
//
//  - renderizarApp('/admin'): la aplicación completa, como si el usuario abriera esa dirección.
//  - renderizarPagina(<Login />, { ruta: '/login' }): una página con los contextos de sesión y carrito.
//    Si la página lee parámetros de la URL, se indica el patrón: { ruta: '/producto/5', patron: '/producto/:id' }
//  - renderizarConRouter(<Encabezado ... />): un componente que solo necesita el Router (por sus <Link>).
//  - ubicacion(): la dirección actual (sirve para comprobar a dónde navegó la aplicación).
//  - ponerCarrito([...]): deja productos en el carrito guardado antes de renderizar.
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from '../App.jsx'
import { SesionProvider } from '../context/SesionContext.jsx'
import { CarritoProvider, CLAVE_CARRITO } from '../context/CarritoContext.jsx'

function UbicacionActual() {
  const { pathname } = useLocation()
  return <output data-testid="ubicacion" hidden>{pathname}</output>
}

export function renderizarApp(ruta = '/') {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
      <UbicacionActual />
    </MemoryRouter>,
  )
}

export function renderizarPagina(elemento, { ruta = '/', patron } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <SesionProvider>
        <CarritoProvider>
          <Routes>
            {patron && <Route path={patron} element={elemento} />}
            <Route path="*" element={patron ? null : elemento} />
          </Routes>
          <UbicacionActual />
        </CarritoProvider>
      </SesionProvider>
    </MemoryRouter>,
  )
}

export function renderizarConRouter(elemento) {
  return render(<MemoryRouter>{elemento}</MemoryRouter>)
}

export const ubicacion = () => screen.getByTestId('ubicacion').textContent

export function ponerCarrito(items) {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items))
}

export function leerCarritoGuardado() {
  return JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? '[]')
}
