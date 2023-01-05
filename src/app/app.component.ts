import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  perTradeCost: number = 70;

  buySellDiff: number = 5;
  size: number = 250;
  currentPage: number = 0;

  structureData: { [key: string]: any[] } = {};
  resultData: { date: Date, ProfitAndLoss: number, noOfTrades: number, tradeCost: number, realizedProfits: number, demo: number }[] = [];
  totalPoints: number = 0;
  totalTradeCost: number = 0;
  realizedProfit: number = 0

  constructor(public datas: DataService) {
    this.datas.resultEachDay.subscribe((data) => {
      console.log(data)
      this.totalPoints += data.ProfitAndLoss;

      data.tradeCost = data.noOfTrades * this.perTradeCost;
      this.totalTradeCost += data.tradeCost;
      data.realizedProfits = this.customParseFloat((data.ProfitAndLoss * this.size) - data.tradeCost);
      this.realizedProfit += data.realizedProfits
      data.demo = this.realizedProfit;
      // data.demo += data.realizedProfits
      this.resultData.push(data)
    })
  }
  ngOnInit(): void {
    this.setDatas()
  }

  setDatas() {
    this.datas.datas2.data.candles.forEach((data) => {
      let date = new Date(data[0]).toLocaleDateString()
      if (!this.structureData[date]) {
        this.structureData[date] = []
      }
      this.structureData[date].push(data)
    })

    for (let stru in this.structureData) {
      this.datas.setData({ datas: this.structureData[stru], diff: this.buySellDiff });
      // return
    }
    console.log(this.structureData)

  }

  goTo(num: number) {
    this.currentPage = num;
  }

  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
}
