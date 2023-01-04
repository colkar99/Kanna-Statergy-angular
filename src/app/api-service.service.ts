import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders,} from '@angular/common/http';
import {environment} from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  hostUrl: string = environment.url;
  uri: string = '/getCandles';
  constructor(public httpClient: HttpClient,) { }

  getEvery5MinsData(date: string,token: string){
    return this.httpClient.post(`${this.hostUrl}${this.uri}`,{date,token})
  }
}
