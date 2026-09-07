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
