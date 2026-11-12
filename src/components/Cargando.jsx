import { Spinner, Alert, Button } from 'react-bootstrap'

// Muestra un spinner mientras se cargan datos de la API, o el error si falló.
// Uso: <Cargando carga={carga}>{(datos) => <Lista datos={datos} />}</Cargando>
function Cargando({ carga, children }) {
  if (carga.cargando) {
    return (
      <div className="text-center py-5" role="status">
        <Spinner animation="border" className="me-2" size="sm" />
        Cargando...
      </div>
    )
  }
  if (carga.error) {
    return (
      <Alert variant="danger" className="my-3">
        {carga.error}{' '}
        <Button size="sm" variant="outline-danger" onClick={carga.recargar}>Reintentar</Button>
      </Alert>
    )
  }
  return children(carga.datos)
}

export default Cargando
