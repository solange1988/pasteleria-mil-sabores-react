// Se ejecuta ANTES de todas las pruebas (ver "files" en karma.conf.cjs).
import JasmineDOM from '@testing-library/jasmine-dom'

// El paquete exporta los matchers en ".default" (según el empaquetador puede venir un nivel más adentro)
const matchersDelDOM = JasmineDOM.default ?? JasmineDOM

// Agrega a expect los matchers del DOM: toBeInTheDocument, toBeDisabled, toHaveValue...
beforeAll(() => {
  jasmine.getEnv().addMatchers(matchersDelDOM)
})

// Cada prueba parte con el almacenamiento vacío (en un navegador real localStorage se comparte)
beforeEach(() => {
  localStorage.clear()
})
