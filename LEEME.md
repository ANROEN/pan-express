# 🥖 PAN EXPRESS — Prototipo funcional

App de **pedido de pan a domicilio** con control de ventas, gastos, repartidores,
insumos, finanzas y alertas. Este es un **prototipo funcional** que corre 100% en
el navegador (sin instalar nada ni contratar servidores todavía).

---

## ▶️ Cómo abrirlo

1. Abre el archivo **`index.html`** con doble clic (se abre en tu navegador).
   - Funciona en PC, tablet y celular.
   - Recomendado: Chrome, Edge o Safari.
2. Elige un rol en la pantalla de inicio:
   - **🛒 Soy Cliente** → hacer un pedido de pan.
   - **🔐 Administrador** → panel de gestión.
     - Usuario: **`admin`** · Contraseña: **`1234`**

> Los datos se guardan en **este dispositivo** (localStorage del navegador).
> Para volver a los datos de ejemplo, usa **"Reiniciar datos de demostración"**
> en la pantalla de inicio.

---

## 📦 Qué incluye este prototipo

### Módulo Cliente
- Catálogo: Marraqueta, Hallulla, Pan amasado, Pan integral, Pan especial.
- Selección de cantidad por kilo, dirección, hora y método de pago
  (efectivo, transferencia, tarjeta, pago online).
- **Seguimiento del pedido en vivo**: recibido → preparación → reparto → entregado.

### Pedidos por WhatsApp (simulador)
- Escribe un mensaje natural como *"Quiero 3 kilos de marraqueta para las 18:00"*
  y el sistema **interpreta el pedido, lo crea, asigna número e informa el precio**.
- Esto es lo que en producción haría la **WhatsApp Business API**.

### Panel Administrador
- **Dashboard**: ventas del día, N° de pedidos, clientes nuevos/frecuentes y alertas.
- **Pedidos**: tabla en tiempo real, avanzar estado y asignar repartidor.
- **Clientes**: base de datos, historial y frecuencia de compra.
- **Repartidores**: registro, entregados/pendientes, horas y km.
- **Insumos**: stock de harina, levadura, sal y bolsas con **alerta de stock bajo**.
- **Gastos**: planilla de sueldos, mantención de vehículos y egresos.
- **Finanzas**: ingresos − egresos = **utilidad**, con desglose.
- **Reportes**: diario, productos más vendidos y resumen mensual.
- **Alertas 🔔**: pedidos pendientes, stock bajo, vehículo a mantención,
  cliente frecuente inactivo (15+ días). Con **alarma sonora opcional**
  (botón "Activar sonido" en el menú).

---

## 🗂️ Estructura del proyecto

```
Panaderia/
├── index.html          ← punto de entrada
├── css/styles.css      ← diseño
└── js/
    ├── store.js        ← datos y persistencia (futuro: PostgreSQL/MySQL)
    ├── utils.js        ← formato, alertas y notificaciones
    ├── whatsapp.js     ← intérprete de pedidos por WhatsApp
    ├── views.js        ← todas las pantallas
    └── app.js          ← navegación, login y alarmas
```

---

## 🚀 Camino a la versión de producción

Este prototipo demuestra **toda la lógica del negocio**. Para convertirlo en la app
real que describes, los siguientes pasos:

| Necesidad             | Tecnología recomendada                          |
|-----------------------|-------------------------------------------------|
| Base de datos real    | **PostgreSQL** o MySQL                           |
| Backend / API         | Node.js + Express (o similar)                    |
| App cliente Android/iOS | React Native o Flutter (reutiliza esta lógica)|
| Pedidos automáticos   | **WhatsApp Business API**                        |
| Direcciones y rutas   | **Google Maps API**                             |
| Pagos online          | **Transbank Webpay** y **Mercado Pago**         |
| Panel administrador   | Web (este mismo diseño, conectado al backend)    |

El diseño visual, los flujos y las reglas (precios, estados, alertas, finanzas)
ya están definidos aquí y se pueden trasladar directo al desarrollo final.

---

*Prototipo creado el 16-06-2026. Listo para mostrar y probar.*
