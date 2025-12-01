// ============================================
// Auth Interceptor
// Intercepta todas las peticiones HTTP y agrega el token JWT
// ============================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isAuthenticationError } from '../../utils/error.handler';

/**
 * Interceptor funcional para agregar el token JWT a las peticiones HTTP
 * y manejar errores de autenticación automáticamente
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Obtener el token del localStorage
  const token = localStorage.getItem('auth_token');

  // Clonar la petición y agregar el header de autorización si existe token
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  // Enviar la petición y manejar errores de autenticación
  return next(authReq).pipe(
    catchError((error) => {
      // Si es error 401, limpiar sesión y redirigir a login
      if (isAuthenticationError(error)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
