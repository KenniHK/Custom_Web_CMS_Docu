import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  baseUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  getProjects() {
    return this.http.get(`${this.baseUrl}/projects`);
  }

  getDocs(path: string) {
    return this.http.get(`${this.baseUrl}/docs?path=${encodeURIComponent(path)}`);
  }

  getDoc(filePath: string) {
    return this.http.get(`${this.baseUrl}/doc?path=${encodeURIComponent(filePath)}`, { responseType: 'text' });
  }

  saveDoc(filePath: string, content: string) {
    return this.http.post(`${this.baseUrl}/doc`, { path: filePath, content});
  }
}
