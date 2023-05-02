import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ReduceCountService {
  pertTradeCost: number = 0;
  lotsize: number = 0;
  totalTrades: number = 0;
  selectedData2: EventEmitter<any> = new EventEmitter<any>();
  resultEachDay2: EventEmitter<any> = new EventEmitter<[]>();

  setData2(value: any) {
    this.selectedData2.next(value);
  }
  resetSetData() {
    this.selectedData2.next({});
  }

  setResultEachDay2(data: any) {
    this.resultEachDay2.next(data);
  }

  getDataFromFile() {
    // return this.https.get('/assets/json/nifty.json');
    return this.https.get('/assets/json/bankNifty.json');
  }

  constructor(public https: HttpClient) {}
}
