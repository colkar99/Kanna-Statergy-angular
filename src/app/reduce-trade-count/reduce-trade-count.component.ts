import { Component, OnInit } from '@angular/core';
import { ReduceCountService } from './reduce.service';




@Component({
  selector: 'app-reduce-trade-count',
  templateUrl: './reduce-trade-count.component.html',
  styleUrls: ['./reduce-trade-count.component.css']
})
export class ReduceTradeCountComponent implements OnInit {
  // perTradeCost: number = 120;
  // size: number = 50;
  //Bank nifty
  buySellDiff: number = 5;

  // buySellDiff: number = 5;

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
  constructor(public datas: ReduceCountService) {
    this.datas.resetSetData()
    this.datas.totalTrades = 0;


    this.datas.resultEachDay2.subscribe((data) => {
      this.totalPoints += data.ProfitAndLoss;

      data.tradeCost = data.noOfTrades * this.datas.pertTradeCost;
      this.totalTradeCost += data.tradeCost;
      data.realizedProfits = this.customParseFloat((data.ProfitAndLoss * this.datas.lotsize) - data.tradeCost);
      this.realizedProfit += data.realizedProfits
      data.demo = this.realizedProfit;
      // data.demo += data.realizedProfits
      this.resultData.push(data)
    })
  }
  ngOnInit(): void {
    this.datas.getDataFromFile().subscribe((data: any) => {
      this.buySellDiff = data.diff;
      this.datas.lotsize = data.qty;
      this.setDatas(data)
    })


  }

  setDatas(fullData: any) {
    this.structureData = {}
    fullData.data.candles.forEach((data: any) => {
      let date = new Date(data[0]).toLocaleDateString()
      if (!this.structureData[date]) {
        this.structureData[date] = []
      }
      this.structureData[date].push(data)
    })
    for (let stru in this.structureData) {
      this.datas.setData2({ datas: this.structureData[stru], diff: this.buySellDiff });
      // return
    }
    console.log(this.structureData)

  }



  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }


}
