import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

interface MartketData {
  date?: Date,
  allHigh: number,
  allLow: number,
  high: number,
  low: number,
  open: number,
  UB: number,
  LB: number,
  target: number,
  stopLoss: number,
  priceToTrade: number,
  trades: [],
  status: number,
  isFirstTrade: boolean,
  comments: string[],
  previuosOrder?: MartketData,
  slOrderPlaced: boolean,
  slOrderStatus: number,
  slPriceToTrade: number

}
enum Val {
  date = 0,
  open = 1,
  high = 2,
  low = 3,
}
//Buy [6,7,10,11,12,13]
//Sell [8,9,14,15,16,17]
enum Order {
  nill = 1,
  pendingBUYNomal = 2, //initial trade
  pendingBUYTarget = 3, //initial trade

  pendingSellNormal = 4, //initial trade
  pendingSellTarget = 5, //initial trade

  liveBuyNormal = 6, //initial trade with no SL trade
  liveBuyTarget = 7, //initial trade with no SL trade

  liveSellNormal = 8, //initial trade with no SL trade
  liveSellTarget = 9, //initial trade with no SL trade

  liveBuyNormalSlSellNormal = 10,   // buy N = S N,BUY T = S N,B N = S T, B T = S T 
  liveBuyTargetSlSellNormal = 11,
  liveBuyNormalSlSellTarget = 12,
  liveBuyTargetSlSellTarget = 13,

  liveSellNormalSlBuyNormal = 14,   // S N = B N,S T = B N,S N = B T, S T = B T 
  liveSellTargetSlBuyNormal = 15,
  liveSellNormalSlBuyTarget = 16,
  liveSellTargetSlBuyTarget = 17,
  completed = 12,
}
@Component({
  selector: 'app-testing-per-day',
  templateUrl: './testing-per-day.component.html',
  styleUrls: ['./testing-per-day.component.css']
})
export class TestingPerDayComponent implements OnInit {

  buySellDiff: number = 5;
  buySide: number[] = [6, 7, 10, 11, 12, 13]
  sellSide: number[] = [8, 9, 14, 15, 16, 17]
  endTime: string = '15:15:00+0530';
  startTime: string = '09:15:00+0530';

  MB: MartketData = {
    allHigh: 0, allLow: 0, high: 0, low: 0, open: 0, UB: 0, LB: 0, target: 0, stopLoss: 0, priceToTrade: 0, trades: [], status: Order.nill, isFirstTrade: true, comments: [], slOrderStatus: 1, slOrderPlaced: false, slPriceToTrade: 0
  };
  trades: { side: string, exec: number, isLast?: boolean }[] = [];
  totalPointsEarned: number = 0
  constructor(private datas: DataService) {

    // this.datas.selectedData.subscribe(({datas,diff}) => {
    //   debugger
    //   if (datas.length) {
    //     this.buySellDiff = diff;
    //     this.mainFunction(datas)
    //   }
    // })
  }
  ngOnInit(): void {
    this.mainFunction(this.dayData)

    // this.datas.selectedData.subscribe((datas: []) => {
    //   if (datas.length) {
    //   }
    // })
  }



  // resetData() {
  //   this.MB = {
  //     allHigh: 0, allLow: 0, high: 0, low: 0, open: 0, UB: 0, LB: 0, target: 0, stopLoss: 0, priceToTrade: 0, trades: [], status: Order.nill, isFirstTrade: true, comments: [], slOrderStatus: 1, slOrderPlaced: false, slPriceToTrade: 0
  //   };
  //   this.totalPointsEarned = 0
  //   this.trades = [];
  // }
  mainFunction(datas: any[]) {
    // this.resetData();
    let start = datas[0][0].split('T');
    start[1] = this.startTime
    let end = datas[0][0].split('T');
    end[1] = this.endTime

    start = new Date(start.join('T'))
    end = new Date(end.join('T'))

    datas.forEach((data, index) => {

      // let currentTime = `${new Date(data[0]).getHours()}${new Date(data[0]).getMinutes()}`;

      if (new Date(data[0]).getTime() < start.getTime()) return;
      if (new Date(data[0]).getTime() == start.getTime()) {
        this.MB.date = data[0]
        this.MB.open = data[Val.open];
        this.MB.high = data[Val.high];
        this.MB.allHigh = data[Val.high];
        this.MB.low = data[Val.low];
        this.MB.allLow = data[Val.low];
        this.setUpperBandAndLowerBand(data)
        return;
      }

      if (new Date(data[0]).getTime() == end.getTime()) {
        let closePrice = data[Val.open];
        if (this.buySide.includes(this.MB.status)) { // buy side open
          this.MB.comments.push(`TimeEnd Sell EXEC at open price ${closePrice}`);
          this.trades.push({ side: 'SELL', exec: closePrice, isLast: true })
        } else if (this.sellSide.includes(this.MB.status)) { // Sell Side Open
          this.MB.comments.push(`TimeEnd Buy EXEC at open price ${closePrice}`)
          this.trades.push({ side: 'BUY', exec: closePrice, isLast: true })
        } else {
          this.MB.comments.push(`Cancell all the pending orders and close the trade`)
        }
        this.MB.status = Order.completed;
        this.MB.target = 0;
        this.MB.stopLoss = 0;
        this.MB.priceToTrade = 0;
        this.MB.slOrderPlaced = false;
        this.MB.slPriceToTrade = 0;
        this.MB.slOrderStatus = Order.nill
        this.MB.status = Order.nill
        this.calculatePoints()
        return
      }

      if (new Date(data[0]).getTime() > end.getTime()) {
        // this.resetData();
        return
      }

      switch (this.MB.status) {
        case 1: {
          //No Trade
          this.checkToPlaceOrder(data);
          break;
        }
        case 2: {
          //Normal Buy placed
          //check  high crossed trade price
          if (data[Val.high] >= this.MB.priceToTrade) {
            //exec Order
            this.MB.isFirstTrade = false;
            this.MB.status = Order.liveBuyNormal;
            this.MB.comments.push(`Normal Buy Order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            //new High
            if (data[Val.high] > this.MB.high) {
              this.MB.comments.push(`New High(${data[Val.high]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }

          if (data[Val.low] <= this.MB.LB) {
            //cancel Buy Order cnage status to 1
            this.MB.status = Order.nill
            this.MB.comments.push(`LB Normal Buy Cancelled at  ${this.getTimeForComment(data)}`)

            //Place normal Buy/ Tgt buy order
            if (data[Val.low] <= this.MB.low) {
              this.MB.status = Order.pendingSellNormal;
              this.MB.priceToTrade = data[Val.low] - this.buySellDiff;
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push(`LB Normal Sell Order Placed at${data[Val.low] - this.buySellDiff} ${this.getTimeForComment(data)}`)
            } else {
              this.MB.status = Order.pendingSellTarget;
              this.MB.priceToTrade = data[Val.low] - this.buySellDiff;
              this.setTargetFunction('BUY')
              this.MB.comments.push(`LB TGT SELL Order Placed at${data[Val.low] - this.buySellDiff} TGT:${this.MB.target} , SL:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            if (data[Val.low] <= this.MB.low) {
              this.MB.comments.push(`New Low(${data[Val.low]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }

          if (data[Val.low] <= this.MB.low) {
            //Cancel normal buy order
            this.MB.status = Order.nill;
            this.MB.comments.push(`New Low(${data[Val.low]}) Cancel Normal buy order Band Revise at ${this.getTimeForComment(data)}`)
            this.MB.low = data[Val.low];
            this.MB.allLow = data[Val.low];
            this.setUpperBandAndLowerBand(data);
            //set new low
            //set upper and lower band
          }
          //check  Low less than LB
          //cancel Buy Order
          //check new low
          break;
        }
        case 3: {
          // Target Buy Order placed
          //High >= priceTo Trade 
          if (data[Val.high] >= this.MB.priceToTrade) {
            this.MB.isFirstTrade = false;
            this.MB.status = Order.liveBuyTarget;
            this.MB.comments.push(`TGT Buy Order EXEC ${this.MB.priceToTrade} TGT:${this.MB.target} SL:${this.MB.stopLoss}  at ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            return
            //update bands and convert to normal order
            //new high >  old high
          }
          // low <= stoploss
          if (data[Val.low] <= this.MB.stopLoss) {
            //place SL Sell Order
            this.MB.isFirstTrade = false
            this.MB.priceToTrade = data[Val.low] - this.buySellDiff;
            this.MB.comments.push(`SL Reached cancel TGT Buy Order ${this.getTimeForComment(data)}`)
            if (data[Val.low] <= this.MB.low) {
              //Normal Order
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push(`New Low(${data[Val.low]}) at ${this.getTimeForComment(data)}`)
              this.setUpperBandAndLowerBand(data);
              this.MB.status = Order.pendingSellNormal
              this.MB.comments.push(`SL Reached Normall sell order Placed at ${this.MB.priceToTrade} at ${this.getTimeForComment(data)}`)
            } else {
              this.MB.status = Order.pendingSellTarget
              this.setTargetFunction('SELL')
              this.MB.comments.push(`SL Reached TGT sell order Placed at ${this.MB.priceToTrade} TGT${this.MB.target} sl:${this.MB.stopLoss} at ${this.getTimeForComment(data)}`)

              //Target Order

            }
            //check new Low   

          }

          break;
        }
        case 4: {
          //Normal sell placed
          //check  low crossed trade price
          if (data[Val.low] <= this.MB.priceToTrade) {
            //exec Order
            this.MB.isFirstTrade = false;
            this.MB.status = Order.liveSellNormal;
            this.MB.comments.push(`Normal sell Order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })

            //new low
            if (data[Val.low] < this.MB.low) {
              this.MB.comments.push(`New Low(${data[Val.low]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }
          //check  High greater than UB 
          if (data[Val.high] >= this.MB.UB) {
            //cancel Buy Order cnage status to 1
            this.MB.isFirstTrade = false
            this.MB.status = Order.nill
            this.MB.comments.push(`UB Normal Sell Cancelled at  ${this.getTimeForComment(data)}`)

            //Place normal Buy/ Tgt buy order
            if (data[Val.high] >= this.MB.high) {
              this.MB.status = Order.pendingBUYNomal;
              this.MB.priceToTrade = data[Val.high] + this.buySellDiff;
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push(`UB Normal Buy Order Placed at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            } else {
              // console.log("TGT Buy order", data)
              this.MB.status = Order.pendingBUYTarget;
              this.MB.priceToTrade = data[Val.high] + this.buySellDiff;
              this.setTargetFunction('BUY')
              this.MB.comments.push(`UB TGT Buy Order Placed at ${this.MB.priceToTrade} TGT:${this.MB.target} , SL:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            if (data[Val.high] >= this.MB.high) {
              this.MB.comments.push(`New High(${data[Val.high]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }

          if (data[Val.high] >= this.MB.high) {
            this.MB.comments.push(`New High(${data[Val.high]}) Normal Sell Cancelled Band Revise at ${this.getTimeForComment(data)}`);
            this.MB.status = Order.nill
            this.MB.high = data[Val.high];
            this.MB.allHigh = data[Val.high];
            this.setUpperBandAndLowerBand(data);
          }
          //cancel Buy Order
          //check new low
          break
        }
        case 5: {
          //TGT Sell Placed
          //low <= priceTo Trade 
          if (data[Val.low] <= this.MB.priceToTrade) {
            this.MB.isFirstTrade = false;
            this.MB.status = Order.liveSellTarget;
            this.MB.comments.push(`TGT Sell Order EXEC ${this.MB.priceToTrade} TGT:${this.MB.target} SL:${this.MB.stopLoss}  at ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })

            return
            //update bands and convert to normal order
            //new high >  old high
          }
          // low <= stoploss
          if (data[Val.high] >= this.MB.stopLoss) {
            //place BUY Sell Order
            this.MB.isFirstTrade = false
            this.MB.priceToTrade = data[Val.high] + this.buySellDiff;
            this.MB.comments.push(`SL Reached cancel TGT Sell Order ${this.getTimeForComment(data)}`)

            if (data[Val.high] >= this.MB.high) {
              //Normal Order
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push(`New High(${data[Val.high]}) at ${this.getTimeForComment(data)}`)
              this.setUpperBandAndLowerBand(data);
              this.MB.status = Order.pendingBUYNomal
              this.MB.comments.push(`SL Reached Normall Buy order Placed at ${this.MB.priceToTrade} at ${this.getTimeForComment(data)}`)
            } else {
              this.MB.status = Order.pendingBUYTarget
              this.setTargetFunction('BUY')
              this.MB.comments.push(`SL Reached TGT BUY order Placed at ${this.MB.priceToTrade} TGT${this.MB.target} sl:${this.MB.stopLoss} at ${this.getTimeForComment(data)}`)
              //Target Order
            }
            //check new Low   

          }
          break
        }
        case 6: {
          // live Buy Normal
          // low <= LB
          if (data[Val.low] <= this.MB.LB) {
            //Time to placed SL Order
            if (data[Val.low] <= this.MB.low) {
              //SL Sell Normal order
              this.MB.status = Order.liveBuyNormalSlSellNormal;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingSellNormal;
              this.MB.slPriceToTrade = data[Val.low] - this.buySellDiff;
              this.MB.comments.push(`LB reached SL SELL Normal Order placed at ${this.MB.slPriceToTrade} ${this.getTimeForComment(data)}`)
            } else {
              //SL Sell Target Order
              this.MB.status = Order.liveBuyNormalSlSellTarget;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingSellTarget;
              this.MB.slPriceToTrade = data[Val.low] - this.buySellDiff;
              this.setTargetFunction('SELL');
              this.MB.comments.push(`LB reached SL SELL TGT Order placed at ${this.MB.slPriceToTrade} Target:${this.MB.target} stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            //Low <= new Low
            if (data[Val.low] < this.MB.low) {
              //set NEW low and reverse UB LB  
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]
              this.setUpperBandAndLowerBand(data)
            }

          }


          //High > New High
          if (data[Val.high] > this.MB.high) {
            this.MB.allHigh = data[Val.high];
            this.MB.high = data[Val.high];
            //reverse UB LB

            this.setUpperBandAndLowerBand(data);

          }

          break
        }
        case 7: {// live Buy target

          // low <= stoploss
          if (data[Val.low] <= this.MB.stopLoss) {
            //Place sell order same logic from live buy normal
            //Time to placed SL Order
            if (data[Val.low] <= this.MB.low) {
              //SL Sell Normal order
              this.MB.status = Order.liveBuyTargetSlSellNormal;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingSellNormal;
              this.MB.slPriceToTrade = data[Val.low] - this.buySellDiff;
              this.MB.comments.push(`Stoploss reached SL SELL Normal Order placed at ${this.MB.slPriceToTrade} ${this.getTimeForComment(data)}`)
            } else {
              //SL Sell Target Order
              this.MB.status = Order.liveBuyTargetSlSellTarget;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingSellTarget;
              this.MB.slPriceToTrade = data[Val.low] - this.buySellDiff;
              this.setTargetFunction('SELL');
              this.MB.comments.push(`Stoploss reached SL SELL TGT Order placed at ${this.MB.slPriceToTrade} Target:${this.MB.target} stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            //Low <= new Low
            if (data[Val.low] < this.MB.low) {
              //set NEW low and reverse UB LB  
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]
              this.setUpperBandAndLowerBand(data)
            }
          }

          //high >= target
          if (data[Val.high] >= this.MB.target) {
            //high > new high
            if (data[Val.high] >= this.MB.high) {
              //set new high
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high];
            }
            //set UB and LB  
            this.setUpperBandAndLowerBand(data);

            //convert to normal Buy order  
            this.MB.target = 0;
            this.MB.stopLoss = 0;
            this.MB.status = Order.liveBuyNormal;
            this.MB.comments.push(`Target Reached Convert TGT BUY to Normal BUY at: ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`);

          }


          break
        }
        case 8: {
          // live Sell Normal
          // High >= UB
          if (data[Val.high] >= this.MB.UB) {
            //Time to placed SL Order
            if (data[Val.high] >= this.MB.high) {
              //SL Buy Normal order
              this.MB.status = Order.liveSellNormalSlBuyNormal;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingBUYNomal;
              this.MB.slPriceToTrade = data[Val.high] + this.buySellDiff;
              this.MB.comments.push(`UB reached SL Buy Normal Order placed at ${this.MB.slPriceToTrade} ${this.getTimeForComment(data)}`)
            } else {
              //SL BUY Target Order
              this.MB.status = Order.liveSellNormalSlBuyTarget;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingBUYTarget;
              this.MB.slPriceToTrade = data[Val.high] + this.buySellDiff;
              this.setTargetFunction('BUY');
              this.MB.comments.push(`UB reached SL BUY TGT Order placed at ${this.MB.slPriceToTrade} Target:${this.MB.target} stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            //High >= new High
            if (data[Val.low] < this.MB.low) {
              //set NEW High and reverse UB LB  
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]
              this.setUpperBandAndLowerBand(data)
            }

          }


          //low < new low
          if (data[Val.low] < this.MB.low) {
            this.MB.low = data[Val.low];
            this.MB.allLow = data[Val.low];
            //reverse UB LB

            this.setUpperBandAndLowerBand(data);

          }

          break
        }
        case 9: { //live sell target order
          // high >= stoploss
          if (data[Val.high] >= this.MB.stopLoss) {
            //Place buy order same logic from live sell normal
            //Time to placed SL Order
            if (data[Val.high] >= this.MB.high) {
              //SL Buy Normal order
              this.MB.status = Order.liveSellTargetSlBuyNormal;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingBUYNomal;
              this.MB.slPriceToTrade = data[Val.high] + this.buySellDiff;
              this.MB.comments.push(`StopLoss reached SL Buy Normal Order placed at ${this.MB.slPriceToTrade} ${this.getTimeForComment(data)}`)
            } else {
              //SL BUY Target Order
              this.MB.status = Order.liveSellTargetSlBuyTarget;
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingBUYTarget;
              this.MB.slPriceToTrade = data[Val.high] + this.buySellDiff;
              this.setTargetFunction('BUY');
              this.MB.comments.push(`StopLoss reached SL BUY TGT Order placed at ${this.MB.slPriceToTrade} Target:${this.MB.target} stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            //High >= new High
            if (data[Val.low] < this.MB.low) {
              //set NEW High and reverse UB LB  
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]
              this.setUpperBandAndLowerBand(data)
            }
          }

          //Low <= target
          if (data[Val.low] <= this.MB.target) {
            //Low < new Low
            if (data[Val.low] < this.MB.low) {
              //set new low
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
            }
            //set UB and LB  
            this.setUpperBandAndLowerBand(data);

            //convert to normal sell order  
            this.MB.target = 0;
            this.MB.stopLoss = 0;
            this.MB.status = Order.liveSellNormal;
            this.MB.comments.push(`Target Reached Convert TGT Sell to Normal Sell at: ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`);

          }

          break
        }
        case 10: { //Live Buy Normal Sl Sell Normal ///liveBuyNormalSlSellNormal
          //high > Old High
          if (data[Val.high] > this.MB.high) {
            //Cancel Stop Loss Sell Order
            this.MB.status = Order.liveBuyNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            this.MB.comments.push(`New High cancel SL Normal Sell order at ${this.getTimeForComment(data)}`)
            //set New High
            this.MB.high = data[Val.high];
            this.MB.allHigh = data[Val.high];
            //set UB LB
            this.setUpperBandAndLowerBand(data);
            return
          }

          //low < SL Trade Price
          if (data[Val.low] <= this.MB.slPriceToTrade) {
            // Stop Normal Buy order
            //Switf sl normal sell to main order
            this.MB.status = Order.liveSellNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Normal Sell order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })
            // low < old low
            if (data[Val.low] < this.MB.low) {
              //set new Low 
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]

            }
            // Update UB LB   (Uniq)
            this.setUpperBandAndLowerBand(data)
          }


          break
        }
        case 11: { //Live Buy Target Sl Sell Normal //liveBuyTargetSlSellNormal
          //High > target //Positive 
          if (data[Val.high] >= this.MB.target) {
            //Cancel Sl Normal order
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            //Change TGT buy to Normal Buy
            this.MB.status = Order.liveBuyNormal;
            this.MB.comments.push(`Target Reached Cancel Normal Sell order and revise to Normal Buy Order at ${this.getTimeForComment(data)}`)
            //Set target to new High
            this.MB.high = this.MB.target;
            this.setUpperBandAndLowerBand(data)
            //Update UB LB
            return
          }

          // low <= slTradePrice //Negative
          if (data[Val.low] <= this.MB.slPriceToTrade) {
            //Change Normal sell to Main Sell Order
            this.MB.status = Order.liveSellNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Normal Sell order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })

            // low < old low
            if (data[Val.low] < this.MB.low) {
              //set new Low 
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]

            }
            // Update UB LB   (Uniq)
            this.setUpperBandAndLowerBand(data)
          }

          break
        }
        case 12: { //Live Buy Normal Sl Sell Target  // liveBuyNormalSlSellTarget
          //high > Old High
          if (data[Val.high] > this.MB.high) {
            //Cancel Stop Loss Sell Order
            this.MB.status = Order.liveBuyNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            this.MB.comments.push(`New High cancel SL Target Sell order at ${this.getTimeForComment(data)}`)
            //set New High
            this.MB.high = data[Val.high];
            this.MB.allHigh = data[Val.high];
            //set UB LB
            this.setUpperBandAndLowerBand(data);
            return
          }


          //low < SL Trade Price  
          if (data[Val.low] <= this.MB.slPriceToTrade) {
            // Stop Normal Buy order
            this.MB.status = Order.liveSellTarget;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            //Switf sl Target sell to main order
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Target Sell order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })

            // low < old low
            if (data[Val.low] < this.MB.low) {
              //set new Low 
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]

            }
          }
          break
        }
        case 13: { //Live Buy Target Sl Sell Target //liveBuyTargetSlSellTarget
          //High > target //Positive 
          if (data[Val.high] >= this.MB.target) {
            //Cancel Sl Normal order
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            //Change TGT buy to Normal Buy
            this.MB.status = Order.liveBuyNormal;
            this.MB.comments.push(`Target Reached Cancel TGT Sell order and revise to Normal Buy Order at ${this.getTimeForComment(data)}`)
            //Set target to new High
            this.MB.high = this.MB.target;
            this.setUpperBandAndLowerBand(data)
            //Update UB LB
            return
          }

          if (data[Val.low] <= this.MB.slPriceToTrade) {
            // Stop Normal Buy order
            this.MB.status = Order.liveSellTarget;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            //Switf sl Target sell to main order
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Target Sell order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'SELL', exec: this.MB.priceToTrade, isLast: false })

            // low < old low
            if (data[Val.low] < this.MB.low) {
              //set new Low 
              this.MB.low = data[Val.low]
              this.MB.allLow = data[Val.low]

            }
          }
          break
        }
        case 14: {//Live Normal Sell Sl Normal buy// liveSellNormalSlBuyNormal

          //Low < Old Low //positive
          if (data[Val.low] < this.MB.low) {
            //Cancel Stop Loss normal buy Order
            this.MB.status = Order.liveSellNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            this.MB.comments.push(`New Low cancel SL Normal Buy order at ${this.getTimeForComment(data)}`)
            //set New Low
            this.MB.low = data[Val.low];
            this.MB.allLow = data[Val.low];
            //set UB LB
            this.setUpperBandAndLowerBand(data);
            return
          }

          //high >= SL Trade Price // negative
          if (data[Val.high] >= this.MB.slPriceToTrade) {
            // Stop Normal Sell order
            //Switf sl normal sell to main order
            this.MB.status = Order.liveBuyNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Normal Buy order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            // high > old high
            if (data[Val.high] > this.MB.high) {
              //set new high
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]

            }
            // Update UB LB   (Uniq)
            this.setUpperBandAndLowerBand(data)
          }

          break
        }
        case 15: {// Live Target Sell SL Normal Buy liveSellTargetSlBuyNormal
          //low < target //Positive 
          if (data[Val.low] <= this.MB.target) {
            //Cancel Normal buy
            //Change TGT SEll to normal Sell
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            //Change TGT buy to Normal Buy
            this.MB.status = Order.liveSellNormal;
            this.MB.comments.push(`Target Reached Cancel Normal Buy order and revise to Normal Sell Order at ${this.getTimeForComment(data)}`)
            //Set target to new High
            this.MB.low = this.MB.target;
            this.setUpperBandAndLowerBand(data)
            //Update UB LB
            return
          }

          // high >= slTradePrice //Negative
          if (data[Val.high] >= this.MB.slPriceToTrade) {
            //Change Normal buy to Main buy Order
            this.MB.status = Order.liveBuyNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Normal Buy order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            // high > old high
            if (data[Val.high] > this.MB.high) {
              //set new high
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]

            }
            // Update UB LB   (Uniq)
            this.setUpperBandAndLowerBand(data)
          }
          break
        }
        case 16: {//Live normal sell SL TGT BUY //liveSellNormalSlBuyTarget
          //Low < Old Low
          if (data[Val.low] < this.MB.low) {
            //Cancel Stop Loss TGT Buy Order
            this.MB.status = Order.liveSellNormal;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            this.MB.comments.push(`New Low cancel SL Target Buy order at ${this.getTimeForComment(data)}`)
            //set New Low
            this.MB.low = data[Val.low];
            this.MB.allLow = data[Val.low];
            //set UB LB
            this.setUpperBandAndLowerBand(data);
            return
          }


          //high >= SL Trade Price  
          if (data[Val.high] >= this.MB.slPriceToTrade) {
            // Stop Normal sell order
            this.MB.status = Order.liveBuyTarget;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            //Switf sl Target sell to main order
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Target Buy order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            // high > old high
            if (data[Val.high] > this.MB.high) {
              //set new high
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]

            }
          }
          break
        }
        case 17: {//LiVe TGT Sell order SL tgt Buy//liveSellTargetSlBuyTarget
          //low <= target //Positive 
          if (data[Val.low] <= this.MB.target) {
            //Cancel tgt buy
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            this.MB.slPriceToTrade = 0;
            this.MB.stopLoss = 0;
            //Change TGT Sell to Normal Sell
            this.MB.status = Order.liveSellNormal;
            this.MB.comments.push(`Target Reached Cancel TGT buy order and revise to Normal sell Order at ${this.getTimeForComment(data)}`)
            //Set target to new low
            this.MB.low = this.MB.target;
            this.setUpperBandAndLowerBand(data)
            //Update UB LB
            return
          }

          if (data[Val.high] >= this.MB.slPriceToTrade) {
            // Stop TGT sell  order
            this.MB.status = Order.liveBuyTarget;
            this.MB.slOrderPlaced = false;
            this.MB.slOrderStatus = Order.nill;
            //Switf sl Target buy to main order
            this.MB.priceToTrade = this.MB.slPriceToTrade;
            this.MB.slPriceToTrade = 0;
            this.MB.comments.push(`Stoploss Target buy order EXEC at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            this.trades.push({ side: 'BUY', exec: this.MB.priceToTrade, isLast: false })

            // high > old high
            if (data[Val.high] > this.MB.high) {
              //set new High 
              this.MB.high = data[Val.high]
              this.MB.allHigh = data[Val.high]

            }
          }
          break

        }

      }

      // if(data[Val.high] >= )
      // console.log(index);
    })
    // console.log(this.MB)
  }


  // liveSellNormalSlBuyNormal = 14,   // S N = B N,S T = B N,S N = B T, S T = B T 
  // liveSellTargetSlBuyNormal = 15,
  // liveSellNormalSlBuyTarget = 16,
  // liveSellTargetSlBuyTarget = 17,

  //Check to place Order
  checkToPlaceOrder(data: any, slOrder?: boolean) {
    //Initial order excution
    if (data[Val.high] >= this.MB.high) {
      this.MB.high = data[Val.high];
      this.MB.allHigh = data[Val.high];
      this.setUpperBandAndLowerBand(data)
    }
    if (data[Val.high] >= this.MB.UB) {
      if (data[Val.high] < this.MB.high) {
        this.setTargetFunction('BUY')
        this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + this.buySellDiff} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
        this.MB.status = Order.pendingBUYTarget;
      } else {
        this.MB.status = Order.pendingBUYNomal;
        this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + this.buySellDiff}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
      }
      this.MB.priceToTrade = this.customParseFloat(data[Val.high] + this.buySellDiff);
      return
    }
    if (data[Val.low] <= this.MB.low) {
      this.MB.low = data[Val.low];
      this.MB.allLow = data[Val.low];
      this.setUpperBandAndLowerBand(data)
    }
    if (data[Val.low] <= this.MB.LB) {
      if (data[Val.low] > this.MB.low) {
        this.setTargetFunction('SELL');
        this.MB.status = Order.pendingSellTarget
        this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - this.buySellDiff} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`);
      }
      else {
        this.MB.status = Order.pendingSellNormal
        this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - this.buySellDiff}, ${this.getTimeForComment(data)}`)
      }
      this.MB.priceToTrade = this.customParseFloat(data[Val.low] - this.buySellDiff);
      // console.log(`Crossed LB SELL Order placed at ${data[Val.low] - this.buySellDiff}`);
      return
    }
  }

  //reset Stoploss order
  resetStopLossOrder() {
    this.MB.slOrderPlaced = false;
    this.MB.slPriceToTrade = 0;
    this.MB.slOrderStatus = Order.nill;

  }
  //Set PreviousOrder Status
  setPreviousOrder() {
    this.MB.previuosOrder = { ...this.MB };
  }
  //set Target function
  setTargetFunction(type: string) {
    if (type == "BUY") {
      let dif: number = this.MB.open - this.MB.allLow;
      this.MB.target = this.MB.open + dif;
      this.MB.stopLoss = this.MB.allLow;
    } else if (type == "SELL") {
      let dif: number = this.MB.allHigh - this.MB.open;
      this.MB.target = this.MB.open - dif;
      this.MB.stopLoss = this.MB.allHigh;
    }

  }

  //Find upper and Lower Band
  setUpperBandAndLowerBand(data: any) {
    let diff = data[Val.high] - data[Val.low];
    let UB = this.customParseFloat(data[Val.high] + diff);
    let LB = this.customParseFloat(data[Val.low] - diff);
    if (this.MB.isFirstTrade) {
      if (!this.MB.UB || this.MB.UB >= UB) this.MB.UB = UB;
      //18264 < 18275
      if (!this.MB.LB || LB >= this.MB.LB) this.MB.LB = LB;
    } else {
      this.MB.UB = UB;
      this.MB.LB = LB;
    }

  }
  //Helper functions//////////////
  //Get status
  getStatus(num: number) {
    // nill = 1,
    // pendingBUYNomal = 2, //initial trade
    // pendingBUYTarget = 3, //initial trade

    // pendingSellNormal = 4, //initial trade
    // pendingSellTarget = 5, //initial trade

    // liveBuyNormal = 6, //initial trade with no SL trade
    // liveBuyTarget = 7, //initial trade with no SL trade

    // liveSellNormal = 8, //initial trade with no SL trade
    // liveSellTarget = 9, //initial trade with no SL trade

    // liveBuyNormalSlSellNormal = 10,   // buy N = S N,BUY T = S N,B N = S T, B T = S T 
    // liveBuyTargetSlSellNormal = 11,
    // liveBuyNormalSlSellTarget = 12,
    // liveBuyTargetSlSellTarget = 13,

    // liveSellNormalSlBuyNormal = 14,   // S N = B N,S T = B N,S N = B T, S T = B T 
    // liveSellTargetSlBuyNormal = 15,
    // liveSellNormalSlBuyTarget = 16,
    // liveSellTargetSlBuyTarget = 17,
    // completed = 12,
    switch (num) {
      case 1:
        return 'Not Started';
      case 2:
        return "Normal Buy order placed";
      case 3:
        return "Target buy order placed";
      case 4:
        return "Normal Sell order placed"
      case 5:
        return "Target Sell order placed"
      case 6:
        return "Live Buy Normal"
      case 7:
        return "Live Buy Target"
      case 8:
        return "Live Sell Normal"
      case 9:
        return "Live Sell Target"
      case 10:
        return "live Buy Normal Sl Sell Normal placed"
      case 11:
        return "live Buy Target Sl Sell Normal placed"
      case 12:
        return "live Buy Normal Sl Sell Target placed"
      case 13:
        return "live Buy Target Sl Sell Target Placed"
      case 14:
        return "live Sell Normal Sl Buy Normal placed"
      case 15:
        return "live Sell Target Sl Buy Normal placed"
      case 16:
        return "live Sell Normal Sl Buy Target placed"
      case 17:
        return "live Sell Target Sl Buy Target Placed"
      case 18:
        return "completed"
      default: return 'Null'
    }

  }
  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
  //get time for comment method
  getTimeForComment(data: any) {
    return `Time: ${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`
  }

  //Calculate Points 
  calculatePoints() {
    let points = { side: '', tradePrice: 0, pointsEarned: 0, isFirst: true }
    this.datas.totalTrades += this.trades.length;
    this.trades.forEach((trade) => {
      if (trade.side == "BUY") {
        if (points.isFirst) {
          points.side = "BUY";
          points.tradePrice = trade.exec
          points.isFirst = false
        } else {
          let p = points.tradePrice - trade.exec;
          points.pointsEarned += p;
          //Check is last trade
          if (trade.isLast) {
            return
          } else {
            points.side = "SELL";
            points.tradePrice = trade.exec
          }
        }

      } else if (trade.side == "SELL") {
        if (points.isFirst) {
          points.side = "SELL";
          points.tradePrice = trade.exec
          points.isFirst = false
        } else {
          //buy               //Sell        
          let p = trade.exec - points.tradePrice;
          points.pointsEarned += p;
          //Check is last trade
          if (trade.isLast) {
            return
          } else {
            points.side = "BUY";
            points.tradePrice = trade.exec
          }
        }
      }
    })
    this.totalPointsEarned = points.pointsEarned
    this.datas.setResultEachDay({ date: this.MB.date, ProfitAndLoss: this.customParseFloat(this.totalPointsEarned), noOfTrades: this.trades.length })
    // alert(this.totalPointsEarned)
  }

  getExecPresent(comment: string) {
    return comment.split(' ').includes('EXEC')

  }

  dayData: any[] = [
    [
      "2023-01-02T09:15:00+0530",
      18209,
      18224.85,
      18187.05,
      18194.6,
      289150,
      10677800
    ],
    [
      "2023-01-02T09:20:00+0530",
      18193.8,
      18214.8,
      18177.8,
      18206.95,
      194500,
      10736800
    ],
    [
      "2023-01-02T09:25:00+0530",
      18205.8,
      18210,
      18168,
      18177.55,
      150550,
      10745850
    ],
    [
      "2023-01-02T09:30:00+0530",
      18176.6,
      18205,
      18164.7,
      18193.85,
      174700,
      10769850
    ],
    [
      "2023-01-02T09:35:00+0530",
      18194.95,
      18221,
      18186.65,
      18221,
      145800,
      10804400
    ],
    [
      "2023-01-02T09:40:00+0530",
      18221,
      18230,
      18212,
      18230,
      85350,
      10812400
    ],
    [
      "2023-01-02T09:45:00+0530",
      18230,
      18243.65,
      18215.6,
      18237,
      140750,
      10814400
    ],
    [
      "2023-01-02T09:50:00+0530",
      18237,
      18240,
      18227.25,
      18239.65,
      119400,
      10820250
    ],
    [
      "2023-01-02T09:55:00+0530",
      18236.95,
      18248,
      18230.65,
      18235,
      70750,
      10846950
    ],
    [
      "2023-01-02T10:00:00+0530",
      18232.75,
      18240,
      18225,
      18237.7,
      50300,
      10854350
    ],
    [
      "2023-01-02T10:05:00+0530",
      18237.5,
      18249.85,
      18230,
      18237.05,
      89250,
      10866500
    ],
    [
      "2023-01-02T10:10:00+0530",
      18237.05,
      18240,
      18227.75,
      18232.4,
      58250,
      10888500
    ],
    [
      "2023-01-02T10:15:00+0530",
      18228.2,
      18239.95,
      18225,
      18237,
      33900,
      10895400
    ],
    [
      "2023-01-02T10:20:00+0530",
      18238,
      18245,
      18235.35,
      18236.45,
      32400,
      10907050
    ],
    [
      "2023-01-02T10:25:00+0530",
      18236.45,
      18240.35,
      18229,
      18230.35,
      36800,
      10908350
    ],
    [
      "2023-01-02T10:30:00+0530",
      18230,
      18245,
      18229,
      18239.5,
      33900,
      10915400
    ],
    [
      "2023-01-02T10:35:00+0530",
      18237,
      18265,
      18233.15,
      18262.65,
      132550,
      10914450
    ],
    [
      "2023-01-02T10:40:00+0530",
      18262.7,
      18265,
      18256.8,
      18261.3,
      66650,
      10895500
    ],
    [
      "2023-01-02T10:45:00+0530",
      18261.35,
      18263.5,
      18251.1,
      18255,
      67900,
      10904250
    ],
    [
      "2023-01-02T10:50:00+0530",
      18255,
      18259.75,
      18251.55,
      18257,
      38750,
      10895700
    ],
    [
      "2023-01-02T10:55:00+0530",
      18257,
      18259.95,
      18252,
      18258.65,
      46450,
      10904300
    ],
    [
      "2023-01-02T11:00:00+0530",
      18258.65,
      18272.55,
      18255.25,
      18267.4,
      92800,
      10901500
    ],
    [
      "2023-01-02T11:05:00+0530",
      18267.4,
      18275,
      18265.75,
      18271.8,
      109350,
      10915250
    ],
    [
      "2023-01-02T11:10:00+0530",
      18271.8,
      18275.45,
      18261.5,
      18264,
      48350,
      10927450
    ],
    [
      "2023-01-02T11:15:00+0530",
      18264,
      18267,
      18259.5,
      18266.35,
      26850,
      10930400
    ],
    [
      "2023-01-02T11:20:00+0530",
      18267,
      18269,
      18255.8,
      18256.25,
      40050,
      10923650
    ],
    [
      "2023-01-02T11:25:00+0530",
      18256,
      18264.75,
      18249.1,
      18257.6,
      37350,
      10926100
    ],
    [
      "2023-01-02T11:30:00+0530",
      18257.6,
      18261.8,
      18251,
      18254.2,
      25550,
      10923450
    ],
    [
      "2023-01-02T11:35:00+0530",
      18254.2,
      18263.8,
      18252.2,
      18261.85,
      23050,
      10929450
    ],
    [
      "2023-01-02T11:40:00+0530",
      18261.85,
      18269.85,
      18260.9,
      18267.5,
      24100,
      10935800
    ],
    [
      "2023-01-02T11:45:00+0530",
      18267.5,
      18269,
      18260.05,
      18260.55,
      21000,
      10939550
    ],
    [
      "2023-01-02T11:50:00+0530",
      18260.55,
      18263.5,
      18247.95,
      18252.3,
      43850,
      10927800
    ],
    [
      "2023-01-02T11:55:00+0530",
      18252.3,
      18257,
      18245.6,
      18251.3,
      21900,
      10925400
    ],
    [
      "2023-01-02T12:00:00+0530",
      18251.3,
      18260,
      18247.95,
      18255.05,
      13650,
      10928550
    ],
    [
      "2023-01-02T12:05:00+0530",
      18256.9,
      18264,
      18255,
      18258.5,
      17200,
      10928900
    ],
    [
      "2023-01-02T12:10:00+0530",
      18259.75,
      18269.95,
      18257.35,
      18269.9,
      19700,
      10931850
    ],
    [
      "2023-01-02T12:15:00+0530",
      18267,
      18270,
      18264.4,
      18264.4,
      21500,
      10930650
    ],
    [
      "2023-01-02T12:20:00+0530",
      18266.85,
      18269.45,
      18255,
      18255.75,
      20600,
      10931350
    ],
    [
      "2023-01-02T12:25:00+0530",
      18257,
      18257,
      18234.65,
      18243,
      75650,
      10921150
    ],
    [
      "2023-01-02T12:30:00+0530",
      18241.55,
      18259,
      18237.15,
      18252.8,
      34350,
      10925750
    ],
    [
      "2023-01-02T12:35:00+0530",
      18252.8,
      18258.8,
      18241.05,
      18244.95,
      23300,
      10931400
    ],
    [
      "2023-01-02T12:40:00+0530",
      18243.35,
      18251.8,
      18240.75,
      18248.3,
      30600,
      10936850
    ],
    [
      "2023-01-02T12:45:00+0530",
      18246.05,
      18252,
      18239.7,
      18251.8,
      35350,
      10942900
    ],
    [
      "2023-01-02T12:50:00+0530",
      18252,
      18254.95,
      18237.5,
      18240.1,
      33600,
      10946750
    ],
    [
      "2023-01-02T12:55:00+0530",
      18240.1,
      18241.8,
      18230.6,
      18236.25,
      51700,
      10946900
    ],
    [
      "2023-01-02T13:00:00+0530",
      18236.25,
      18255,
      18236.25,
      18249.2,
      29550,
      10951200
    ],
    [
      "2023-01-02T13:05:00+0530",
      18249.2,
      18259.95,
      18249,
      18258.45,
      22250,
      10951050
    ],
    [
      "2023-01-02T13:10:00+0530",
      18259,
      18267.25,
      18254.15,
      18266.5,
      51750,
      10953450
    ],
    [
      "2023-01-02T13:15:00+0530",
      18265.2,
      18267.25,
      18260.25,
      18264,
      28900,
      10962550
    ],
    [
      "2023-01-02T13:20:00+0530",
      18264,
      18266,
      18255.5,
      18260.2,
      39100,
      10973850
    ],
    [
      "2023-01-02T13:25:00+0530",
      18260.2,
      18264,
      18254,
      18255.95,
      17900,
      10977300
    ],
    [
      "2023-01-02T13:30:00+0530",
      18255.95,
      18260,
      18246.05,
      18254.3,
      28650,
      10977350
    ],
    [
      "2023-01-02T13:35:00+0530",
      18254.3,
      18263,
      18250,
      18261.4,
      28650,
      10980350
    ],
    [
      "2023-01-02T13:40:00+0530",
      18261.4,
      18262,
      18248.9,
      18251.95,
      15950,
      10981850
    ],
    [
      "2023-01-02T13:45:00+0530",
      18250,
      18258,
      18249.85,
      18250.2,
      18800,
      10980550
    ],
    [
      "2023-01-02T13:50:00+0530",
      18250.2,
      18251,
      18240.55,
      18246,
      42450,
      10964000
    ],
    [
      "2023-01-02T13:55:00+0530",
      18246,
      18253.45,
      18241.4,
      18244.3,
      24750,
      10961500
    ],
    [
      "2023-01-02T14:00:00+0530",
      18244.3,
      18250.65,
      18235.25,
      18240,
      76100,
      10965200
    ],
    [
      "2023-01-02T14:05:00+0530",
      18240.65,
      18251.35,
      18236.1,
      18247.45,
      68250,
      10973900
    ],
    [
      "2023-01-02T14:10:00+0530",
      18248.25,
      18252,
      18244.35,
      18245,
      27250,
      10981750
    ],
    [
      "2023-01-02T14:15:00+0530",
      18244.3,
      18245,
      18200.1,
      18206,
      324500,
      11003700
    ],
    [
      "2023-01-02T14:20:00+0530",
      18204.95,
      18215.5,
      18188,
      18211,
      162350,
      10998500
    ],
    [
      "2023-01-02T14:25:00+0530",
      18212.95,
      18226.9,
      18209.1,
      18219.85,
      68750,
      10996300
    ],
    [
      "2023-01-02T14:30:00+0530",
      18219.55,
      18236.6,
      18213.1,
      18236.6,
      54000,
      10993300
    ],
    [
      "2023-01-02T14:35:00+0530",
      18235,
      18237.3,
      18220.05,
      18228.7,
      35200,
      10987450
    ],
    [
      "2023-01-02T14:40:00+0530",
      18229.4,
      18245,
      18222.35,
      18231.35,
      54650,
      10986750
    ],
    [
      "2023-01-02T14:45:00+0530",
      18230.25,
      18278.75,
      18230,
      18275,
      230600,
      10965800
    ],
    [
      "2023-01-02T14:50:00+0530",
      18275,
      18292.15,
      18271.6,
      18275.35,
      179700,
      10968050
    ],
    [
      "2023-01-02T14:55:00+0530",
      18277.95,
      18286,
      18258.3,
      18260.6,
      84150,
      10970600
    ],
    [
      "2023-01-02T15:00:00+0530",
      18262.65,
      18271.55,
      18253.65,
      18262.65,
      82350,
      10952900
    ],
    [
      "2023-01-02T15:05:00+0530",
      18260.4,
      18274.3,
      18250.1,
      18273.35,
      57650,
      10938700
    ],
    [
      "2023-01-02T15:10:00+0530",
      18274.9,
      18279.3,
      18263.15,
      18273.35,
      82600,
      10939500
    ],
    [
      "2023-01-02T15:15:00+0530",
      18272.25,
      18285.9,
      18271.6,
      18278.15,
      110000,
      10934500
    ],
    [
      "2023-01-02T15:20:00+0530",
      18278.15,
      18285,
      18277.65,
      18280.5,
      148150,
      10952400
    ],
    [
      "2023-01-02T15:25:00+0530",
      18278.75,
      18287.6,
      18276.45,
      18278.7,
      189200,
      10959550
    ]
  ]
}
