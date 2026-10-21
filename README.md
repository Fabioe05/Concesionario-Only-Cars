# Only Cars

Aplicación web para un concesionario de vehículos: **catálogo público** para los clientes y **panel de administración** para gestionar el inventario.

**Demo:** https://concesionario-only-cars.onrender.com/

---

## Índice

- [Características](#características)
- [Stack](#stack)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Scripts](#scripts)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API](#api)
- [Modelos de datos](#modelos-de-datos)
- [Roles](#roles)
- [Cómo funciona](#cómo-funciona)
- [Seguridad](#seguridad)
- [Despliegue en Render](#despliegue-en-render)
- [Mantenimiento](#mantenimiento)
- [Estado del proyecto](#estado-del-proyecto)
- [Autor](#autor)

---

## Características

- **Catálogo público** con filtro por marca y orden por precio o año.
- **Ficha del vehículo** con galería, visor ampliado y especificaciones completas.
- **Contacto directo** por WhatsApp (mensaje prellenado) y correo.
- **Registro e inicio de sesión** con contraseña hasheada y sesión en cookie `httpOnly`.
- **Panel de administración** con CRUD de vehículos y hasta 10 imágenes por publicación.
- **Gestión de marcas** con reglas de negocio: sin duplicados y sin borrar una marca que tenga vehículos.
- **Imágenes guardadas en MongoDB**, para que sobrevivan a los despliegues.
- **Diseño adaptable** de 360 px (móvil) a 1920 px (escritorio).

---

## Stack

| Herramienta | En el proyecto sirve para... |
|---|---|
| **Node.js** | Entorno de ejecución del backend. |
| **Express 5** | Framework HTTP: rutas, middlewares y archivos estáticos. |
| **MongoDB Atlas** | Base de datos en la nube: usuarios, vehículos, marcas e imágenes. |
| **Mongoose 9** | Esquemas, validación y consultas. |
| **jsonwebtoken** | Genera el JWT de sesión (7 días). |
| **bcrypt** | Hashea las contraseñas y las compara al entrar. |
| **cookie-parser** | Lee la cookie `accessToken` en cada petición. |
| **Multer** | Recibe las imágenes **en memoria** (máx. 5 MB, solo `image/*`). |
| **dotenv** | Carga las variables desde `.env`. |
| **cors** | Habilita CORS en la API (la app es de mismo origen, así que no lo necesita). |
| **HTML / CSS / JS vanilla** | Todo el frontend, sin frameworks ni build. |
| **Render** | Hosting del servidor Express. |

---

## Requisitos

- **Node.js 18 o superior** (probado con Node 24).
- **npm** (incluido con Node).
- **Git**.
- Una base de datos **MongoDB**: Atlas (recomendado) o local.

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Fabioe05/Concesionario-Only-Cars.git
cd Concesionario-Only-Cars
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo `.env`

En la raíz del proyecto, crea un archivo llamado `.env`:

```env
ACCESS_TOKEN_SECRET=cadena-larga-y-aleatoria
MONGO_URI_TEST=mongodb+srv://usuario:contraseña@cluster.mongodb.net/concesionario
PORT=3000
NODE_ENV=development
```

| Variable | Obligatoria | Para qué |
|---|---|---|
| `ACCESS_TOKEN_SECRET` | Sí | Firma y verifica los JWT. Si cambia, todas las sesiones abiertas dejan de valer. |
| `MONGO_URI_TEST` | Sí | Cadena de conexión de MongoDB. El nombre se conserva por compatibilidad con el proyecto. |
| `PORT` | No | Puerto del servidor. Por defecto, `3000`. |
| `NODE_ENV` | No | Con `production`, la cookie de sesión se marca `secure` (solo HTTPS). |

Para generar un secreto seguro:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

> `.env` está en `.gitignore`: **nunca** lo subas al repositorio.

### 4. Preparar MongoDB Atlas

1. Crea un **cluster gratuito** en [MongoDB Atlas](https://www.mongodb.com/atlas).
2. En **Database Access**, crea un usuario con contraseña.
3. En **Network Access**, añade tu IP. Para desarrollo puedes usar `0.0.0.0/0` (en producción, restíngelo).
4. En **Connect → Drivers**, copia la cadena de conexión, sustituye la contraseña y añade el nombre de la base de datos al final, por ejemplo:

   ```
   mongodb+srv://usuario:contraseña@cluster0.xxxxx.mongodb.net/concesionario
   ```

5. Pega la cadena en `MONGO_URI_TEST`.

Las colecciones (`users`, `Vehiculos`, `Marcas`, `Imagenes`) se crean solas en el primer guardado.

### 5. Arrancar

```bash
npm run dev    # desarrollo, con recarga automática (nodemon)
npm start      # ejecución normal
```

Abre **http://localhost:3000**.

### 6. Crear el primer administrador

El registro público crea siempre usuarios con rol `cliente`. Para habilitar el panel:

1. Regístrate en `/contenedorPrincipal/registro/registro.html`.
2. En Atlas → **Browse Collections** → `users`, abre tu documento y cambia `"role": "cliente"` por `"admin"`. También puedes hacerlo desde `mongosh`:

   ```js
   db.users.updateOne(
     { email: "tu@correo.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Cierra sesión y vuelve a entrar.** El rol viaja dentro del JWT: la cookie anterior sigue diciendo `cliente` hasta que se emite una nueva.

Con la sesión de administrador ya puedes entrar a `/admin/admin.html` y crear vehículos y marcas.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm start` | Arranca el servidor con Node. |
| `npm run dev` | Arranca con `nodemon` y recarga al guardar. |
| `node scripts/limpiar-huerfanos.js` | Lista los archivos de `public/uploads` que ningún vehículo referencia. |
| `node scripts/limpiar-huerfanos.js --aplicar` | Elimina esos archivos. |

---

## Estructura del proyecto

```
concesionario/
├── server.js                 # Express: middlewares, estáticos, routers y conexión
├── sesion.js                 # Navbar compartido: perfil, login/logout
├── index.html · index.css · index.js   # Landing pública
│
├── controllers/              # Rutas de la API
│   ├── auth.js               #   Registro, login, logout, perfil
│   ├── vehiculos.js          #   CRUD de vehículos
│   ├── marcas.js             #   Listado público y alta/baja (admin)
│   └── imagenes.js           #   Sirve el binario de las imágenes
│
├── models/                   # Esquemas de Mongoose
│   ├── User.js
│   ├── Vehiculo.js
│   ├── Marca.js
│   └── Imagen.js
│
├── middlewares/
│   ├── auth.js               #   userExtractor (JWT) y requireAdmin
│   └── upload.js             #   Multer: memoria, 5 MB, solo imágenes
│
├── utils/
│   ├── almacenamiento.js     #   Guarda imágenes en MongoDB y devuelve URLs
│   └── imagenes.js           #   Borra imágenes (locales y de la base)
│
├── scripts/
│   └── limpiar-huerfanos.js  #   Limpia public/uploads
│
├── admin/                    # Panel: admin.html · admin.css · admin.js
├── contenedorPrincipal/      # Zona pública
│   ├── auth.css
│   ├── login/ · registro/
│   └── vehiculos/            #   listado.html (catálogo) · vehiculo.html (ficha)
│
└── public/
    ├── img/                  # Logos e iconos
    └── uploads/              # Imágenes locales antiguas
```

---

## API

Las rutas marcadas como **Admin** requieren sesión con rol `admin` (cookie `accessToken`). Son **14 endpoints** repartidos en cuatro routers.

### Autenticación — `/api/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/register` | Público | Crea un usuario con rol `cliente`. |
| `POST` | `/login` | Público | Inicia sesión y guarda el JWT en una cookie. |
| `POST` | `/logout` | Público | Elimina la cookie de sesión. |
| `GET` | `/me` | Sesión | Datos del usuario autenticado. |

### Vehículos — `/api/vehiculos`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/` | Público | Listado, con filtros por query (`?marca=`, `?status=`…). |
| `GET` | `/:id` | Público | Detalle de un vehículo. |
| `GET` | `/marca/:marca` | Público | Vehículos de una marca. |
| `POST` | `/` | **Admin** | Crea un vehículo (`multipart/form-data`, campo `imagenes`, máx. 10). |
| `PUT` | `/:id` | **Admin** | Actualiza un vehículo (`multipart/form-data`). |
| `DELETE` | `/:id` | **Admin** | Elimina un vehículo y sus imágenes. |

### Marcas e imágenes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/marcas` | Público | Lista todas las marcas. |
| `POST` | `/api/marcas` | **Admin** | Crea una marca (400 si está vacía, 409 si ya existe). |
| `DELETE` | `/api/marcas/:id` | **Admin** | Elimina una marca (409 si algún vehículo la usa). |
| `GET` | `/api/imagenes/:id` | Público | Devuelve el binario de una imagen con su `Content-Type`. |

---

## Modelos de datos

| Modelo | Campos |
|---|---|
| **User** | `name` · `email` (único) · `passwordHash` · `role` (`admin` \| `cliente`) · `active` · timestamps |
| **Vehiculo** | `marca_id` (ref → Marca) · `marca` · `modelo` · `anio` · `motor` · `transmision` (`manual` \| `automatica`) · `kilometraje` · `owners` · `precio` · `status` (`disponible` \| `vendido` \| `reservado`) · `description` · `images[]` · timestamps |
| **Marca** | `name` · `status` · timestamps |
| **Imagen** | `data` (Buffer) · `contentType` · `size` · timestamps |

Los vehículos guardan `marca_id` (referencia) y `images[]` con URLs del tipo `/api/imagenes/<id>`. Las imágenes no se embeben en el vehículo: viven en su propia colección.

---

## Roles

| Rol | Alcance |
|---|---|
| **Invitado** | Catálogo, fichas, marcas y registro. |
| **`cliente`** | Lo anterior + sesión y perfil. |
| **`admin`** | Todo + panel, CRUD de vehículos y gestión de marcas. |

---

## Cómo funciona

### Arquitectura

```
Navegador (HTML/CSS/JS vanilla)
        │  fetch("/api/...")
        ▼
Express (server.js)
   ├── middlewares: json → cookies → estáticos (lista blanca)
   ├── /api/auth       → controllers/auth.js
   ├── /api/vehiculos  → controllers/vehiculos.js
   ├── /api/marcas     → controllers/marcas.js
   └── /api/imagenes   → controllers/imagenes.js
        │  Mongoose
        ▼
MongoDB Atlas (users · Vehiculos · Marcas · Imagenes)
```

Los estáticos se sirven por **lista blanca** (`/img`, `/uploads`, `/admin`, `/contenedorPrincipal` y los archivos de la portada). El resto del proyecto —código fuente, `package.json`, `.env`— **no** se expone.

### Flujo de una petición

1. El navegador pide una página (HTML) o hace `fetch` a la API.
2. Express aplica los middlewares generales: parseo de JSON, cookies y estáticos.
3. Si la ruta empieza por `/api/...`, entra al router y después al controlador.
4. El controlador valida, aplica reglas de negocio y consulta MongoDB con Mongoose.
5. Devuelve JSON o, en el caso de las imágenes, el binario con su `Content-Type`.

### Autenticación y sesión

- **Registro:** la contraseña se hashea con bcrypt y el usuario se crea con rol `cliente`. `toJSON` elimina `passwordHash` de cualquier respuesta.
- **Login:** se busca el usuario, se compara la contraseña y se firma un JWT (`{ id, email, role }`, 7 días) que viaja en una cookie `accessToken` con `httpOnly`, `sameSite: strict` y `secure` cuando `NODE_ENV=production`.
- **Petición protegida:** `userExtractor` lee la cookie, verifica el JWT, carga el usuario y lo deja en `req.user`. Sin cookie → **401**; token inválido o vencido → **403**.
- **Autorización:** `requireAdmin` exige `req.user.role === "admin"` en todas las escrituras.
- **Logout:** el servidor borra la cookie y el frontend limpia `localStorage`.

El frontend guarda el nombre y el rol en `localStorage` **solo** para pintar la interfaz; la confianza real está en la cookie verificada en el servidor.

### Imágenes: de la subida a la pantalla

```
Formulario (multipart/form-data)
   │
   ▼
Multer (memoryStorage) → req.files[i].buffer   (nunca toca el disco)
   │
   ▼
subirImagenes() → documento en "Imagenes" (Buffer + contentType)
   │
   ▼
vehiculo.images[] → "/api/imagenes/<id>"
```

El navegador pide esa URL y el controlador devuelve el binario con `Cache-Control: immutable`.

- **Si falla el guardado**, se borran las imágenes ya creadas para no dejar huérfanas.
- **Al editar**, `keepExistingImages` indica las que se conservan; las descartadas se borran.
- **Al eliminar** un vehículo, se borran todas sus imágenes.

**¿Por qué en la base de datos y no en disco?** El disco de los hosts gratuitos (Render) es efímero y se borra en cada despliegue. Guardar el binario en MongoDB garantiza que las imágenes persistan.

### Frontend

Cada página es un HTML con su propio script. `sesion.js` es el único compartido: lo cargan las páginas públicas y se encarga del navbar (login/registro, perfil y cierre de sesión). El panel tiene su propio `admin/admin.js`. Toda la comunicación es con `fetch` a rutas de la misma aplicación.

---

## Seguridad

| Riesgo | Medida |
|---|---|
| Contraseñas | bcrypt: hash con sal, nunca en claro. |
| Sesión | JWT en cookie `httpOnly`, `sameSite: strict` y `secure` en producción. |
| Escrituras | `userExtractor → requireAdmin` en todas las rutas de administración. |
| Fuga de datos | `toJSON` elimina `passwordHash` y `__v` de las respuestas. |
| Archivos internos | Lista blanca de estáticos: el código y el `.env` no se sirven. |
| Subidas | Multer en memoria, máximo 5 MB y solo `image/*`. |
| Datos inválidos | Validación de Mongoose + comprobaciones en los controladores. |

---

## Despliegue en Render

1. Crea un **Web Service** conectado al repositorio.
2. Configuración:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. Añade las variables de entorno en **Environment**:
   - `ACCESS_TOKEN_SECRET`
   - `MONGO_URI_TEST`
   - `NODE_ENV=production`
   - (`PORT` lo inyecta Render automáticamente.)
4. En Atlas, permite las IP de Render en **Network Access**.

Notas:

- El plan gratuito **duerme la instancia** por inactividad: la primera visita puede tardar 30–60 segundos en responder.
- El disco es efímero; por eso las imágenes se guardan en MongoDB.
- Con `NODE_ENV=production`, la cookie se marca `secure`: la app debe servirse por HTTPS (Render lo hace).

---

## Mantenimiento

`scripts/limpiar-huerfanos.js` recorre `public/uploads` y detecta los archivos que ningún vehículo referencia (imágenes locales antiguas, anteriores a guardar los binarios en MongoDB).

```bash
node scripts/limpiar-huerfanos.js            # solo lista
node scripts/limpiar-huerfanos.js --aplicar  # elimina
```

---

## Estado del proyecto

- Catálogo, ficha, filtros y orden.
- Registro, login, logout y sesión con roles.
- Panel de administración con CRUD de vehículos.
- Gestión de marcas con reglas de negocio.
- Subida y borrado de imágenes en MongoDB.
- Contacto por WhatsApp y correo.
- Diseño responsive.
- Despliegue en Render.

---

## Autor

Proyecto creado y desarrollado por **Fabio Espinoza**.

- GitHub: [@Fabioe05](https://github.com/Fabioe05)
- Repositorio: [Concesionario-Only-Cars](https://github.com/Fabioe05/Concesionario-Only-Cars)
