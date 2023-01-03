import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders,} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(public httpClient: HttpClient,) { }

  getEvery5MinsData(date: string,token: string){
    return this.httpClient.get(`http://localhost:3000?date=${date}&token=${token}`)
  }
}
