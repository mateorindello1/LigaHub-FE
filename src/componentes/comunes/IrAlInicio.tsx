import { Navigate } from 'react-router';

/**
 * Lleva a la página principal. Se usa ante una dirección que no existe, un id inválido o un
 * recurso que la API no encuentra: la aplicación no confirma qué existe y qué no, así que no
 * sirve para adivinar ids probando direcciones. replace: "atrás" no vuelve a la dirección inválida.
 * Equivale a NavigationManager.NavigateTo("/", replace: true) en Blazor.
 */
export function IrAlInicio() {
  return <Navigate to="/" replace />;
}
