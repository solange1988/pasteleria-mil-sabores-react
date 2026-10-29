import { Container, Row, Col, Button } from 'react-bootstrap'
import blogs from '../data/blogs.js'

function Blogs() {
  return (
    <Container className="py-4">
      <h1 className="text-center mb-4">Noticias Importantes</h1>
      {blogs.map((blog, i) => (
        <Row key={blog.id} as="article" className="align-items-center g-4 py-4">
          {/* Alterna: imagen a la derecha en el primero, a la izquierda en el segundo */}
          <Col md={{ span: 6, order: i % 2 === 0 ? 1 : 2 }}>
            <h2>{blog.titulo}</h2>
            <p className="lh-lg">{blog.resumen}</p>
            <Button href={`#/blog/${blog.id}`} variant="chocolate">Ver caso completo</Button>
          </Col>
          <Col md={{ span: 6, order: i % 2 === 0 ? 2 : 1 }}>
            <img src={blog.imagen} alt={blog.titulo} className="img-portada" />
          </Col>
        </Row>
      ))}
    </Container>
  )
}

export default Blogs
