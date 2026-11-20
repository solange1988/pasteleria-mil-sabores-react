import { Link, useParams } from 'react-router-dom'
import { Container, Alert } from 'react-bootstrap'
import blogs from '../data/blogs.js'

function BlogDetalle() {
  const { id } = useParams()
  const blog = blogs.find((b) => b.id === Number(id))

  return (
    <Container className="py-4" style={{ maxWidth: 820 }}>
      <Link to="/blogs">&larr; Volver a Blogs</Link>
      {blog ? (
        <article className="mt-3">
          <h1>{blog.titulo}</h1>
          <img src={blog.imagen} alt={blog.titulo} className="img-portada my-3" />
          {blog.parrafos.map((p) => (
            <p key={p.slice(0, 20)} className="lh-lg">{p}</p>
          ))}
        </article>
      ) : (
        <Alert variant="warning" className="mt-3">La noticia no existe.</Alert>
      )}
    </Container>
  )
}

export default BlogDetalle
