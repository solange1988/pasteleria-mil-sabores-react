import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Ofertas from '../pages/Ofertas.jsx'
import Categorias from '../pages/Categorias.jsx'
import DetalleProducto from '../pages/DetalleProducto.jsx'
import Productos from '../pages/Productos.jsx'
import Inicio from '../pages/Inicio.jsx'
import Nosotros from '../pages/Nosotros.jsx'
import Blogs from '../pages/Blogs.jsx'
import BlogDetalle from '../pages/BlogDetalle.jsx'
import Contacto from '../pages/Contacto.jsx'
import Carrito from '../pages/Carrito.jsx'
import PiePagina from '../components/PiePagina.jsx'
import { simularApi, productosPrueba, ofertasDe, errorApi } from './apiFalsa.js'

// Los productos ahora vienen del backend: cada prueba simula la respuesta de la API.
const API_CATALOGO = () => {
  const productos = productosPrueba()
  return simularApi({
    'GET /productos': productos,
    'GET /productos/ofertas': ofertasDe(productos),
    'GET /productos/5': productos[4],
    'GET /productos/2': productos[1],
    'GET /productos/9999': errorApi(404, 'No existe el producto 9999'),
  })
}

describe('<Ofertas />', () => {
  it('pide las ofertas al backend y muestra cada una con su porcentaje', async () => {
    const llamadas = API_CATALOGO()
    render(<Ofertas alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeInTheDocument()
    expect(await screen.findByText('5 productos con precio especial')).toBeInTheDocument()
    expect(screen.getAllByText(/^-\d+%$/).length).toBe(5)
    expect(llamadas[0]).toEqual(jasmine.objectContaining({ metodo: 'GET', ruta: '/productos/ofertas' }))
  })

  it('mientras carga muestra el indicador de carga', () => {
    API_CATALOGO()
    render(<Ofertas alAgregar={() => {}} />)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
  })

  it('agregar una oferta al carrito llama a alAgregar con ese producto', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy()
    render(<Ofertas alAgregar={alAgregar} />)

    await usuario.click((await screen.findAllByRole('button', { name: 'Añadir al carrito' }))[0])

    expect(alAgregar).toHaveBeenCalledTimes(1)
    expect(alAgregar.calls.argsFor(0)[0].precioOferta).toBeGreaterThan(0)
  })

  it('si no queda ninguna oferta avisa que por ahora no hay', async () => {
    simularApi({ 'GET /productos/ofertas': [] })
    render(<Ofertas alAgregar={() => {}} />)
    expect(await screen.findByText('Por ahora no hay productos en oferta.')).toBeInTheDocument()
    expect(screen.getByText('Vuelve pronto: publicaremos nuevas ofertas.')).toBeInTheDocument()
  })

  it('si el backend no responde muestra el error y permite reintentar', async () => {
    simularApi({ 'GET /productos/ofertas': errorApi(500, 'Error interno') })
    render(<Ofertas alAgregar={() => {}} />)
    expect(await screen.findByText(/Error interno/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

describe('<Categorias />', () => {
  it('sin slug lista las 8 categorías con su cantidad de productos y enlace', async () => {
    API_CATALOGO()
    render(<Categorias alAgregar={() => {}} />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getAllByText(/productos$/).length).toBe(8)
    expect(screen.getAllByRole('link', { name: 'Tortas Cuadradas' })[0]).toHaveAttribute('href', '#/categorias/tortas-cuadradas')
  })

  it('con slug muestra solo los productos de esa categoría', async () => {
    API_CATALOGO()
    render(<Categorias slug="tortas-cuadradas" alAgregar={() => {}} />)
    expect(await screen.findByRole('heading', { level: 1, name: 'Tortas Cuadradas' })).toBeInTheDocument()
    const esperados = productosPrueba().filter((p) => p.categoria === 'Tortas Cuadradas').length
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(esperados)
    expect(screen.getByRole('link', { name: /Todas las categorías/ })).toHaveAttribute('href', '#/categorias')
  })

  it('con un slug que no existe avisa que la categoría no existe', async () => {
    API_CATALOGO()
    render(<Categorias slug="inventada" alAgregar={() => {}} />)
    expect(await screen.findByText('Esa categoría no existe.')).toBeInTheDocument()
  })
})

describe('<DetalleProducto />', () => {
  it('pide el producto por su id y permite agregarlo al carrito', async () => {
    const llamadas = API_CATALOGO()
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy()
    render(<DetalleProducto id="5" alAgregar={alAgregar} />)

    expect(await screen.findByRole('heading', { level: 1, name: 'Mousse de Chocolate' })).toBeInTheDocument()
    expect(llamadas[0].ruta).toBe('/productos/5')
    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(alAgregar).toHaveBeenCalledTimes(1)
  })

  it('un producto en oferta muestra el precio normal tachado y el porcentaje', async () => {
    API_CATALOGO()
    render(<DetalleProducto id="2" alAgregar={() => {}} />)
    expect(await screen.findByText(/^-\d+%$/)).toBeInTheDocument()
    expect(document.querySelector('del')).not.toBeNull()
  })

  it('un producto sin stock tiene el botón desactivado y dice "Sin stock"', async () => {
    simularApi({ 'GET /productos/5': { ...productosPrueba()[4], stock: 0 } })
    render(<DetalleProducto id="5" alAgregar={() => {}} />)
    expect(await screen.findByRole('button', { name: 'Añadir al carrito' })).toBeDisabled()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
  })

  it('si el backend responde 404 muestra "El producto no existe."', async () => {
    API_CATALOGO()
    render(<DetalleProducto id="9999" alAgregar={() => {}} />)
    expect(await screen.findByText('El producto no existe.')).toBeInTheDocument()
  })
})

describe('<Productos /> (búsqueda y filtro)', () => {
  it('muestra todo el catálogo que entrega el backend', async () => {
    API_CATALOGO()
    render(<Productos alAgregar={() => {}} />)
    expect((await screen.findAllByRole('button', { name: 'Añadir al carrito' })).length).toBe(16)
  })

  it('buscar por nombre deja solo los que coinciden', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    render(<Productos alAgregar={() => {}} />)
    await screen.findAllByRole('button', { name: 'Añadir al carrito' })
    await usuario.type(screen.getByRole('searchbox'), 'mousse')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(1)
  })

  it('filtrar por categoría deja solo los de esa categoría', async () => {
    API_CATALOGO()
    const usuario = userEvent.setup()
    render(<Productos alAgregar={() => {}} />)
    await screen.findAllByRole('button', { name: 'Añadir al carrito' })
    await usuario.selectOptions(screen.getByLabelText('Filtrar por categoría'), 'Veganos')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(2)
  })
})

describe('páginas informativas', () => {
  it('<Inicio /> muestra la portada y los 4 productos destacados', async () => {
    API_CATALOGO()
    render(<Inicio alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect((await screen.findAllByRole('button', { name: 'Añadir al carrito' })).length).toBe(4)
  })

  it('<Nosotros /> muestra la misión y la visión', () => {
    render(<Nosotros />)
    expect(screen.getByRole('heading', { name: /Misión/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Visión/ })).toBeInTheDocument()
  })

  it('<Blogs /> lista las noticias y cada una enlaza a su detalle', () => {
    render(<Blogs />)
    const botones = screen.getAllByRole('button', { name: 'Ver caso completo' })
    expect(botones.length).toBe(2)
    expect(botones[0]).toHaveAttribute('href', '#/blog/1')
    expect(botones[1]).toHaveAttribute('href', '#/blog/2')
  })

  it('<BlogDetalle /> muestra una noticia por su id y avisa si no existe', () => {
    const { unmount } = render(<BlogDetalle id="1" />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    unmount()
    render(<BlogDetalle id="999" />)
    expect(screen.getByText('La noticia no existe.')).toBeInTheDocument()
  })

  it('<PiePagina /> incluye los enlaces de apoyo', () => {
    render(<PiePagina />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})

describe('<Contacto /> (validación)', () => {
  it('enviar vacío muestra errores y no confirma el envío', async () => {
    const usuario = userEvent.setup()
    render(<Contacto />)
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(2)
    expect(screen.queryByText(/Gracias/)).toBeNull()
  })

  it('con todos los datos válidos confirma el envío', async () => {
    const usuario = userEvent.setup()
    render(<Contacto />)
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'ana@gmail.com')
    await usuario.type(screen.getByLabelText('Mensaje'), 'Quiero cotizar una torta para 20 personas')
    await usuario.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(screen.getByText(/Gracias/)).toBeInTheDocument()
  })
})

describe('<Carrito /> con descuento', () => {
  const LINEAS = [{ id: 5, nombre: 'Mousse de Chocolate', precio: 10000, imagen: '/img/x.jpg', cantidad: 1 }]

  it('un usuario con código FELICES50 ve el subtotal, el descuento y el total rebajado', () => {
    render(<Carrito carrito={LINEAS} usuario={{ codigo: 'FELICES50' }} alCambiarCantidad={() => {}} alQuitar={() => {}} alVaciar={() => {}} />)
    expect(screen.getByText(/Subtotal:/)).toBeInTheDocument()
    expect(screen.getByText(/Código FELICES50/)).toBeInTheDocument()
    expect(screen.getByText(/Total: \$\s?9\.000/)).toBeInTheDocument()
  })

  it('sin usuario no hay línea de descuento', () => {
    render(<Carrito carrito={LINEAS} alCambiarCantidad={() => {}} alQuitar={() => {}} alVaciar={() => {}} />)
    expect(screen.queryByText(/Subtotal:/)).toBeNull()
  })

  it('el carrito vacío ofrece ir a ver productos', () => {
    render(<Carrito carrito={[]} alCambiarCantidad={() => {}} alQuitar={() => {}} alVaciar={() => {}} />)
    expect(within(screen.getByText('Tu carrito está vacío por el momento.').parentElement).getByRole('button', { name: 'Ver productos' })).toBeInTheDocument()
  })
})
