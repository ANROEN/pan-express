# 🥖 PAN EXPRESS — App de gestión de panadería

App **real y local** para gestionar tu panadería: pedidos, clientes, repartidores,
insumos, gastos, finanzas, reportes y alertas. Guarda todo en una **base de datos
en tu propio PC** (SQLite). **No necesita internet, ni contraseñas, ni pagos mensuales.**

---

## ▶️ Cómo abrir la app (lo único que necesitas hacer)

### Doble clic en **`Pan Express (abrir).bat`**

- Se abrirá una ventana negra (es el "motor" de la app) y, a los pocos segundos,
  la app se abrirá sola en tu navegador.
- **Deja la ventana negra abierta** mientras usas la app.
- Para **cerrar la app**, simplemente cierra esa ventana negra.

> La primera vez puede tardar un poco más (prepara los componentes). Las siguientes
> veces abre al instante.

Si el navegador no abrió solo, entra a: **http://localhost:3000**

---

## 🔐 Entrar como administrador
- En la pantalla de inicio elige **Administrador**.
- Usuario: **`admin`** · Contraseña: **`1234`**
- (Esta clave se puede cambiar más adelante.)

## 🛒 Vista cliente
- Elige **Soy Cliente** para hacer un pedido (catálogo, cantidad, dirección, pago).
- Los pedidos que se crean aquí aparecen en el panel del administrador.

---

## 💾 ¿Dónde se guardan mis datos?

Todo queda guardado en el archivo:

```
server/panexpress.db
```

- Es tu base de datos. Si lo respaldas (copias a un pendrive o la nube), respaldas
  TODO tu negocio.
- Para empezar de cero, puedes borrar ese archivo: la app creará uno nuevo con datos
  de ejemplo la próxima vez que la abras.

---

## 🗂️ Estructura del proyecto

```
Panaderia/
├── Pan Express (abrir).bat   ← ABRE LA APP con doble clic
├── index.html                ← interfaz
├── css/styles.css            ← diseño
├── js/                       ← lógica de la app
│   ├── store.js  (conecta con la base de datos)
│   ├── utils.js, whatsapp.js, views.js, app.js
└── server/
    ├── server.js             ← el "motor" (Node.js + SQLite)
    ├── package.json
    └── panexpress.db         ← TU BASE DE DATOS (tus datos reales)
```

---

## ❓ Preguntas frecuentes

**¿Necesito internet?** No. Funciona completamente en tu PC.

**¿Tiene costo?** No. Es gratis.

**¿Puedo usarla desde el celular?** Sí, si el celular está en la misma red WiFi que
el PC. (Lo configuramos cuando quieras.)

**¿Y la versión online para que los clientes pidan desde cualquier lugar, con WhatsApp
automático y pago con tarjeta?** Eso es un paso posterior (tiene costos mensuales por
los servicios externos). Esta versión local ya te sirve para gestionar el día a día.

---

*App local creada con Node.js + SQLite. Sin dependencias de pago.*
