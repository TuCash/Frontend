// ============================================
// Date Utilities
// Funciones para formatear fechas según formato del backend
// ============================================

/**
 * Formatea una fecha al formato esperado por el backend: yyyy-MM-dd
 * @param date Fecha a formatear
 * @returns String en formato yyyy-MM-dd
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convierte un string de fecha del backend a objeto Date
 * @param dateString String en formato yyyy-MM-dd
 * @returns Objeto Date
 */
export function parseAPIDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Obtiene la fecha actual en formato yyyy-MM-dd
 * @returns String con la fecha actual
 */
export function getTodayFormatted(): string {
  return formatDateForAPI(new Date());
}

/**
 * Obtiene el primer día del mes actual en formato yyyy-MM-dd
 * @returns String con el primer día del mes
 */
export function getFirstDayOfMonth(): string {
  const date = new Date();
  date.setDate(1);
  return formatDateForAPI(date);
}

/**
 * Obtiene el último día del mes actual en formato yyyy-MM-dd
 * @returns String con el último día del mes
 */
export function getLastDayOfMonth(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return formatDateForAPI(date);
}

/**
 * Obtiene una fecha relativa (días desde hoy) en formato yyyy-MM-dd
 * @param days Número de días (positivo = futuro, negativo = pasado)
 * @returns String con la fecha calculada
 */
export function getRelativeDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateForAPI(date);
}

/**
 * Obtiene el primer día de hace N meses en formato yyyy-MM-dd
 * @param monthsAgo Número de meses atrás
 * @returns String con la fecha
 */
export function getFirstDayOfMonthsAgo(monthsAgo: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(1);
  return formatDateForAPI(date);
}

/**
 * Formatea una fecha para mostrar al usuario (formato local)
 * @param dateString String en formato yyyy-MM-dd
 * @param locale Locale para formato (default: 'es-PE')
 * @returns String formateado para visualización
 */
export function formatDateForDisplay(dateString: string, locale: string = 'es-PE'): string {
  const date = parseAPIDate(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha para mostrar al usuario (formato corto)
 * @param dateString String en formato yyyy-MM-dd
 * @param locale Locale para formato (default: 'es-PE')
 * @returns String formateado corto
 */
export function formatDateShort(dateString: string, locale: string = 'es-PE'): string {
  const date = parseAPIDate(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
