import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  ApiObject,
  CreateApiObject,
  DeleteApiObjectResponse,
} from '../models/api-object';

@Injectable({
  providedIn: 'root',
})
export class ObjectsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.restful-api.dev/objects';

  getItems(): Observable<ApiObject[]> {
    return this.http.get<ApiObject[]>(this.apiUrl);
  }

  addItem(item: CreateApiObject): Observable<ApiObject> {
    return this.http.post<ApiObject>(this.apiUrl, item);
  }

  deleteItem(id: string): Observable<DeleteApiObjectResponse> {
    return this.http.delete<DeleteApiObjectResponse>(`${this.apiUrl}/${id}`);
  }
}
