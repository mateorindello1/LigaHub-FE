import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerLicense } from '@syncfusion/ej2-base';
// Tema Material 3 de Syncfusion: solo los estilos de los componentes que se usan.
import './estilos/syncfusion.css';
import './index.css';
// Textos de Syncfusion en español (grilla, paginador, listas, diálogo).
import './config/textos-syncfusion';
import App from './App.tsx';

// La licencia de Syncfusion se registra antes de dibujar cualquier componente.
// Sin clave, los componentes funcionan pero muestran un aviso de licencia.
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE ?? '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
