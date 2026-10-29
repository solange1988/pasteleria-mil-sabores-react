import { Form } from 'react-bootstrap'

// Campo de formulario con su etiqueta y mensaje de error.
// "form" es lo que devuelve useFormulario. El resto de props (type, as, rows, placeholder...)
// se pasan directo al <Form.Control>.
function CampoTexto({ etiqueta, name, form, ...resto }) {
  const error = form.errores[name]
  return (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label className="fw-bold">{etiqueta}</Form.Label>
      <Form.Control
        name={name}
        value={form.valores[name]}
        onChange={form.cambiar}
        onBlur={form.alSalir}
        isInvalid={Boolean(error)}
        {...resto}
      />
      {error && (
        <Form.Control.Feedback type="invalid" role="alert">
          {error}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  )
}

export default CampoTexto
