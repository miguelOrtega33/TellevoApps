# Arquitectura funcional de Tellevo

## Objetivo del MVP

Tellevo queda orientada como una app de viajes compartidos locales, con una experiencia base similar a un servicio de ride-hailing:

- pasajeros buscan rutas, comparan datos del viaje y solicitan cupo;
- conductores publican rutas, reciben solicitudes, aceptan o rechazan pasajeros;
- los viajes tienen estados recuperables: disponible, solicitado, aceptado, en curso, completado y cancelado;
- la app funciona sin backend usando `localStorage`, lo que permite probar el flujo completo en desarrollo local.

## Modulos principales

- `AuthService`: maneja usuarios locales, hash de contrasena, sesion y recuperacion local.
- `TripService`: concentra el dominio de viajes, solicitudes, estados, cupos, estimaciones y metricas.
- `tellevo`: tablero principal con resumen, viajes activos y consola de conductor.
- `viajes`: busqueda, filtros, solicitud y cancelacion de viajes.
- `mapa`: publicacion de rutas con estimacion local de distancia, duracion, ETA y precio sugerido.

## Modelo de viaje

El modelo `Trip` contiene:

- datos del conductor: nombre, correo, vehiculo y rating;
- datos de ruta: origen, destino, salida, distancia, duracion, ETA y precio;
- capacidad: cupos totales y cupos disponibles calculados desde solicitudes aceptadas;
- estado general del viaje;
- solicitudes de pasajeros con estado propio.

Esto permite que la UI derive el estado desde una sola fuente y evita duplicar reglas en cada pantalla.

## Flujo pasajero

1. Entra a `Viajes`.
2. Filtra por rutas disponibles, propias o todas.
3. Revisa conductor, vehiculo, cupos, precio, distancia y ETA.
4. Solicita un cupo con una nota opcional de recogida.
5. Sigue el estado desde `Inicio` o `Mis viajes`.
6. Puede cancelar una solicitud pendiente.

## Flujo conductor

1. Publica ruta desde `Publicar ruta`.
2. La app calcula una estimacion local y sugiere precio.
3. El conductor registra vehiculo, cupos, costo y notas.
4. En `Inicio` ve solicitudes pendientes.
5. Puede aceptar o rechazar pasajeros.
6. Cuando hay pasajeros aceptados puede iniciar y completar el viaje.

## Decisiones tecnicas

- Se dejo `localStorage` como almacenamiento temporal para mantener el alcance del MVP sin servidor.
- Se quito la dependencia obligatoria de Google Maps: sin una clave real, bloquear la publicacion hacia que el producto dejara de funcionar.
- La estimacion local usa coordenadas conocidas para comunas frecuentes y un fallback deterministico para otras rutas.
- La logica de estados vive en `TripService`, no en componentes, para simplificar futuras migraciones a API.

## Validacion actual

- `npm.cmd run build` compila correctamente.
- Los avisos de CSS provienen de selectores internos de Ionic y no bloquean la aplicacion.

## Limites conocidos

- No hay backend, base de datos compartida ni autenticacion real de produccion.
- No hay geolocalizacion en tiempo real.
- No hay pagos, chat, notificaciones push ni verificacion de identidad.
- Las estimaciones son aproximadas y sirven como fallback local.

## Siguientes hitos recomendados

- Crear una API con usuarios, rutas, solicitudes y autorizacion por token.
- Agregar geolocalizacion real y proveedor de mapas con clave restringida.
- Incorporar chat pasajero-conductor.
- Agregar calificaciones, historial persistente y reportes.
- Crear pruebas e2e del flujo completo: registro, publicar ruta, solicitar, aceptar, iniciar y completar.
