# Pastelería Mil Sabores — versión React

Tienda online hecha con **React + Vite + React-Bootstrap**. Las pruebas usan **Jasmine** (el framework: `describe`, `it`, `expect`, espías) ejecutado con **Karma** en un Chrome real, junto con **Testing Library** para probar los componentes.
Proyecto de la Evaluación Parcial 2 de DSY1104 Desarrollo Fullstack II.

---

## 1. Cómo abrirlo (primera vez)

Necesitas tener instalado **Node.js** (versión 20 o más nueva) y **VS Code**.

1. Descomprime el `.zip` y abre la carpeta `pasteleria-react` en VS Code (*Archivo → Abrir carpeta*).
2. Abre la terminal de VS Code (*Terminal → Nueva terminal*).
3. Instala las dependencias (solo la primera vez; crea la carpeta `node_modules`):

   ```bash
   npm install
   ```

4. Levanta la página:

   ```bash
   npm run dev
   ```

5. Abre el enlace que aparece (normalmente http://localhost:5173). Si cambias algo en el código y guardas, la página se actualiza sola.
6. Para detenerla: `Ctrl + C` en la terminal.

## 2. Comandos útiles

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Levanta la página para trabajar |
| `npm test` | Karma abre Chrome y corre las pruebas; las vuelve a correr cada vez que guardas |
| `npm run test:ejecutar` | Corre las pruebas una sola vez (Chrome sin ventana) |
| `npm run test:cobertura` | Corre las pruebas y mide la cobertura de **todos** los archivos de `src/` (crea la carpeta `cobertura/`; abre `cobertura/html/index.html`) |
| `npm run build` | Genera la versión final en la carpeta `dist/` |

## 3. Dónde está cada cosa (para modificar)

```
public/img/            Imágenes (se usan como "/img/nombre.jpg")
src/
  main.jsx             Punto de entrada: carga Bootstrap, los estilos y <App />
  App.jsx              Navegación entre páginas + estado del carrito y del usuario
  index.css            Colores y fuentes de la pastelería
  components/          Piezas reutilizables
    Encabezado.jsx       Menú superior (props: cantidadCarrito, usuario, alCerrarSesion)
    PiePagina.jsx        Pie de página
    TarjetaProducto.jsx  Tarjeta de un producto (props: producto, alAgregar)
    Catalogo.jsx         Grilla de tarjetas (props: productos, alAgregar)
    TablaCarrito.jsx     Tabla del carrito (se usa en Carrito y Checkout)
    CampoTexto.jsx       Campo de formulario con etiqueta y mensaje de error
    CamposRegion.jsx     Selects de región y comuna
  pages/               Una por cada vista
    Inicio, Productos, DetalleProducto, Carrito, Checkout,
    Login, Registro, Contacto, Nosotros, Blogs, BlogDetalle, Admin
  data/
    productos.js         "Base de datos" de productos con CRUD (crear, leer, actualizar, eliminar) en localStorage
    blogs.js             Noticias del blog
    regiones.js          Regiones y comunas
  utils/
    carrito.js           Lógica del carrito (agregar, quitar, total...)
    validaciones.js      Reglas de los formularios (las mismas de la versión HTML)
    formato.js           Precio con formato chileno ($45.000)
  hooks/
    useFormulario.js     Estado y validación compartidos por todos los formularios
  test/                Pruebas unitarias Jasmine (*.test.js) y `configuracion.js`
```

### Cambios típicos

- **Agregar o cambiar un producto:** edita `productosIniciales` en `src/data/productos.js` (pon la imagen en `public/img/`). Si ya habías abierto la página, entra a **Admin → Restaurar productos originales** para ver el cambio, porque los productos quedan guardados en el navegador (localStorage).
- **Agregar una página nueva:**
  1. Crea `src/pages/MiPagina.jsx`.
  2. En `App.jsx`, impórtala y agrega un `case 'mipagina': return <MiPagina />` dentro de `paginaActual()`.
  3. En `Encabezado.jsx`, agrega `<Nav.Link href="#/mipagina">Mi página</Nav.Link>`.
- **Cambiar una regla de validación:** `src/utils/validaciones.js` (y su prueba en `src/test/validaciones.test.js`).
- **Cambiar colores:** `src/index.css`.

### Cómo funciona la navegación

Cada página tiene su dirección después del `#`: `#/productos`, `#/producto/3`, `#/blog/1`, `#/admin`...
`App.jsx` lee esa dirección y muestra la página que corresponde. El botón "atrás" del navegador funciona.

## 4. Pruebas

En total hay 198 pruebas (183 en `src/test/` y 15 en `src/karma/`), con Jasmine + Karma (`npm run test:ejecutar`). Cubren:

- **Renderizado:** la tarjeta muestra nombre, precio y stock; el catálogo dibuja una tarjeta por producto.
- **Renderizado condicional:** "Sin stock" y botón deshabilitado; aviso de catálogo vacío; los errores aparecen solo cuando hay errores.
- **Props:** los componentes reciben datos y funciones (`alAgregar`, `alIniciarSesion`...).
- **Estado:** el buscador filtra; los campos del formulario cambian al escribir.
- **Eventos:** clic en botones y envío de formularios (`userEvent`).
- **Mocks/espías:** `vi.fn()` para las funciones que llegan por props y `vi.spyOn(Storage.prototype, 'setItem')` para comprobar el guardado en localStorage.
- **Lógica:** carrito, CRUD de productos y validaciones, incluidos los casos límite.

## 5. Subir y actualizar en GitHub

### Primera vez (repositorio nuevo)

1. En github.com: **New repository** → nombre `pasteleria-mil-sabores-react` → **Public** → sin README → *Create repository*.
2. En la terminal de VS Code, dentro de la carpeta del proyecto:

   ```bash
   git init
   git add .
   git commit -m "Migración de la tienda a React con pruebas"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/pasteleria-mil-sabores-react.git
   git push -u origin main
   ```

   (`node_modules` no se sube porque está en `.gitignore`. Quien clone el proyecto solo hace `npm install`.)

### Cada vez que cambies algo

```bash
git add .
git commit -m "Describe aquí qué cambiaste"
git push
```

### Si trabajan varios en el equipo

Antes de empezar a trabajar, trae los cambios de los demás:

```bash
git pull
```

### Si ya tenían un repositorio con la versión HTML

Clónenlo, copien adentro el contenido de esta carpeta y suban los cambios con `add`, `commit` y `push`.
Así el profe ve en el historial de commits el paso de HTML a React.
