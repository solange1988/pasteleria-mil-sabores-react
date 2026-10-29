// Configuración de Karma + Jasmine para probar los componentes React.
//
//  - Jasmine  = el "framework de pruebas": aporta describe / it / expect / spies.
//  - Karma    = el "ejecutor": abre un navegador REAL (Chrome) y corre ahí las pruebas.
//  - esbuild  = compila el JSX para que el navegador entienda los componentes.
//
// Comandos (ver package.json):  npm test  |  npm run test:ejecutar  |  npm run test:cobertura
//
// Las pruebas viven en src/test/*.test.js y src/karma/*.spec.js.

const fs = require('node:fs')
const path = require('node:path')
const { createInstrumenter } = require('istanbul-lib-instrument')

const conCobertura = process.argv.includes('--cobertura') || process.env.COBERTURA === '1'

// Devuelve las rutas (con "/") de los archivos de una carpeta que cumplen un patrón
function listar(carpeta, patron, { saltar = [] } = {}) {
  if (!fs.existsSync(carpeta)) return []
  return fs.readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = path.join(carpeta, e.name)
    if (e.isDirectory()) return saltar.includes(e.name) ? [] : listar(ruta, patron, { saltar })
    return patron.test(e.name) ? [ruta.split(path.sep).join('/')] : []
  })
}

// ---------------------------------------------------------------------------
// UN SOLO archivo de entrada que importa todas las pruebas.
// Así React, Testing Library y user-event se cargan UNA vez. (Si cada prueba se compilara por
// separado, cada una traería su propia copia de esas librerías y se molestarían entre sí al
// tocar el mismo documento: el texto tipeado se perdía de forma intermitente.)
// El archivo se genera en cada ejecución; no hay que editarlo (está en .gitignore).
// ---------------------------------------------------------------------------
const ENTRADA = 'karma-tmp/entrada.js'
const pruebas = [...listar('src/test', /\.test\.js$/), ...listar('src/karma', /\.spec\.js$/)]
// Con cobertura se cargan además TODOS los archivos de src/ (menos pruebas y main.jsx): un archivo
// sin pruebas no aparecería en el informe y el porcentaje total saldría inflado.
const todoElCodigo = conCobertura
  ? listar('src', /\.(js|jsx)$/, { saltar: ['test', 'karma'] }).filter((r) => r !== 'src/main.jsx')
  : []

fs.mkdirSync('karma-tmp', { recursive: true })
fs.writeFileSync(
  ENTRADA,
  [
    '// Archivo generado automáticamente por karma.conf.cjs (no editar)',
    "import '../src/test/configuracion.js'",
    ...pruebas.filter((r) => r !== 'src/test/configuracion.js').map((r) => `import '../${r}'`),
    ...todoElCodigo.map((r) => `import '../${r}'`),
    '',
  ].join('\n'),
)

// ---------------------------------------------------------------------------
// Cobertura: plugin de esbuild que marca cada línea/función/rama de src/ para medir qué parte
// del código ejecutan las pruebas.
// ---------------------------------------------------------------------------
const instrumentador = createInstrumenter({ esModules: true, compact: false, parserPlugins: ['jsx'] })

const pluginCobertura = {
  name: 'cobertura-istanbul',
  setup(build) {
    build.onLoad({ filter: /src[\\/].*\.(js|jsx)$/ }, (args) => {
      const ruta = args.path
      const sinInstrumentar = /src[\\/](test|karma)[\\/]/.test(ruta) || /src[\\/]main\.jsx$/.test(ruta)
      const codigo = fs.readFileSync(ruta, 'utf8')
      if (sinInstrumentar) return { contents: codigo, loader: 'jsx' }
      return {
        contents: instrumentador.instrumentSync(codigo, path.relative(process.cwd(), ruta)),
        loader: 'jsx',
      }
    })
  },
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],

    files: [
      { pattern: ENTRADA, watched: false },
      // Imágenes de public/img: las usan los componentes (src="/img/...") y así no hay avisos 404
      { pattern: 'public/img/**', included: false, served: true, watched: false },
    ],
    proxies: { '/img/': '/base/public/img/' },

    preprocessors: { [ENTRADA]: ['esbuild'] },

    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"' },
      target: 'es2020',
      singleBundle: false, // el único "bundle" es el archivo de entrada generado arriba
      plugins: conCobertura ? [pluginCobertura] : [],
    },

    reporters: conCobertura ? ['spec', 'coverage'] : ['spec'],

    specReporter: { suppressPassed: false, suppressSkipped: true, showSpecTiming: false },

    coverageReporter: {
      dir: 'cobertura',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
        { type: 'json-summary', subdir: '.', file: 'resumen.json' },
      ],
    },

    // Chrome sin ventana. En equipos sin permisos de sandbox se puede usar
    // la variante ChromeHeadlessSinSandbox (variable KARMA_NAVEGADOR).
    browsers: [process.env.KARMA_NAVEGADOR || 'ChromeHeadless'],
    customLaunchers: {
      ChromeHeadlessSinSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },

    client: {
      jasmine: { random: true }, // orden aleatorio: detecta pruebas que dependen unas de otras
    },

    singleRun: false,
    autoWatch: true,
    browserNoActivityTimeout: 60000,
  })
}
