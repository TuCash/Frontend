// ============================================
// Error Handler Utilities
// Manejo centralizado de errores de API
// ============================================

import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api.types';

/**
 * Maneja errores de la API y retorna un mensaje amigable
 * @param error Error de HTTP
 * @returns Mensaje de error formateado
 */
export function handleAPIError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    // Error de respuesta del servidor
    const status = (error as HttpErrorResponse).status;
    const message = (error as HttpErrorResponse).error?.message;

    switch (status) {
      case 400:
        return message || 'Datos inválidos. Por favor verifica la información enviada.';
      case 401:
        return 'No autenticado. Por favor inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return message || 'Recurso no encontrado.';
      case 409:
        return message || 'Ya existe un recurso con esos datos.';
      case 422:
        return message || 'Los datos proporcionados no son válidos.';
      case 500:
        return 'Error interno del servidor. Por favor intenta más tarde.';
      case 503:
        return 'El servicio no está disponible. Por favor intenta más tarde.';
      case 0:
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      default:
        return message || `Error del servidor (${status})`;
    }
  }

  // Error desconocido
  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
}

/**
 * Extrae el objeto ApiError de una respuesta HTTP de error
 * @param error Error de HTTP
 * @returns Objeto ApiError o undefined
 */
export function extractApiError(error: unknown): ApiError | undefined {
  if (error instanceof HttpErrorResponse) {
    const httpError = error as HttpErrorResponse;
    if (httpError.error) {
      return {
        status: httpError.status,
        message: httpError.error.message || httpError.message,
        timestamp: httpError.error.timestamp,
        path: httpError.error.path,
      };
    }
  }
  return undefined;
}

/**
 * Verifica si un error es de autenticación (401)
 * @param error Error de HTTP
 * @returns true si es error 401
 */
export function isAuthenticationError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error as HttpErrorResponse).status === 401;
}

/**
 * Verifica si un error es de validación (400, 422)
 * @param error Error de HTTP
 * @returns true si es error de validación
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) {
    const status = (error as HttpErrorResponse).status;
    return status === 400 || status === 422;
  }
  return false;
}

/**
 * Verifica si un error es de conexión (0, timeout)
 * @param error Error de HTTP
 * @returns true si es error de conexión
 */
export function isConnectionError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error as HttpErrorResponse).status === 0;
}
