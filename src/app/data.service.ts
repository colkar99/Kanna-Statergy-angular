import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  pertTradeCost: number = 0;
  lotsize: number = 0;
  totalTrades: number = 0;
  selectedData: EventEmitter<any> = new EventEmitter<any>();
  resultEachDay: EventEmitter<any> = new EventEmitter<[]>();

  setData(value: any) {
    this.selectedData.next(value);
  }
  resetSetData() {
    this.selectedData.next({});
  }

  setResultEachDay(data: any) {
    this.resultEachDay.next(data);
  }

  getDataFromFile() {
    // return this.https.get('/assets/json/nifty.json');
    return this.https.get('/assets/json/bankNifty.json');
  }

  constructor(public https: HttpClient) {}
}
