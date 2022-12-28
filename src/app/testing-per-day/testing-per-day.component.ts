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
       "2022-12-26T09:15:00+0530",
       17890.05,
       17910.55,
       17835.6,
       17887.15,
       411350,
       9832750
    ],
    [
       "2022-12-26T09:20:00+0530",
       17893.3,
       17927.7,
       17880,
       17918.35,
       309300,
       9849400
    ],
    [
       "2022-12-26T09:25:00+0530",
       17922,
       17941.95,
       17919.55,
       17935.65,
       263550,
       9892400
    ],
    [
       "2022-12-26T09:30:00+0530",
       17937,
       17945.25,
       17914,
       17931.8,
       166650,
       9884650
    ],
    [
       "2022-12-26T09:35:00+0530",
       17931.85,
       17988,
       17931.8,
       17980.5,
       391350,
       9846250
    ],
    [
       "2022-12-26T09:40:00+0530",
       17982.5,
       17986.9,
       17972.1,
       17980,
       132200,
       9799000
    ],
    [
       "2022-12-26T09:45:00+0530",
       17980,
       17993.8,
       17951.1,
       17972.1,
       174500,
       9790400
    ],
    [
       "2022-12-26T09:50:00+0530",
       17974.15,
       17990.85,
       17972,
       17973.65,
       107500,
       9774100
    ],
    [
       "2022-12-26T09:55:00+0530",
       17973.65,
       17987.85,
       17960.05,
       17966.75,
       104800,
       9765400
    ],
    [
       "2022-12-26T10:00:00+0530",
       17969.6,
       17976.45,
       17956.25,
       17966.1,
       73150,
       9752300
    ],
    [
       "2022-12-26T10:05:00+0530",
       17966.1,
       17976.45,
       17961.15,
       17972.75,
       59700,
       9746850
    ],
    [
       "2022-12-26T10:10:00+0530",
       17972.75,
       17975,
       17967,
       17970,
       42150,
       9744350
    ],
    [
       "2022-12-26T10:15:00+0530",
       17970,
       17970,
       17943.3,
       17947.8,
       121750,
       9702900
    ],
    [
       "2022-12-26T10:20:00+0530",
       17947.8,
       17957.75,
       17937,
       17955.65,
       116300,
       9663750
    ],
    [
       "2022-12-26T10:25:00+0530",
       17953.8,
       17974.75,
       17951.4,
       17972.05,
       142150,
       9639900
    ],
    [
       "2022-12-26T10:30:00+0530",
       17969.4,
       17974,
       17959.05,
       17964.95,
       36050,
       9638500
    ],
    [
       "2022-12-26T10:35:00+0530",
       17965,
       17983.75,
       17962.55,
       17973.8,
       63500,
       9639000
    ],
    [
       "2022-12-26T10:40:00+0530",
       17973.8,
       17982,
       17963.25,
       17966.45,
       32050,
       9647300
    ],
    [
       "2022-12-26T10:45:00+0530",
       17966.45,
       17975.95,
       17960,
       17975,
       35150,
       9648150
    ],
    [
       "2022-12-26T10:50:00+0530",
       17974.6,
       17985.35,
       17974.6,
       17982,
       35850,
       9654950
    ],
    [
       "2022-12-26T10:55:00+0530",
       17982,
       17998.55,
       17969.5,
       17994.6,
       89250,
       9652950
    ],
    [
       "2022-12-26T11:00:00+0530",
       17995.8,
       17999.6,
       17985,
       17988.8,
       57750,
       9658400
    ],
    [
       "2022-12-26T11:05:00+0530",
       17988.75,
       17994.95,
       17978,
       17980.05,
       55000,
       9672900
    ],
    [
       "2022-12-26T11:10:00+0530",
       17980.45,
       17992.5,
       17978,
       17979.4,
       63300,
       9685000
    ],
    [
       "2022-12-26T11:15:00+0530",
       17978,
       17983.8,
       17975.6,
       17980,
       48900,
       9654150
    ],
    [
       "2022-12-26T11:20:00+0530",
       17980,
       18005,
       17978.8,
       18004.95,
       83300,
       9661750
    ],
    [
       "2022-12-26T11:25:00+0530",
       18003.25,
       18005.35,
       17992.05,
       17995.45,
       72900,
       9670450
    ],
    [
       "2022-12-26T11:30:00+0530",
       17995.45,
       18010,
       17993.1,
       18009.4,
       70400,
       9666250
    ],
    [
       "2022-12-26T11:35:00+0530",
       18009.4,
       18013.7,
       18004,
       18013.7,
       56400,
       9667450
    ],
    [
       "2022-12-26T11:40:00+0530",
       18012.65,
       18020,
       18009.35,
       18020,
       59800,
       9669000
    ],
    [
       "2022-12-26T11:45:00+0530",
       18023,
       18025,
       18014.7,
       18018,
       79450,
       9654850
    ],
    [
       "2022-12-26T11:50:00+0530",
       18018.1,
       18028,
       18015.7,
       18019.9,
       111600,
       9638800
    ],
    [
       "2022-12-26T11:55:00+0530",
       18019,
       18020,
       18008.2,
       18013,
       77950,
       9583950
    ],
    [
       "2022-12-26T12:00:00+0530",
       18013.35,
       18022.05,
       18008.75,
       18014.85,
       44300,
       9583850
    ],
    [
       "2022-12-26T12:05:00+0530",
       18015.05,
       18022,
       18012.2,
       18016.5,
       17200,
       9567000
    ],
    [
       "2022-12-26T12:10:00+0530",
       18016.5,
       18022.55,
       18015,
       18022.4,
       33700,
       9553850
    ],
    [
       "2022-12-26T12:15:00+0530",
       18020.3,
       18026.95,
       18017.1,
       18022.2,
       41850,
       9523700
    ],
    [
       "2022-12-26T12:20:00+0530",
       18023.5,
       18024,
       18004,
       18009.5,
       51500,
       9531700
    ],
    [
       "2022-12-26T12:25:00+0530",
       18008.05,
       18009.5,
       17995,
       17996.05,
       87150,
       9529300
    ],
    [
       "2022-12-26T12:30:00+0530",
       17996.05,
       17997.95,
       17982,
       17990,
       79300,
       9526400
    ],
    [
       "2022-12-26T12:35:00+0530",
       17990,
       18003.05,
       17984.6,
       18001,
       34300,
       9514250
    ],
    [
       "2022-12-26T12:40:00+0530",
       18002.45,
       18008.4,
       17994,
       17996.1,
       22550,
       9512250
    ],
    [
       "2022-12-26T12:45:00+0530",
       17996.15,
       17998.3,
       17987.35,
       17990.05,
       24350,
       9511450
    ],
    [
       "2022-12-26T12:50:00+0530",
       17989.65,
       17996,
       17982.85,
       17992.2,
       71400,
       9491400
    ],
    [
       "2022-12-26T12:55:00+0530",
       17992.75,
       18006.7,
       17992.35,
       18000,
       33500,
       9487650
    ],
    [
       "2022-12-26T13:00:00+0530",
       18000.95,
       18021.4,
       17995.85,
       18018,
       60350,
       9485900
    ],
    [
       "2022-12-26T13:05:00+0530",
       18018.4,
       18021.65,
       18004.95,
       18011.95,
       42100,
       9494900
    ],
    [
       "2022-12-26T13:10:00+0530",
       18011.95,
       18014,
       18003,
       18007.35,
       54650,
       9492300
    ],
    [
       "2022-12-26T13:15:00+0530",
       18007.3,
       18013.55,
       18000,
       18001.8,
       58800,
       9468550
    ],
    [
       "2022-12-26T13:20:00+0530",
       18001.9,
       18007.85,
       17990,
       17993.35,
       36850,
       9469650
    ],
    [
       "2022-12-26T13:25:00+0530",
       17992.65,
       18002.85,
       17988,
       18001.25,
       55200,
       9463950
    ],
    [
       "2022-12-26T13:30:00+0530",
       18002.25,
       18019.85,
       18000.55,
       18019.85,
       70850,
       9455350
    ],
    [
       "2022-12-26T13:35:00+0530",
       18017.3,
       18043.95,
       18014,
       18039.95,
       240400,
       9490300
    ],
    [
       "2022-12-26T13:40:00+0530",
       18040,
       18042,
       18015.5,
       18024.5,
       105750,
       9512650
    ],
    [
       "2022-12-26T13:45:00+0530",
       18025,
       18033.7,
       18014.8,
       18019,
       56200,
       9498600
    ],
    [
       "2022-12-26T13:50:00+0530",
       18019,
       18031.85,
       18008.05,
       18011,
       38700,
       9490450
    ],
    [
       "2022-12-26T13:55:00+0530",
       18007.8,
       18015.35,
       18001,
       18011.3,
       55550,
       9473850
    ],
    [
       "2022-12-26T14:00:00+0530",
       18012.5,
       18027.9,
       18008.6,
       18022.5,
       40900,
       9470350
    ],
    [
       "2022-12-26T14:05:00+0530",
       18024.65,
       18027.7,
       18010,
       18027.7,
       31500,
       9469250
    ],
    [
       "2022-12-26T14:10:00+0530",
       18025,
       18033.5,
       18021.25,
       18032,
       34350,
       9474200
    ],
    [
       "2022-12-26T14:15:00+0530",
       18033.5,
       18034.4,
       18018.9,
       18028.8,
       56250,
       9382450
    ],
    [
       "2022-12-26T14:20:00+0530",
       18032,
       18045.45,
       18028.8,
       18040.8,
       91500,
       9388650
    ],
    [
       "2022-12-26T14:25:00+0530",
       18042.7,
       18042.95,
       18028.3,
       18042,
       60800,
       9387300
    ],
    [
       "2022-12-26T14:30:00+0530",
       18044,
       18069.95,
       18039.7,
       18067.85,
       190800,
       9392750
    ],
    [
       "2022-12-26T14:35:00+0530",
       18067.9,
       18085,
       18058.45,
       18081.95,
       199450,
       9351500
    ],
    [
       "2022-12-26T14:40:00+0530",
       18081.75,
       18090.7,
       18072,
       18077.6,
       156300,
       9347450
    ],
    [
       "2022-12-26T14:45:00+0530",
       18077,
       18095,
       18063.25,
       18088.5,
       132300,
       9302250
    ],
    [
       "2022-12-26T14:50:00+0530",
       18087.8,
       18099,
       18083.2,
       18093.35,
       119050,
       9270650
    ],
    [
       "2022-12-26T14:55:00+0530",
       18093.8,
       18106,
       18086.65,
       18102.9,
       133650,
       9251150
    ],
    [
       "2022-12-26T15:00:00+0530",
       18100.05,
       18105.5,
       18068.55,
       18071.9,
       192200,
       9199550
    ],
    [
       "2022-12-26T15:05:00+0530",
       18071.3,
       18073.2,
       18036.5,
       18036.5,
       223650,
       9146200
    ],
    [
       "2022-12-26T15:10:00+0530",
       18035,
       18036.5,
       17995.9,
       18006.65,
       493700,
       9120700
    ],
    [
       "2022-12-26T15:15:00+0530",
       18005.4,
       18026.45,
       18000.3,
       18012.55,
       183600,
       9000100
    ],
    [
       "2022-12-26T15:20:00+0530",
       18013.9,
       18020,
       18009.1,
       18012.8,
       132450,
       8945850
    ],
    [
       "2022-12-26T15:25:00+0530",
       18012.35,
       18022,
       18010.35,
       18018.1,
       191950,
       8953400
    ]
 ]
}
