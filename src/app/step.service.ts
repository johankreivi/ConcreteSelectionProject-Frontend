import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StepService {
  private apiUrl = 'https://localhost:7230/api/ConcreteQualitySelection/completeTree/Konstruktionstyp1'; // URL to your API

  constructor(private http: HttpClient) { }

  getSteps(): Observable<any> {
    const result:any = this.http.get<any>(this.apiUrl);
    //console.log(result);
    return result;
  }
}
