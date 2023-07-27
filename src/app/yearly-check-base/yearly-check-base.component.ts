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
    { f: '2022-03-01', t: '2022-04-30' }, // 89
    { f: '2022-05-01', t: '2022-06-30' }, //38
    { f: '2022-07-01', t: '2022-08-31' }, //6
    { f: '2022-09-01', t: '2022-10-31' }, //37
    { f: '2022-11-01', t: '2022-12-31' }, //68
    { f: '2023-01-01', t: '2023-03-31' }, //15
    { f: '2023-04-01', t: '2023-05-30' }, //15
    { f: '2023-06-01', t: '2023-07-26' }, //15



  ]
  results: any[] = []

  myForm: FormGroup;
  currentPage: number = 0;

  structureData: { [key: string]: any[] } = {};
  resultData: { date: Date, ProfitAndLoss: number, noOfTrades: number, tradeCost: number, realizedProfits: number, demo: number }[] = [];
  totalPoints: number = 0;
  totalTradeCost: number = 0;
  realizedProfit: number = 0
  maxDrawDown: number = 0;

  continousdrawDown: number = 0
  continousdrawDownTotal: number = 0


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
      if(data.demo < this.maxDrawDown) this.maxDrawDown = data.demo;
      if(data.realizedProfits < 0 ) this.continousdrawDown += data.realizedProfits;
      else {
        if(this.continousdrawDown < this.continousdrawDownTotal) this.continousdrawDownTotal = this.continousdrawDown
        this.continousdrawDown = 0;
      }
      // data.demo += data.realizedProfits
      this.resultData.push(data)
    })
  }
  ngOnInit(): void {

    // this.setDatas()
  }

  setDatas() {
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
    debugger
    if (!this.myForm.value.instrumentId || !this.myForm.value.buySellDiff) {
      alert('Instrument ID, Lot and BUYSELL Diff should not empty')
      return
    }
    if(this.datas.instrumentId == this.myForm.value.instrumentId){
      // this.datas.resetSetData()
      this.datas.totalTrades = 0;
      this.resultData = [];
      this.totalPoints = 0
      this.totalTradeCost = 0;
      this.realizedProfit= 0;
      this.maxDrawDown=0;
      this.continousdrawDown = 0
      this.continousdrawDownTotal = 0
      this.setDatas();

    }else{
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

        // this.datas.lotsize = Math.round((this.datas.investedAmount / data[0][1]) * 3.5);
        // this.myForm.get('lotSize')?.patchValue(this.datas.lotsize);

        this.results = data;
        this.datas.instrumentId = this.myForm.value.instrumentId;
        this.setDatas();
      })
  
    }

    

  }
  calculateDrawdown(num: number){
    console.log('hi')
    if(num < this.maxDrawDown) this.maxDrawDown = num
    return num
  }

}
