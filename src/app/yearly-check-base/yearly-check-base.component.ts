import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ApiServiceService } from '../api-service.service';
import { YearlyCheckService } from './yearly-check.service';
import { cloneDeep } from 'lodash';


@Component({
  selector: 'app-yearly-check-base',
  templateUrl: './yearly-check-base.component.html',
  styleUrls: ['./yearly-check-base.component.css']
})
export class YearlyCheckBaseComponent implements OnInit {
  buySellDiff: number = 1;

  // perTradeCost: number = 120;
  // size: number = 50;
  monthData: any[] = [
    { f: '2022-01-01', t: '2022-02-28' },
    { f: '2022-03-01', t: '2022-04-30' },
    { f: '2022-05-01', t: '2022-06-30' },
    { f: '2022-07-01', t: '2022-08-31' },
    { f: '2022-09-01', t: '2022-10-31' },
    { f: '2022-11-01', t: '2022-12-31' },

  ]
  results: any[] = []

  myForm: FormGroup;
  currentPage: number = 0;

  structureData: { [key: string]: any[] } = {};
  resultData: { date: Date, ProfitAndLoss: number, noOfTrades: number, tradeCost: number, realizedProfits: number, demo: number }[] = [];
  totalPoints: number = 0;
  totalTradeCost: number = 0;
  realizedProfit: number = 0

  // resetData(){
  //   this.structureData = {}
  //   this.resultData = []
  //   this.totalPoints = 0
  //   this.totalTradeCost = 0
  //   this.realizedProfit = 0
  // }
  constructor(public datas: YearlyCheckService, public fb: FormBuilder, public apiService: ApiServiceService) {
    this.myForm = this.fb.group({
      instrumentId: [null, Validators.required],
      lotSize: [null, Validators.required],
      buySellDiff: [null, Validators.required]
    })
    this.datas.resetSetData()
    this.datas.totalTrades = 0;


    this.datas.resultEachDay2.subscribe((data) => {
      this.totalPoints += data.ProfitAndLoss;

      data.tradeCost = data.noOfTrades * this.datas.pertTradeCost;
      this.totalTradeCost += data.tradeCost;
      data.realizedProfits = this.customParseFloat((data.ProfitAndLoss * this.myForm.value.lotSize) - data.tradeCost);
      this.realizedProfit += data.realizedProfits
      data.demo = this.realizedProfit;
      // data.demo += data.realizedProfits
      this.resultData.push(data)
    })
  }
  ngOnInit(): void {

    // this.setDatas()
  }

  setDatas() {
    debugger
    this.structureData = {}
    this.results.forEach((data) => {
      let date = new Date(data[0]).toLocaleDateString()
      if (!this.structureData[date]) {
        this.structureData[date] = []
      }
      this.structureData[date].push(data)
    })
    for (let stru in this.structureData) {
      this.datas.setData2({ datas: this.structureData[stru], diff: this.myForm.value.buySellDiff });
      // return
    }
    console.log(this.structureData)

  }



  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }


  submit() {
    if (!this.myForm.value.instrumentId || !this.myForm.value.buySellDiff || !this.myForm.value.lotSize) {
      alert('Instrument ID, Lot and BUYSELL Diff should not empty')
      return
    }
    let token = localStorage.getItem('token');

    let calls: any = []
    this.monthData.forEach((data, i) => {
      let d = { token: token, fromDate: data.f, toDate: data.t, instrumentId: this.myForm.value.instrumentId }
      calls.push(this.apiService.getEvery5MinsDataByInstrument(d).pipe(map((da: any) => da.data.candles)))

    })


    forkJoin([...calls]).subscribe((val: any[]) => {
      let data: any = []
      val.map((value) => {
        data = [...data, ...value]
      })
      this.results = data;
      this.setDatas();
    })


  }

}
