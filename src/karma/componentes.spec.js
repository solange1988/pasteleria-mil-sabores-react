// Pruebas de componentes React con Jasmine, ejecutadas por Karma en Google Chrome.
// Cubren lo que pide el anexo: renderizado, renderizado condicional, props, estado y eventos.
// Testing Library dibuja el componente en el navegador; los espías son de Jasmine (jasmine.createSpy).
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TarjetaProducto from '../components/TarjetaProducto.jsx'
import Catalogo from '../components/Catalogo.jsx'
import Carrito from '../pages/Carrito.jsx'
import Login from '../pages/Login.jsx'
import { registrarUsuario } from '../data/usuarios.js'

const MOUSSE = { id: 5, nombre: 'Mousse de Chocolate', categoria: 'Postres Individuales', precio: 5000, stock: 30, imagen: '/img/mousse-chocolate.jpg' }

describe('<TarjetaProducto />', () => {
  it('renderizado: muestra el nombre y el precio con formato chileno', () => {
    render(<TarjetaProducto producto={MOUSSE} alAgregar={jasmine.createSpy('alAgregar')} />)

    expect(screen.getByRole('heading', { name: 'Mousse de Chocolate' })).toBeTruthy()
    expect(screen.getByText('$5.000')).toBeTruthy()
  })

  it('props y eventos: el botón tiene su etiqueta y al hacer clic llama a alAgregar con el producto', async () => {
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy('alAgregar')
    render(<TarjetaProducto producto={MOUSSE} alAgregar={alAgregar} />)

    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(alAgregar).toHaveBeenCalledTimes(1)
    expect(alAgregar).toHaveBeenCalledWith(MOUSSE)
  })

  it('renderizado condicional: sin stock muestra "Sin stock" y deshabilita el botón', () => {
    render(<TarjetaProducto producto={{ ...MOUSSE, stock: 0 }} alAgregar={jasmine.createSpy('alAgregar')} />)

    expect(screen.getByText('Sin stock')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Añadir al carrito' }).disabled).toBeTrue()
  })
})

describe('<Catalogo />', () => {
  it('renderiza todos los elementos de la lista', () => {
    const productos = [MOUSSE, { ...MOUSSE, id: 6, nombre: 'Tiramisú Clásico' }, { ...MOUSSE, id: 9, nombre: 'Empanada de Manzana' }]
    render(<Catalogo productos={productos} alAgregar={jasmine.createSpy('alAgregar')} />)

    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(3)
  })
})

describe('<Carrito />', () => {
  it('evento: el botón + pide la cantidad siguiente al componente padre', async () => {
    const usuario = userEvent.setup()
    const alCambiarCantidad = jasmine.createSpy('alCambiarCantidad')
    const carrito = [{ id: 5, nombre: 'Mousse de Chocolate', precio: 5000, imagen: '/img/mousse-chocolate.jpg', cantidad: 2 }]
    render(<Carrito carrito={carrito} alCambiarCantidad={alCambiarCantidad} alQuitar={jasmine.createSpy()} alVaciar={jasmine.createSpy()} />)

    await usuario.click(screen.getByRole('button', { name: 'Sumar Mousse de Chocolate' }))

    expect(alCambiarCantidad).toHaveBeenCalledWith(5, 3)
  })
})

describe('<Login />', () => {
  beforeEach(() => {
    localStorage.clear()
    registrarUsuario({ nombre: 'Ana Pérez', correo: 'ana@duoc.cl', contrasena: 'clave123' })
  })

  it('renderizado condicional: los mensajes de error solo aparecen cuando hay errores', async () => {
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy('alIniciarSesion')} />)
    expect(screen.queryByRole('alert')).toBeNull()

    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(screen.getAllByRole('alert').length).toBe(2)
  })

  it('estado: el valor del campo cambia cuando el usuario escribe', async () => {
    const usuario = userEvent.setup()
    render(<Login alIniciarSesion={jasmine.createSpy('alIniciarSesion')} />)

    await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')

    expect(screen.getByLabelText('Correo').value).toBe('ana@duoc.cl')
  })

  it('evento: con datos válidos llama a alIniciarSesion; con contraseña incorrecta, no', async () => {
    const usuario = userEvent.setup()
    const alIniciarSesion = jasmine.createSpy('alIniciarSesion')
    render(<Login alIniciarSesion={alIniciarSesion} />)

    await usuario.type(screen.getByLabelText('Correo'), 'ana@duoc.cl')
    await usuario.type(screen.getByLabelText('Contraseña'), 'otra123')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(alIniciarSesion).not.toHaveBeenCalled()
    expect(screen.getByText('Correo o contraseña incorrectos.')).toBeTruthy()

    await usuario.clear(screen.getByLabelText('Contraseña'))
    await usuario.type(screen.getByLabelText('Contraseña'), 'clave123')
    await usuario.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(alIniciarSesion).toHaveBeenCalledWith('ana@duoc.cl')
  })
})
