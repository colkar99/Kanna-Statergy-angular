import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-multi-day',
  templateUrl: './multi-day.component.html',
  styleUrls: ['./multi-day.component.css'],
})
export class MultiDayComponent implements OnInit {
  // perTradeCost: number = 120;
  // size: number = 50;
  //Bank nifty difference
  //buySellDiff: number = 45;

  //Nifty diff
  buySellDiff: number = 5;

  currentPage: number = 0;

  structureData: { [key: string]: any[] } = {};
  resultData: {
    date: Date;
    ProfitAndLoss: number;
    noOfTrades: number;
    tradeCost: number;
    realizedProfits: number;
    demo: number;
    trades: [];
  }[] = [];
  totalPoints: number = 0;
  totalTradeCost: number = 0;
  realizedProfit: number = 0;
  calculateProfitAndLossDays: {
    profits: number;
    losses: number;
    noTrade: number;
  } = { profits: 0, losses: 0, noTrade: 0 };

  // resetData(){
  //   this.structureData = {}
  //   this.resultData = []
  //   this.totalPoints = 0
  //   this.totalTradeCost = 0
  //   this.realizedProfit = 0
  // }
  constructor(public datas: DataService) {
    this.datas.resetSetData();
    this.datas.totalTrades = 0;

    this.datas.resultEachDay.subscribe((data) => {
      //////For one heavy loss condition///Remove if dont need
      if (
        data.trades.length >= 2 &&
        data.trades[0].orderType == 'Normal' &&
        data.trades[1].orderType == 'Normal'
      ) {
        console.log(data);
        let prof = 0;
        if (data.trades[0].side == 'SELL') {
          prof = data.trades[0].exec - data.trades[1].exec;
        } else {
          prof = data.trades[1].exec - data.trades[0].exec;
        }
        data.ProfitAndLoss = prof;
        data.noOfTrades = 2;
      }
      //////For one heavy loss condition///Remove if dont need

      this.totalPoints += data.ProfitAndLoss;
      data.tradeCost = data.noOfTrades * this.datas.pertTradeCost;
      this.totalTradeCost += data.tradeCost;
      data.realizedProfits = this.customParseFloat(
        data.ProfitAndLoss * this.datas.lotsize - data.tradeCost
      );
      this.realizedProfit += data.realizedProfits;
      data.demo = this.realizedProfit;
      // data.demo += data.realizedProfits
      this.resultData.push(data);
      // console.log(this.resultData)

      console.log(data);
      if (data.realizedProfits > 0) this.calculateProfitAndLossDays.profits++;
      else if (data.realizedProfits < 0)
        this.calculateProfitAndLossDays.losses++;
      else if (data.realizedProfits == 0)
        this.calculateProfitAndLossDays.noTrade++;
    });
  }
  ngOnInit(): void {
    this.datas.getDataFromFile().subscribe((data: any) => {
      this.buySellDiff = data.diff;
      this.datas.lotsize = data.qty;
      this.setDatas(data);
    });
  }

  setDatas(fullData: any) {
    this.structureData = {};
    fullData.data.candles.forEach((data: any) => {
      let date = new Date(data[0]).toLocaleDateString();
      if (!this.structureData[date]) {
        this.structureData[date] = [];
      }
      this.structureData[date].push(data);
    });
    for (let stru in this.structureData) {
      this.datas.setData({
        datas: this.structureData[stru],
        diff: this.buySellDiff,
      });
      // return
    }
    // console.log(this.structureData)
  }

  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2));
  }
}
