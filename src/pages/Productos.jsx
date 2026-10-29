import { useState } from 'react'
import { Container, Row, Col, Form } from 'react-bootstrap'
import Catalogo from '../components/Catalogo.jsx'
import { listarProductos, listarCategorias } from '../data/productos.js'

// Catálogo con buscador y filtro por categoría (estado local del componente)
function Productos({ alAgregar }) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')

  const productos = listarProductos().filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()) &&
      (categoria === '' || p.categoria === categoria),
  )

  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Nuestros Productos</h1>

      <Row className="g-3 mb-4">
        <Col md={8}>
          <Form.Control
            type="search"
            placeholder="Buscar por nombre..."
            aria-label="Buscar productos"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            aria-label="Filtrar por categoría"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {listarCategorias().map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Catalogo productos={productos} alAgregar={alAgregar} />
    </Container>
  )
}

export default Productos
