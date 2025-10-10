import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Profile {
  id: number;
  userId: number;
  avatar: string;
  currency: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly endpoints = environment.endpoints;

  getProfile(userId: number): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseUrl}${this.endpoints.profile}?userId=${userId}`);
  }
}
