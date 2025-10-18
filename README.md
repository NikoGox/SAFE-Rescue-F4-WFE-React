<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# SAFE Rescue

*Gestión eficiente y rápida de incidentes en situaciones de emergencia.*

<p align="center">
  <img src="SRCover.png" alt="Portada SAFE Rescue" width="900px">
</p>

SAFE Rescue es una aplicación diseñada para la gestión eficiente y rápida de incidentes en situaciones de emergencia. Esta herramienta permite a los equipos de respuesta coordinar recursos, monitorear el desarrollo de incidentes y tomar decisiones informadas en tiempo real. Con un enfoque en la seguridad y la comunicación efectiva, SAFE Rescue optimiza la respuesta a emergencias y ayuda a mitigar los riesgos en situaciones críticas.

---

## Últimos cambios

### ❚❙❘ VERSIÓN 1.0.4.1

  >   ├─• Se eliminó navbar duplicado.
> <br>├─• Se le agregó sombreado al navbar.
> <br>├─• Se incluyo la tecnica CSS Modules para evitar conflictos entres estilos.
> <br>├─• Se importó la libreria React-Icons para mejorar el apartado visual de la aplicación.
> <br>├─• El archivo Incidentes.css se renombró a Incidentes.module.css y se importo a la pagina Incidentes.
> <br>├─• Se eliminaron emojis que sobresaturaban el diseño de la aplicación.
> <br>├─• Se corrigierón las rutas de las imagenes.
> <br>├─• Se agregarón nuevos iconos planos y minimalistas.

---

## Características Principales

### Coordinación y Comunicación Centralizada
La comunicación oportuna hace la diferencia. SAFE Rescue proporciona un canal de comunicación unificado que permite a las centrales de alarma y a los equipos en terreno estar perfectamente sincronizados, asegurando que la información crítica llegue a quien la necesita sin demoras.

<p align="center">
  <img src="350_central_alarmas_osorno.jpg" alt="Central de Alarmas Osorno" width="500px">
</p>

### Gestión de Recursos en Terreno
La valentía y la preparación salvan vidas. La aplicación equipa a los bomberos y personal de emergencia con herramientas para visualizar la ubicación de los recursos, actualizar el estado de los incidentes y recibir instrucciones claras, optimizando cada segundo de la operación.

<p align="center">
  <img src="bomberos_en_accion.jpg" alt="Bomberos en acción" width="500px">
</p>

## Tecnologías Utilizadas
* **React**
* **Vite**
* **Node.js**
* **TypeScript(TSX)**
* **CSS3**
* **SASS**


<br>

<p align="center">
  <img src="SafeRescueLogo.png" alt="Safe Rescue Logo" width="400px">
</p>
>>>>>>> master
