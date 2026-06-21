import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { ErrorResponse } from '../../shared/models/api-response.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const body = err.error as ErrorResponse | undefined;
      let message = 'Error en la petición';

      if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join(', ')
          : String(body.message);
      } else if (err.status === 0) {
        message = 'No se pudo conectar con el servidor';
      }

      notifications.error(message);
      return throwError(() => err);
    }),
  );
};
