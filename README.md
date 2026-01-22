# Boveda del Coleccionista (SPA Vanilla)

Proyecto integrador de Etapa 2: SPA en HTML/CSS/JS sin frameworks. El objetivo es practicar routing, estado global, URL como estado, CRUD, fetch, validaciones y persistencia local.

---
## Como correr

1) Abrir el proyecto con Live Server o cualquier servidor estatico.
2) Navegar a `index.html`.
3) Usar el selector de rol en el header para cambiar de Visitante / Coleccionista / Especialista.

No se requiere build ni bundler.  

## Pagina de prueba  
https://porfoliofullstack.github.io/ET2-Bobeda-del-coleccionista/

---

## Rutas principales (hash routing)

- `/#/` Marketplace
- `/#/item/:id` Detalle de item
- `/#/dashboard` Inventario del coleccionista
- `/#/validator` Bandeja del especialista
- `/#/about` Disclaimer / etica

## Marketplace (URL como estado)

Los filtros actualizan el estado global y el querystring del hash. Copiar y pegar una URL reproduce la misma vista.

Filtros: busqueda, categoria, ubicacion, precio minimo, precio maximo, solo validados, orden.

Ejemplos para probar:
- `/#/?cat=art&min=500&sort=price_desc`
- `/#/?q=card&loc=ROS&cert=1`
- `/#/?cat=hardware&max=600&sort=price_asc`

## Dashboard (CRUD Coleccionista)

CRUD completo de items del coleccionista:
- Crear item desde el formulario.
- Editar item con el boton "Editar".
- Eliminar item con "Eliminar".
- Estado vacio con CTA para crear.

Validaciones minimas:
- campos requeridos
- precio positivo
- URL valida para imagen

## Flujo de validacion (Especialista)

1) Desde Dashboard (rol Coleccionista): "Solicitar validacion".
2) Desde Validator (rol Especialista): aprobar o rechazar con nota y estimacion.
3) El resultado se ve en:
   - Marketplace (badge)
   - Detalle del item (certificado)
   - Filtro "Solo validados" (solo aprobados)

El nivel de confianza del especialista aumenta con cada validacion resuelta.

## Persistencia

Se usa localStorage para:
- sesion (rol + userId)
- items, validaciones y especialistas

Para resetear datos locales:
- abrir DevTools > Application > Local Storage
- eliminar claves `boveda_session_v1` y `boveda_data_v1`

## Datos

Seed inicial en `/data/*.json` cargado via fetch:
- `data/items.json`
- `data/specialists.json`
- `data/validations.json`

## Arquitectura

Estructura modular por features:

```
/
index.html
css/styles.css
js/
  app.js
  router/
  store/
  services/
  ui/
  features/
  utils/
data/
```

## Como probar end-to-end

1) Abrir `index.html` con Live Server.
2) Ir a `/#/` y verificar que se cargan items.
3) Aplicar filtros y confirmar que la URL cambia.
4) Copiar una URL con filtros, abrir en otra pestana y verificar que se reconstruye.
5) Cambiar rol a Coleccionista y entrar a `/#/dashboard`.
6) Crear un item y confirmar que aparece en la lista.
7) Editar el item y verificar los cambios.
8) Solicitar validacion desde el item.
9) Cambiar rol a Especialista y entrar a `/#/validator`.
10) Aprobar o rechazar la solicitud con nota.
11) Volver a `/#/item/:id` y verificar certificado y badge.
12) Volver al Marketplace y usar "Solo validados".

## Criterios de aceptacion (MVP)

- Filtros actualizan URL y render sin recargar.
- URL compartible reconstruye la vista.
- CRUD del coleccionista con persistencia local.
- Validacion crea certificado y cambia estado visible.
- Back/forward funciona en el router.
- Errores de fetch muestran mensaje en UI.
