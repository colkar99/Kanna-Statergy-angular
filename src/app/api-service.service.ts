import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiServiceService {

  constructor(public httpClient: HttpClient) { }

  getEvery5MinsData(){
    let token =  `enctoken AuwR56C+jkH/ITAvcKd4VUs14WMsuaDckjpJGM5jcz4L+VXRmCMzuwW4mGSEANEpMMx06/418qMjVMYZ9En8q3FxZlNSoqjSf1iOrqqVr4/MU39yM42w8g==`;

    return this.httpClient.get('https://kite.zerodha.com/oms/instruments/historical/8972290/5minute?user_id=WB5864&oi=1&from=2022-12-01&to=2023-01-02',{
      headers: new HttpHeaders().set('authorization', token)
    })
  }
}
