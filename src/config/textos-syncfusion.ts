import { L10n, loadCldr } from '@syncfusion/ej2-base';
// Datos de la cultura española del proyecto Unicode CLDR: nombres de meses y días, formatos de
// fecha y de números. Vite empaqueta solo estos archivos, no los paquetes completos.
import numberingSystems from 'cldr-core/supplemental/numberingSystems.json';
import weekData from 'cldr-core/supplemental/weekData.json';
import gregoriano from 'cldr-dates-full/main/es/ca-gregorian.json';
import zonasHorarias from 'cldr-dates-full/main/es/timeZoneNames.json';
import numeros from 'cldr-numbers-full/main/es/numbers.json';

/**
 * Idioma de los componentes de Syncfusion. Cada componente lo recibe con locale="es".
 *
 * Se cargan dos cosas:
 * - La cultura (loadCldr): meses, días y formatos de fecha en español, para el calendario y el
 *   selector de fecha y hora. Es el CultureInfo("es") de .NET.
 * - Los textos de los componentes (L10n.load), que vienen en inglés: paginador, grilla vacía,
 *   listas, diálogo y calendario.
 */
export const IDIOMA = 'es';

loadCldr(numberingSystems, weekData, gregoriano, zonasHorarias, numeros);

L10n.load({
  [IDIOMA]: {
    grid: {
      EmptyRecord: 'No hay registros para mostrar.',
    },
    pager: {
      currentPageInfo: 'Página {0} de {1}',
      totalItemsInfo: '({0} registros)',
      totalItemInfo: '({0} registro)',
      firstPageTooltip: 'Primera página',
      lastPageTooltip: 'Última página',
      nextPageTooltip: 'Página siguiente',
      previousPageTooltip: 'Página anterior',
      nextPagerTooltip: 'Páginas siguientes',
      previousPagerTooltip: 'Páginas anteriores',
      pagerDropDown: 'Registros por página',
      pagerAllDropDown: 'Registros',
      All: 'Todos',
    },
    'drop-down-list': {
      noRecordsTemplate: 'No hay opciones para elegir.',
      actionFailureTemplate: 'No se pudieron cargar las opciones.',
    },
    calendar: {
      today: 'Hoy',
    },
    datetimepicker: {
      today: 'Hoy',
    },
    dialog: {
      close: 'Cerrar',
    },
  },
});
