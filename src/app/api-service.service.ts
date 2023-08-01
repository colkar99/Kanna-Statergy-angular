import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { environment } from '../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {
  hostUrl: string = environment.url;
  uri: string = 'test/getCandles';
  uri2: string = 'test/instrument/id';
  kite_request_token: string = 'kite/set_token';


  constructor(public httpClient: HttpClient,) { }

  getEvery5MinsData(date: string, token: string,isOwnData: boolean) {
    return this.httpClient.post(`${this.hostUrl}${this.uri}`, { date, token,isOwnData })
  }

  getEvery5MinsDataByInstrument(data: any) {
    debugger

    return this.httpClient.post(`${this.hostUrl}${this.uri2}`, { data })
  }

  setRequestToken(data: any){
    return this.httpClient.post(`${this.hostUrl}${this.kite_request_token}`, { data });
  }
}
