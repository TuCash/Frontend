// ============================================
// Dashboard Service
// Servicio para analíticas y reportes del dashboard
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DashboardPulse, TrendSeries, CategoryLeaks } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Obtiene el pulso financiero del período
   * @param fromDate Fecha desde (opcional, default: inicio del mes)
   * @param toDate Fecha hasta (opcional, default: hoy)
   */
  getPulse(fromDate?: string, toDate?: string): Observable<DashboardPulse> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<DashboardPulse>(
      `${this.baseUrl}${environment.endpoints.dashboard.pulse}`,
      { params }
    );
  }

  /**
   * Obtiene tendencias mensuales de ingresos y gastos
   * @param months Número de meses hacia atrás (default: 6)
   */
  getTrends(months: number = 6): Observable<TrendSeries> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<TrendSeries>(
      `${this.baseUrl}${environment.endpoints.dashboard.trends}`,
      { params }
    );
  }

  /**
   * Obtiene las categorías con mayor gasto (gastos hormiga)
   * @param fromDate Fecha desde (opcional, default: inicio del mes)
   * @param toDate Fecha hasta (opcional, default: hoy)
   * @param top Número de categorías top (default: 5)
   */
  getLeaks(fromDate?: string, toDate?: string, top: number = 5): Observable<CategoryLeaks> {
    let params = new HttpParams().set('top', top.toString());
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<CategoryLeaks>(
      `${this.baseUrl}${environment.endpoints.dashboard.leaks}`,
      { params }
    );
  }
}
