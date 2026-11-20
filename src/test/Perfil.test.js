import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Perfil from '../pages/Perfil.jsx'
import { leerSesion } from '../auth/sesion.js'
import { simularApi, errorApi, boletaPrueba, conSesion, CLIENTE } from './apiFalsa.js'
import { renderizarPagina } from './rutas.js'

const ana = (extra = {}) => ({ ...CLIENTE, ...extra })

// El perfil lee el usuario del contexto de sesión: se deja la sesión guardada y se abre /perfil
function abrirPerfil(datos) {
  conSesion(datos)
  return renderizarPagina(<Perfil />, { ruta: '/perfil' })
}

function API_PERFIL(compras = []) {
  return simularApi({
    'GET /usuarios/perfil': () => leerSesion().usuario, // el contexto confirma la sesión al abrir
    'GET /boletas/mias': compras,
    'PUT /usuarios/perfil': ({ cuerpo }) =>
      cuerpo.codigo && cuerpo.codigo !== 'FELICES50' ? errorApi(400, 'El código promocional no es válido') : { ...CLIENTE, ...cuerpo },
  })
}

describe('<Perfil /> (GET /boletas/mias y PUT /usuarios/perfil)', () => {
  beforeEach(() => conSesion(CLIENTE))

  it('muestra los datos del usuario ya cargados en el formulario', () => {
    API_PERFIL()
    abrirPerfil(ana({ telefono: '+56911112222' }))
    expect(screen.getByText('ana@duoc.cl')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
    expect(screen.getByLabelText('Teléfono (opcional)')).toHaveValue('+56911112222')
  })

  it('guarda los cambios en el backend, entrega el usuario actualizado y confirma', async () => {
    const llamadas = API_PERFIL()
    const usuario = userEvent.setup()
    abrirPerfil(ana())

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Gómez')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByText('Tus datos se actualizaron correctamente.')).toBeInTheDocument()
    expect(leerSesion().usuario.nombre).toBe('Ana Gómez') // la sesión quedó actualizada
    expect(llamadas.find((l) => l.metodo === 'PUT').cuerpo.nombre).toBe('Ana Gómez')
  })

  it('un nombre inválido no se envía y muestra el error', async () => {
    const llamadas = API_PERFIL()
    const usuario = userEvent.setup()
    abrirPerfil(ana())

    await usuario.clear(screen.getByLabelText('Nombre completo'))
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
    expect(leerSesion().usuario.nombre).toBe('Ana Pérez')
    expect(llamadas.some((l) => l.metodo === 'PUT')).toBeFalse()
  })

  it('sin descuentos asociados lo informa', () => {
    API_PERFIL()
    abrirPerfil(ana())
    expect(screen.getByText('Por ahora no tienes descuentos asociados a tu cuenta.')).toBeInTheDocument()
  })

  it('con el código FELICES50 muestra el 10% de descuento', () => {
    API_PERFIL()
    abrirPerfil(ana({ codigo: 'FELICES50' }))
    expect(screen.getByText(/Tienes 10% de descuento/)).toBeInTheDocument()
  })

  it('el historial muestra las compras que devuelve GET /boletas/mias', async () => {
    const llamadas = API_PERFIL([boletaPrueba({ numero: 1001 }), boletaPrueba({ numero: 1003 })])
    abrirPerfil(ana())
    expect(await screen.findByText('#1001')).toBeInTheDocument()
    expect(screen.getByText('#1003')).toBeInTheDocument()
    expect(llamadas.find((l) => l.ruta === '/boletas/mias')).toEqual(jasmine.objectContaining({ autorizacion: 'Bearer token-acceso' }))
  })

  it('sin compras el historial muestra el aviso de lista vacía', async () => {
    API_PERFIL()
    abrirPerfil(ana())
    expect(await screen.findByText('No hay órdenes registradas.')).toBeInTheDocument()
  })

  it('si el backend rechaza los datos muestra su mensaje', async () => {
    API_PERFIL()
    const usuario = userEvent.setup()
    abrirPerfil(ana())
    await screen.findByText('No hay órdenes registradas.')
    // El backend falso solo acepta "FELICES50" en mayúsculas: así simulamos que rechaza algo que el navegador aceptó
    await usuario.type(screen.getByLabelText('Código promocional (opcional)'), 'felices50')
    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('El código promocional no es válido')).toBeInTheDocument()
  })
})
