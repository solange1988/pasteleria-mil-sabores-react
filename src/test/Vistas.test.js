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
import { actualizarProducto, listarProductos, listarOfertas } from '../data/productos.js'

describe('<Ofertas />', () => {
  it('muestra solo los productos en oferta, con su porcentaje', () => {
    render(<Ofertas alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeInTheDocument()
    expect(screen.getByText('5 productos con precio especial')).toBeInTheDocument()
    expect(screen.getAllByText(/^-\d+%$/).length).toBe(5)
  })

  it('agregar una oferta al carrito llama a alAgregar con ese producto', async () => {
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy()
    render(<Ofertas alAgregar={alAgregar} />)

    await usuario.click(screen.getAllByRole('button', { name: 'Añadir al carrito' })[0])

    expect(alAgregar).toHaveBeenCalledTimes(1)
    expect(alAgregar.calls.argsFor(0)[0].precioOferta).toBeGreaterThan(0)
  })

  it('si no queda ninguna oferta avisa que por ahora no hay', () => {
    listarOfertas().forEach((p) => actualizarProducto(p.id, { precioOferta: 0 }))
    render(<Ofertas alAgregar={() => {}} />)
    expect(screen.getByText('Por ahora no hay productos en oferta.')).toBeInTheDocument()
    expect(screen.getByText('Vuelve pronto: publicaremos nuevas ofertas.')).toBeInTheDocument()
  })
})

describe('<Categorias />', () => {
  it('sin slug lista las 8 categorías con su cantidad de productos y enlace', () => {
    render(<Categorias alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Categorías' })).toBeInTheDocument()
    expect(screen.getAllByText(/productos$/).length).toBe(8)
    expect(screen.getAllByRole('link', { name: 'Tortas Cuadradas' })[0]).toHaveAttribute('href', '#/categorias/tortas-cuadradas')
  })

  it('con slug muestra solo los productos de esa categoría', () => {
    render(<Categorias slug="tortas-cuadradas" alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Tortas Cuadradas' })).toBeInTheDocument()
    const esperados = listarProductos().filter((p) => p.categoria === 'Tortas Cuadradas').length
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(esperados)
    expect(screen.getByRole('link', { name: /Todas las categorías/ })).toHaveAttribute('href', '#/categorias')
  })

  it('con un slug que no existe avisa que la categoría no existe', () => {
    render(<Categorias slug="inventada" alAgregar={() => {}} />)
    expect(screen.getByText('Esa categoría no existe.')).toBeInTheDocument()
  })
})

describe('<DetalleProducto />', () => {
  it('muestra nombre, precio y permite agregar al carrito', async () => {
    const usuario = userEvent.setup()
    const alAgregar = jasmine.createSpy()
    render(<DetalleProducto id="5" alAgregar={alAgregar} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Mousse de Chocolate' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

    expect(alAgregar).toHaveBeenCalledTimes(1)
  })

  it('un producto en oferta muestra el precio normal tachado y el porcentaje', () => {
    const { id } = listarOfertas()[0]
    render(<DetalleProducto id={String(id)} alAgregar={() => {}} />)
    expect(screen.getByText(/^-\d+%$/)).toBeInTheDocument()
    expect(document.querySelector('del')).not.toBeNull()
  })

  it('un producto sin stock tiene el botón desactivado y dice "Sin stock"', () => {
    actualizarProducto(5, { stock: 0 })
    render(<DetalleProducto id="5" alAgregar={() => {}} />)
    expect(screen.getByRole('button', { name: 'Añadir al carrito' })).toBeDisabled()
    expect(screen.getByText('Sin stock')).toBeInTheDocument()
  })

  it('un id que no existe muestra "El producto no existe."', () => {
    render(<DetalleProducto id="9999" alAgregar={() => {}} />)
    expect(screen.getByText('El producto no existe.')).toBeInTheDocument()
  })
})

describe('<Productos /> (búsqueda y filtro)', () => {
  it('muestra todo el catálogo al inicio', () => {
    render(<Productos alAgregar={() => {}} />)
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(listarProductos().length)
  })

  it('buscar por nombre deja solo los que coinciden', async () => {
    const usuario = userEvent.setup()
    render(<Productos alAgregar={() => {}} />)
    await usuario.type(screen.getByRole('searchbox'), 'mousse')
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBe(1)
  })
})

describe('páginas informativas', () => {
  it('<Inicio /> muestra la portada y productos destacados', () => {
    render(<Inicio alAgregar={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Añadir al carrito' }).length).toBeGreaterThan(0)
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
