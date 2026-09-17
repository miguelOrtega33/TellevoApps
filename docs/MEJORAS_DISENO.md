# Bitácora de mejoras de diseño

## Paso 1 — Rediseño de la pantalla principal

Commit: `54b79eb feat(home): rediseñar la pantalla principal de Tellevo`

### Objetivo

Transformar la vista `tellevo` en una pantalla de inicio clara para pasajeros y conductores, priorizando las acciones y la información necesaria para elegir un viaje.

### Cambios aplicados

- Se reemplazó el fondo azul uniforme por una superficie clara y una cabecera de bienvenida en tonos turquesa.
- Se incorporaron las acciones principales: **Buscar viaje** y **Publicar ruta**.
- Se sustituyeron las tarjetas giratorias por tarjetas estáticas, utilizables con toque en dispositivos móviles.
- Cada tarjeta ahora presenta conductor, estado de verificación, cupos, ruta, horario y una acción para ver el viaje.
- Se agregó una navegación de menú accesible en la cabecera.
- Se unificó el color primario de Ionic con la paleta turquesa usada en la nueva pantalla.
- Se ajustó el presupuesto de estilos por componente a 4 KB de advertencia y 6 KB de error, acorde al tamaño del rediseño.

### Validación

- `npm.cmd run build` finaliza correctamente.
- Se revisó la pantalla en `http://127.0.0.1:4200/tellevo` en vista de escritorio.

### Próximo paso sugerido

Aplicar el mismo sistema visual a las vistas de inicio de sesión, listado completo de viajes y mapa; después, reemplazar los datos de demostración por rutas reales.

## Paso 2 — Acceso, viajes y publicación de rutas

Commit: `b2c491e feat(trips): publicar y solicitar rutas locales`

### Cambios aplicados

- Se eliminó el guard que validaba solo un valor `autenticado` en el navegador.
- Se centralizó el acceso en `AuthService`: las contraseñas se almacenan como hash SHA-256 con una sal aleatoria y la sesión no contiene la contraseña.
- Se protegieron las vistas privadas y se ocultó el menú hasta iniciar sesión.
- Se rediseñaron inicio de sesión, registro y recuperación de contraseña con validación accesible por campo.
- Se eliminaron las páginas de plantilla `folder` y `carga`, además de imágenes, tarjetas giratorias y claves de servicios externos sin uso.
- Se reemplazó Google Maps embebido por un formulario de publicación de rutas que guarda origen, destino, hora, cupos, costo y descripción.
- Se agregó `TripService`, que provee rutas iniciales, publica nuevas rutas y conserva las solicitudes de viaje localmente.
- Se rediseñó el listado de viajes con búsqueda, estado de cupos, precios y confirmación de solicitud.
- Se agregaron pruebas unitarias para el servicio de viajes y se retiraron pruebas de plantilla inválidas.

### Validación

- `npm.cmd run build` finaliza correctamente.
- La pantalla de inicio de sesión fue comprobada en la vista previa local.
- `npm.cmd test -- --watch=false --browsers=ChromeHeadless` no pudo iniciar Chrome Headless por un error de GPU y perfil de Chrome del equipo. La compilación de las pruebas sí llegó a completarse antes del fallo del navegador.

### Límite de la versión actual

El proyecto sigue siendo una aplicación sin servidor. El hash evita conservar contraseñas legibles, pero un inicio de sesión realmente seguro, recuperación por correo, control de solicitudes y almacenamiento compartido requieren una API con base de datos, tokens de sesión y reglas de autorización del lado del servidor.

## Paso 3 — Evolución hacia experiencia tipo ride-hailing

Commits:

- `1542496 feat(trips): agregar motor de viajes compartidos`
- `541f47b feat(home): convertir inicio en tablero operativo`
- `488a272 feat(rides): mejorar busqueda y solicitud de viajes`
- `dd4f507 feat(driver): publicar rutas con estimacion local`
- `e61faff feat(rides): cerrar solicitudes desde pasajero y conductor`

### Cambios aplicados

- Se amplió el modelo de viajes con estados, solicitudes por pasajero, vehículo, rating, cupos calculados, distancia, duración, ETA y precio sugerido.
- Se centralizó la lógica de dominio en `TripService`: publicación, solicitud, aceptación, rechazo, cancelación, inicio y completado de viajes.
- La pantalla principal ahora funciona como tablero: métricas, viaje activo del pasajero, consola del conductor y rutas cercanas.
- El listado de viajes permite filtrar por rutas disponibles, viajes propios o todos los viajes.
- La solicitud de cupo admite una nota de recogida y valida cupos antes de persistir.
- La publicación de rutas ya no depende de una clave externa de mapas para funcionar localmente.
- El formulario de conductor calcula una estimación local y sugiere precio antes de publicar.
- Se agregó documentación técnica en `docs/ARQUITECTURA_TELLEVO.md`.

### Validación

- `npm.cmd run build` finaliza correctamente después de cada bloque funcional.
- Los avisos restantes corresponden a selectores internos de Ionic durante el procesamiento CSS.

### Límite de la versión actual

La app ya permite recorrer un flujo local completo, pero sigue siendo un MVP sin servidor. Para acercarse a producción necesita API, base de datos, ubicación en tiempo real, notificaciones, chat, pagos y autorización del lado del servidor.
