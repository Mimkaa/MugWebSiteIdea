import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define the PageComponent interface matching your backend model.
export interface PageComponent {
  width: number;
  height: number;
  posX: number;
  posY: number;
  pagePath: string;
  componentType: string;
  uuid: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageComponentService {
  // Base URL for your API; adjust if necessary.
  private readonly apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Method to create a new page component by sending a POST request.
  createPageComponent(pageComponent: PageComponent): Observable<PageComponent> {
    return this.http.post<PageComponent>(
      `${this.apiUrl}/create-page-component`,
      pageComponent
    );
  }

  // Method to update a page component by its UUID.
  updatePageComponentByUuid(pageComponent: PageComponent): Observable<PageComponent> {
    return this.http.put<PageComponent>(
      `${this.apiUrl}/update-page-component-by-uuid`,
      pageComponent
    );
  }

  // New method to retrieve page components by URL (pagePath).
  getPageComponentsByUrl(pagePath: string): Observable<PageComponent[]> {
    return this.http.get<PageComponent[]>(
      `${this.apiUrl}/page-components/by-url?pagePath=${encodeURIComponent(pagePath)}`
    );
  }
  
  // New method to delete a page component by its UUID.
  deletePageComponentByUuid(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/page-component/by-uuid/${uuid}`);
  }
}
