import { L10n } from '@syncfusion/ej2-base';

/**
 * Textos de los componentes de Syncfusion en español. Vienen en inglés y se traducen cargando
 * un diccionario con L10n.load; cada componente los usa cuando recibe locale="es".
 *
 * Solo se cargan textos, no el formato de números y fechas de la cultura (eso requiere los
 * datos CLDR y no hace falta todavía). Por eso no se llama a setCulture('es') para toda la app.
 */
export const IDIOMA = 'es';

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
    dialog: {
      close: 'Cerrar',
    },
  },
});
