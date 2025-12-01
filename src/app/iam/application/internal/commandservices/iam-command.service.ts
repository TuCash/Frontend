/**
 * IAM Bounded Context - Application Layer
 * IAM Command Service
 * Maneja operaciones de escritura (login, register, update)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SignInCommand } from '../../../domain/model/commands/sign-in.command';
import { SignUpCommand } from '../../../domain/model/commands/sign-up.command';
import { UpdateUserCommand } from '../../../domain/model/commands/update-user.command';
import { UpdatePreferencesCommand } from '../../../domain/model/commands/update-preferences.command';
import { SignInResponse } from '../../../presentation/resources/sign-in.resource';
import { SignUpResponse } from '../../../presentation/resources/sign-up.resource';
import { UserResource } from '../../../presentation/resources/user.resource';

@Injectable({ providedIn: 'root' })
export class IamCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Ejecuta el comando de SignIn (login)
   */
  handle(command: SignInCommand): Observable<SignInResponse> {
    return this.http
      .post<SignInResponse>(`${this.baseUrl}${environment.auth.login}`, {
        email: command.email,
        password: command.password,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('auth_user', JSON.stringify(response));
        })
      );
  }

  /**
   * Ejecuta el comando de SignUp (registro)
   */
  handleSignUp(command: SignUpCommand): Observable<SignUpResponse> {
    return this.http.post<SignUpResponse>(`${this.baseUrl}${environment.auth.register}`, {
      email: command.email,
      password: command.password,
      displayName: command.displayName,
    });
  }

  /**
   * Ejecuta el comando de UpdateUser
   */
  handleUpdateUser(command: UpdateUserCommand): Observable<UserResource> {
    const payload: any = {};
    if (command.displayName) payload.displayName = command.displayName;
    if (command.photoUrl) payload.photoUrl = command.photoUrl;
    if (command.currency) payload.currency = command.currency;
    if (command.theme) payload.theme = command.theme;
    if (command.locale) payload.locale = command.locale;

    return this.http.patch<UserResource>(
      `${this.baseUrl}${environment.endpoints.users}/${command.userId}`,
      payload
    );
  }

  /**
   * Ejecuta el comando de UpdatePreferences
   */
  handleUpdatePreferences(command: UpdatePreferencesCommand): Observable<UserResource> {
    const payload: any = {};
    if (command.currency !== undefined) payload.currency = command.currency;
    if (command.theme !== undefined) payload.theme = command.theme;
    if (command.locale !== undefined) payload.locale = command.locale;
    if (command.notificationsEnabled !== undefined)
      payload.notificationsEnabled = command.notificationsEnabled;
    if (command.emailNotifications !== undefined)
      payload.emailNotifications = command.emailNotifications;
    if (command.pushNotifications !== undefined)
      payload.pushNotifications = command.pushNotifications;

    return this.http.patch<UserResource>(
      `${this.baseUrl}${environment.endpoints.users}/${command.userId}/preferences`,
      payload
    );
  }

  /**
   * Limpia la sesión (logout)
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
