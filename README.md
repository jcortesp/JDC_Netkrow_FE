# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Equipos listos, recordatorios y gastos

En Servicio Técnico, cada equipo empieza «En servicio». Para usar «Listo para entrega», Brazalete, Revisión, Mantenimiento, Limpieza y Calibración deben estar en OK; Pilas puede estar en OK, NA o N/A. Si falta alguna condición, la pantalla indica cuáles campos deben corregirse. Esta acción registra su fecha UTC una sola vez y bloquea el botón y los campos, tanto en pantalla como en la API. No hay reapertura en este flujo.

«Enviar estado por WhatsApp» está disponible de manera independiente y no cambia estados ni fechas. Los recordatorios son por equipo: aparecen a los 15 días completos desde que quedó listo, aunque nunca se haya enviado un WhatsApp. Después de enviar un recordatorio, «Ya lo envié» registra su fecha; el siguiente estará disponible 15 días después. Abrir o cancelar un chat no registra el envío.

La entrega sigue siendo de toda la remisión, incluso si contiene equipos en servicio: todos pasan a entregados y salen del reporte. Los equipos dados de baja conservan ese estado. Dar de baja la remisión también termina el seguimiento. Las garantías abiertas siguen las mismas reglas de equipos; cerrarlas excluye sus equipos.

Los avisos antiguos se conservan como historial, pero no se convierten en fechas de listo: cada equipo requiere una marca explícita. La migración V3 agrega las fechas sin alterar datos anteriores. Al publicar, aplicar primero el backend con V3 y después el frontend; las antiguas confirmaciones por remisión devuelven un aviso para actualizar la página.

«Ver gastos», desde la barra o desde «Registrar gasto», permite filtrar por Desde/Hasta (ambos días incluidos). Sin filtros consulta todo el historial. El total se calcula en el servidor con precisión decimal a partir del conjunto completo consultado; se muestra el rango aplicado y se puede limpiar el filtro.

Validaciones locales: `npm test` (Node 22.18+ o 24+), `npm run build` y pruebas Maven del backend con Java 21. Las pruebas de repositorios usan H2 temporal, sin conexión a producción; no sustituyen aplicar V3 en PostgreSQL durante el despliegue.

Vista de prueba local: iniciar `npm run dev -- --host 127.0.0.1 --port 5175` y abrir `http://127.0.0.1:5175/tests/preview.html`. Buscar `PRUEBA-1`. Todos los datos son simulados y las llamadas API se interceptan localmente; esta vista no forma parte del build de producción.
