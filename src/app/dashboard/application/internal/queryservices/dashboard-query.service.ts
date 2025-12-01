/**
 * Dashboard Bounded Context - Application Layer
 * Dashboard Query Service
 * Maneja operaciones de lectura (get pulse, trends, leaks)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetPulseQuery } from '../../../domain/model/queries/get-pulse.query';
import { GetTrendsQuery } from '../../../domain/model/queries/get-trends.query';
import { GetLeaksQuery } from '../../../domain/model/queries/get-leaks.query';
import {
  DashboardPulseResource,
  TrendSeriesResource,
  CategoryLeaksResource,
} from '../../../presentation/resources/dashboard.resource';

@Injectable({ providedIn: 'root' })
export class DashboardQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleGetPulse(query: GetPulseQuery): Observable<DashboardPulseResource> {
    let params = new HttpParams();
    if (query.fromDate) params = params.set('fromDate', query.fromDate);
    if (query.toDate) params = params.set('toDate', query.toDate);

    return this.http.get<DashboardPulseResource>(
      `${this.baseUrl}${environment.endpoints.dashboard.pulse}`,
      { params }
    );
  }

  handleGetTrends(query: GetTrendsQuery): Observable<TrendSeriesResource> {
    const params = new HttpParams().set('months', query.months.toString());

    return this.http.get<TrendSeriesResource>(
      `${this.baseUrl}${environment.endpoints.dashboard.trends}`,
      { params }
    );
  }

  handleGetLeaks(query: GetLeaksQuery): Observable<CategoryLeaksResource> {
    let params = new HttpParams().set('top', query.top.toString());
    if (query.fromDate) params = params.set('fromDate', query.fromDate);
    if (query.toDate) params = params.set('toDate', query.toDate);

    return this.http.get<CategoryLeaksResource>(
      `${this.baseUrl}${environment.endpoints.dashboard.leaks}`,
      { params }
    );
  }
}
