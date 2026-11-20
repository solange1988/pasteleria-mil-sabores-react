import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SesionProvider, useSesion } from '../context/SesionContext.jsx'
import { CarritoProvider, useCarrito } from '../context/CarritoContext.jsx'
import { leerSesion, CLAVE_SESION } from '../auth/sesion.js'
import { renderizarPagina, ubicacion, leerCarritoGuardado } from './rutas.js'
import { simularApi, conSesion, respuestaLogin, ADMIN, CLIENTE, VENDEDOR } from './apiFalsa.js'

// Componente de prueba que usa los dos contextos como lo haría cualquier página
function Consumidor() {
  const { usuario, iniciar, cerrar } = useSesion()
  const { carrito, cantidad, agregar } = useCarrito()
  return (
    <div>
      <p>usuario: {usuario?.correo ?? 'ninguno'}</p>
      <p>unidades: {cantidad}</p>
      <p>líneas: {carrito.length}</p>
      <button onClick={() => iniciar(respuestaLogin(VENDEDOR))}>entrar</button>
      <button onClick={cerrar}>salir</button>
      <button onClick={() => agregar({ id: 5, nombre: 'Mousse', precio: 5000 })}>agregar</button>
    </div>
  )
}

describe('Contexto de sesión (SesionProvider / useSesion)', () => {
  it('sin sesión guardada el usuario es null', () => {
    renderizarPagina(<Consumidor />)
    expect(screen.getByText('usuario: ninguno')).toBeInTheDocument()
  })

  it('iniciar guarda la sesión en localStorage y lleva al vendedor a /admin', async () => {
    renderizarPagina(<Consumidor />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'entrar' }))
    expect(screen.getByText('usuario: vendedor@duoc.cl')).toBeInTheDocument()
    expect(leerSesion().usuario.rol).toBe('Vendedor')
    expect(ubicacion()).toBe('/admin')
  })

  it('cerrar borra la sesión y vuelve al inicio', async () => {
    conSesion(ADMIN)
    simularApi({ 'GET /usuarios/perfil': ADMIN })
    renderizarPagina(<Consumidor />, { ruta: '/admin' })
    await userEvent.setup().click(screen.getByRole('button', { name: 'salir' }))
    expect(leerSesion()).toBeNull()
    expect(screen.getByText('usuario: ninguno')).toBeInTheDocument()
    expect(ubicacion()).toBe('/')
  })

  it('si la sesión cambia en otra pestaña, esta pestaña se actualiza', () => {
    renderizarPagina(<Consumidor />)
    conSesion(CLIENTE) // otra pestaña guardó una sesión
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: CLAVE_SESION })))
    expect(screen.getByText(`usuario: ${CLIENTE.correo}`)).toBeInTheDocument()
  })

  it('useSesion fuera del SesionProvider avisa el error', () => {
    spyOn(console, 'error') // React registra el error en la consola
    expect(() => render(<MemoryRouter><Consumidor /></MemoryRouter>)).toThrowError(/SesionProvider/)
  })
})

describe('Contexto del carrito (CarritoProvider / useCarrito)', () => {
  it('agregar actualiza el carrito compartido y lo guarda en localStorage', async () => {
    renderizarPagina(<Consumidor />)
    const usuario = userEvent.setup()
    await usuario.click(screen.getByRole('button', { name: 'agregar' }))
    await usuario.click(screen.getByRole('button', { name: 'agregar' }))
    expect(screen.getByText('unidades: 2')).toBeInTheDocument()
    expect(screen.getByText('líneas: 1')).toBeInTheDocument()
    expect(leerCarritoGuardado()).toEqual([jasmine.objectContaining({ id: 5, cantidad: 2 })])
  })

  it('si lo guardado está dañado parte con el carrito vacío', () => {
    localStorage.setItem('pms_carrito', '{dañado')
    renderizarPagina(<Consumidor />)
    expect(screen.getByText('líneas: 0')).toBeInTheDocument()
  })

  it('useCarrito fuera del CarritoProvider avisa el error', () => {
    spyOn(console, 'error')
    function SoloCarrito() {
      useCarrito()
      return null
    }
    expect(() => render(<MemoryRouter><SesionProvider><SoloCarrito /></SesionProvider></MemoryRouter>)).toThrowError(/CarritoProvider/)
  })

  it('el CarritoProvider comparte el mismo carrito entre componentes distintos', async () => {
    function Contador() {
      return <span>contador: {useCarrito().cantidad}</span>
    }
    function Boton() {
      const { agregar } = useCarrito()
      return <button onClick={() => agregar({ id: 1, nombre: 'Torta', precio: 1000 })}>sumar</button>
    }
    render(<CarritoProvider><Contador /><Boton /></CarritoProvider>)
    await userEvent.setup().click(screen.getByRole('button', { name: 'sumar' }))
    expect(screen.getByText('contador: 1')).toBeInTheDocument()
  })
})
