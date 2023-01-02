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
      debugger

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
              this.MB.comments.push(`LB Normal Sell Order Placed at${data[Val.low - this.buySellDiff]} ${this.getTimeForComment(data)}`)
            } else {
              this.MB.status = Order.pendingSellTarget;
              this.MB.priceToTrade = data[Val.low] - this.buySellDiff;
              this.setTargetFunction('BUY')
              this.MB.comments.push(`LB TGT SELL Order Placed at${data[Val.low - this.buySellDiff]} TGT:${this.MB.target} , SL:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
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
    debugger
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
       "2022-12-30T09:15:00+0530",
       18338,
       18350,
       18310.05,
       18318.15,
       418650,
       10481000
    ],
    [
       "2022-12-30T09:20:00+0530",
       18324.45,
       18345.55,
       18324,
       18336,
       171750,
       10499750
    ],
    [
       "2022-12-30T09:25:00+0530",
       18337.2,
       18355.1,
       18336,
       18352,
       155700,
       10515850
    ],
    [
       "2022-12-30T09:30:00+0530",
       18352.05,
       18360,
       18313.05,
       18317.35,
       240600,
       10537850
    ],
    [
       "2022-12-30T09:35:00+0530",
       18316.65,
       18370,
       18315,
       18366.85,
       221500,
       10553950
    ],
    [
       "2022-12-30T09:40:00+0530",
       18370.5,
       18373.4,
       18335.4,
       18343.9,
       162800,
       10558600
    ],
    [
       "2022-12-30T09:45:00+0530",
       18343.3,
       18359.85,
       18339.3,
       18339.3,
       54950,
       10563800
    ],
    [
       "2022-12-30T09:50:00+0530",
       18339,
       18358.8,
       18333.05,
       18357,
       58700,
       10571400
    ],
    [
       "2022-12-30T09:55:00+0530",
       18357.6,
       18360,
       18346.3,
       18349.35,
       51450,
       10569550
    ],
    [
       "2022-12-30T10:00:00+0530",
       18347,
       18350,
       18336,
       18336.85,
       56650,
       10571500
    ],
    [
       "2022-12-30T10:05:00+0530",
       18337,
       18350.75,
       18324.95,
       18331.8,
       77050,
       10578800
    ],
    [
       "2022-12-30T10:10:00+0530",
       18332.4,
       18337.9,
       18318.8,
       18323.3,
       67000,
       10600600
    ],
    [
       "2022-12-30T10:15:00+0530",
       18322.05,
       18334,
       18317.15,
       18325.75,
       127600,
       10617950
    ],
    [
       "2022-12-30T10:20:00+0530",
       18326.3,
       18338.85,
       18320.4,
       18332.7,
       81350,
       10675650
    ],
    [
       "2022-12-30T10:25:00+0530",
       18333.75,
       18342,
       18330.5,
       18336.8,
       37350,
       10691800
    ],
    [
       "2022-12-30T10:30:00+0530",
       18336.55,
       18347.95,
       18334.6,
       18342.8,
       67200,
       10710450
    ],
    [
       "2022-12-30T10:35:00+0530",
       18342.8,
       18344,
       18329.1,
       18339.6,
       66100,
       10701300
    ],
    [
       "2022-12-30T10:40:00+0530",
       18339.6,
       18350.2,
       18338,
       18338.4,
       43100,
       10684700
    ],
    [
       "2022-12-30T10:45:00+0530",
       18337,
       18339.95,
       18328.2,
       18337.15,
       46100,
       10684450
    ],
    [
       "2022-12-30T10:50:00+0530",
       18337.15,
       18338.25,
       18328.45,
       18333.65,
       28550,
       10688050
    ],
    [
       "2022-12-30T10:55:00+0530",
       18333.65,
       18333.65,
       18320,
       18323.2,
       41650,
       10692000
    ],
    [
       "2022-12-30T11:00:00+0530",
       18324.95,
       18331.8,
       18320,
       18320.65,
       44450,
       10691300
    ],
    [
       "2022-12-30T11:05:00+0530",
       18320.65,
       18328.75,
       18315,
       18325.15,
       59750,
       10693750
    ],
    [
       "2022-12-30T11:10:00+0530",
       18325.65,
       18331.65,
       18321.35,
       18331.55,
       33450,
       10701750
    ],
    [
       "2022-12-30T11:15:00+0530",
       18330.9,
       18331.4,
       18303.75,
       18305.15,
       145350,
       10703050
    ],
    [
       "2022-12-30T11:20:00+0530",
       18306.35,
       18318,
       18301.15,
       18309.9,
       88350,
       10702100
    ],
    [
       "2022-12-30T11:25:00+0530",
       18309,
       18318.1,
       18306.05,
       18310.9,
       33100,
       10704950
    ],
    [
       "2022-12-30T11:30:00+0530",
       18311.35,
       18316.1,
       18294,
       18316.1,
       83850,
       10703250
    ],
    [
       "2022-12-30T11:35:00+0530",
       18313.65,
       18317.85,
       18303.75,
       18304,
       51300,
       10706200
    ],
    [
       "2022-12-30T11:40:00+0530",
       18304,
       18306.5,
       18292,
       18296.05,
       55250,
       10705800
    ],
    [
       "2022-12-30T11:45:00+0530",
       18296.15,
       18303.45,
       18291,
       18291.1,
       55750,
       10714750
    ],
    [
       "2022-12-30T11:50:00+0530",
       18291.1,
       18301.45,
       18290,
       18293.05,
       40900,
       10722750
    ],
    [
       "2022-12-30T11:55:00+0530",
       18293.05,
       18299.85,
       18276,
       18277.65,
       123150,
       10705850
    ],
    [
       "2022-12-30T12:00:00+0530",
       18279.5,
       18295,
       18271,
       18288.65,
       131450,
       10689450
    ],
    [
       "2022-12-30T12:05:00+0530",
       18288.65,
       18303.7,
       18287.1,
       18294.15,
       96200,
       10692100
    ],
    [
       "2022-12-30T12:10:00+0530",
       18295,
       18298.4,
       18287.65,
       18289.2,
       42150,
       10690200
    ],
    [
       "2022-12-30T12:15:00+0530",
       18289.2,
       18300,
       18287.15,
       18299.4,
       42050,
       10696400
    ],
    [
       "2022-12-30T12:20:00+0530",
       18299.4,
       18299.95,
       18290,
       18292.65,
       63700,
       10707650
    ],
    [
       "2022-12-30T12:25:00+0530",
       18293,
       18293,
       18280.55,
       18280.55,
       62450,
       10697550
    ],
    [
       "2022-12-30T12:30:00+0530",
       18279,
       18290.9,
       18278.35,
       18289.3,
       44100,
       10701800
    ],
    [
       "2022-12-30T12:35:00+0530",
       18290,
       18315,
       18289.1,
       18312.1,
       113200,
       10732200
    ],
    [
       "2022-12-30T12:40:00+0530",
       18312,
       18321.35,
       18308,
       18319.5,
       131300,
       10772200
    ],
    [
       "2022-12-30T12:45:00+0530",
       18320,
       18320,
       18305.3,
       18310.75,
       59100,
       10772150
    ],
    [
       "2022-12-30T12:50:00+0530",
       18310.75,
       18315.75,
       18304.25,
       18309.15,
       37500,
       10772200
    ],
    [
       "2022-12-30T12:55:00+0530",
       18310,
       18310.8,
       18297.05,
       18298.65,
       57150,
       10792250
    ],
    [
       "2022-12-30T13:00:00+0530",
       18297.75,
       18304.75,
       18270,
       18270,
       146850,
       10791700
    ],
    [
       "2022-12-30T13:05:00+0530",
       18268.6,
       18282.95,
       18261.35,
       18279.25,
       102700,
       10794400
    ],
    [
       "2022-12-30T13:10:00+0530",
       18279,
       18280.95,
       18269.35,
       18275,
       46300,
       10817150
    ],
    [
       "2022-12-30T13:15:00+0530",
       18275,
       18286.75,
       18266.15,
       18278.3,
       64850,
       10826550
    ],
    [
       "2022-12-30T13:20:00+0530",
       18279.6,
       18282.1,
       18271.3,
       18273.7,
       52700,
       10840000
    ],
    [
       "2022-12-30T13:25:00+0530",
       18273.05,
       18302,
       18272.2,
       18299.15,
       98100,
       10836700
    ],
    [
       "2022-12-30T13:30:00+0530",
       18298.55,
       18299.95,
       18280,
       18290,
       125700,
       10825900
    ],
    [
       "2022-12-30T13:35:00+0530",
       18289.55,
       18290.1,
       18278,
       18286,
       29550,
       10832100
    ],
    [
       "2022-12-30T13:40:00+0530",
       18283.25,
       18287.1,
       18272.45,
       18276.1,
       32850,
       10837200
    ],
    [
       "2022-12-30T13:45:00+0530",
       18276.1,
       18285,
       18271.1,
       18274.95,
       35800,
       10842150
    ],
    [
       "2022-12-30T13:50:00+0530",
       18274.95,
       18274.95,
       18244,
       18256,
       258350,
       10850450
    ],
    [
       "2022-12-30T13:55:00+0530",
       18254.55,
       18256,
       18245.75,
       18246.05,
       88800,
       10858350
    ],
    [
       "2022-12-30T14:00:00+0530",
       18246.25,
       18263,
       18242.05,
       18245.1,
       106150,
       10889900
    ],
    [
       "2022-12-30T14:05:00+0530",
       18248.4,
       18263,
       18246.35,
       18260,
       67400,
       10904050
    ],
    ["2022-12-30T14:10:00+0530",18260,18287,18259.3,18280.75,238950,10887100],["2022-12-30T14:15:00+0530",18283.15,18284,18267,18275,82550,10938300],["2022-12-30T14:20:00+0530",18274.5,18275.1,18255,18263.25,40300,10949800],["2022-12-30T14:25:00+0530",18263.25,18268.8,18243.2,18245,98100,10950850],["2022-12-30T14:30:00+0530",18236.65,18258.5,18233.95,18250,130150,10939850],["2022-12-30T14:35:00+0530",18250,18259.9,18245,18254,35700,10952150],["2022-12-30T14:40:00+0530",18254.35,18259.9,18247.9,18253.1,49300,10956250],["2022-12-30T14:45:00+0530",18255,18279.6,18253.1,18270.05,95500,10970150],["2022-12-30T14:50:00+0530",18271.1,18288,18265,18284.15,30800,10973200]
 ]
}
