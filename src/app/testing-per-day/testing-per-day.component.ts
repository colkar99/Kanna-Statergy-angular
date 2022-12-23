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

  buySellDiff: number = 1 ;
  buySide: number[] = [6, 7, 10, 11, 12, 13]
  sellSide: number[] = [8, 9, 14, 15, 16, 17]
  endTime: number = 1515;
  
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



  resetData() {
    this.MB = {
      allHigh: 0, allLow: 0, high: 0, low: 0, open: 0, UB: 0, LB: 0, target: 0, stopLoss: 0, priceToTrade: 0, trades: [], status: Order.nill, isFirstTrade: true, comments: [], slOrderStatus: 1, slOrderPlaced: false, slPriceToTrade: 0
    };
    this.totalPointsEarned = 0
    this.trades = [];
  }
  mainFunction(datas: any[]) {
    // this.resetData();
    debugger
    datas.forEach((data, index) => {
      if (index == 0) {
        this.MB.date = data[0]
        this.MB.open = data[Val.open];
        this.MB.high = data[Val.high];
        this.MB.allHigh = data[Val.high];
        this.MB.low = data[Val.low];
        this.MB.allLow = data[Val.low];
        this.setUpperBandAndLowerBand(data)
        return;
      }
      let currentTime = `${new Date(data[0]).getHours()}${new Date(data[0]).getMinutes()}`;
      if (parseInt(currentTime) == this.endTime) {
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

      if (parseInt(currentTime) > this.endTime) {
        this.resetData();
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
    this.datas.setResultEachDay({date: this.MB.date,ProfitAndLoss: this.customParseFloat(this.totalPointsEarned),noOfTrades: this.trades.length})
    // alert(this.totalPointsEarned)
  }

  getExecPresent(comment: string) {
    return comment.split(' ').includes('EXEC')

  }

  dayData: any[] =  [
    [
       "2022-12-08T09:15:00+0530",
       4010,
       4031.45,
       4005,
       4025.55,
       82471,
       0
    ],
    [
       "2022-12-08T09:20:00+0530",
       4027.05,
       4044.85,
       4025,
       4033.35,
       77708,
       0
    ],
    [
       "2022-12-08T09:25:00+0530",
       4033.35,
       4037.95,
       4027,
       4033.35,
       30251,
       0
    ],
    [
       "2022-12-08T09:30:00+0530",
       4033.35,
       4037,
       4028,
       4030.8,
       20164,
       0
    ],
    [
       "2022-12-08T09:35:00+0530",
       4031,
       4034,
       4024.9,
       4025.35,
       19047,
       0
    ],
    [
       "2022-12-08T09:40:00+0530",
       4025.9,
       4030,
       4018.25,
       4025.9,
       23193,
       0
    ],
    [
       "2022-12-08T09:45:00+0530",
       4025.5,
       4032.1,
       4020,
       4027,
       15233,
       0
    ],
    [
       "2022-12-08T09:50:00+0530",
       4027.75,
       4032.55,
       4026.45,
       4030.65,
       8326,
       0
    ],
    [
       "2022-12-08T09:55:00+0530",
       4030.65,
       4038.7,
       4028.7,
       4038,
       25238,
       0
    ],
    [
       "2022-12-08T10:00:00+0530",
       4038,
       4040,
       4028.1,
       4029,
       18922,
       0
    ],
    [
       "2022-12-08T10:05:00+0530",
       4030,
       4031,
       4025.15,
       4030.6,
       8967,
       0
    ],
    [
       "2022-12-08T10:10:00+0530",
       4030.6,
       4038,
       4030,
       4032.9,
       7802,
       0
    ],
    [
       "2022-12-08T10:15:00+0530",
       4032,
       4034,
       4031.05,
       4032.9,
       3875,
       0
    ],
    [
       "2022-12-08T10:20:00+0530",
       4033.65,
       4035,
       4031,
       4031.05,
       5269,
       0
    ],
    [
       "2022-12-08T10:25:00+0530",
       4031.05,
       4032.2,
       4026.15,
       4030,
       7249,
       0
    ],
    [
       "2022-12-08T10:30:00+0530",
       4030,
       4035,
       4028,
       4030,
       10133,
       0
    ],
    [
       "2022-12-08T10:35:00+0530",
       4030,
       4030,
       4020.5,
       4021,
       13444,
       0
    ],
    [
       "2022-12-08T10:40:00+0530",
       4021,
       4030,
       4021,
       4026.35,
       13864,
       0
    ],
    [
       "2022-12-08T10:45:00+0530",
       4026.35,
       4032,
       4026.15,
       4028.3,
       6982,
       0
    ],
    [
       "2022-12-08T10:50:00+0530",
       4028.3,
       4036.5,
       4028,
       4035,
       11393,
       0
    ],
    [
       "2022-12-08T10:55:00+0530",
       4035,
       4036,
       4031,
       4032.35,
       8595,
       0
    ],
    [
       "2022-12-08T11:00:00+0530",
       4032.35,
       4039,
       4032.35,
       4033.15,
       22547,
       0
    ],
    [
       "2022-12-08T11:05:00+0530",
       4032.55,
       4033.5,
       4025.05,
       4029,
       6881,
       0
    ],
    [
       "2022-12-08T11:10:00+0530",
       4028.4,
       4033.3,
       4028.05,
       4029.35,
       3054,
       0
    ],
    [
       "2022-12-08T11:15:00+0530",
       4029.35,
       4031,
       4027.05,
       4030.95,
       3209,
       0
    ],
    [
       "2022-12-08T11:20:00+0530",
       4030.9,
       4031.95,
       4028,
       4028,
       4842,
       0
    ],
    [
       "2022-12-08T11:25:00+0530",
       4028,
       4029,
       4023,
       4027.95,
       7462,
       0
    ],
    [
       "2022-12-08T11:30:00+0530",
       4027.9,
       4028,
       4024.85,
       4028,
       4351,
       0
    ],
    [
       "2022-12-08T11:35:00+0530",
       4028,
       4030,
       4022,
       4022.8,
       4874,
       0
    ],
    [
       "2022-12-08T11:40:00+0530",
       4024,
       4029.65,
       4022.8,
       4026.75,
       3731,
       0
    ],
    [
       "2022-12-08T11:45:00+0530",
       4026.75,
       4030.3,
       4024.85,
       4030,
       2727,
       0
    ],
    [
       "2022-12-08T11:50:00+0530",
       4030,
       4030,
       4025,
       4025.85,
       1720,
       0
    ],
    [
       "2022-12-08T11:55:00+0530",
       4025.85,
       4029.1,
       4025.05,
       4028.7,
       1463,
       0
    ],
    [
       "2022-12-08T12:00:00+0530",
       4028.7,
       4029.1,
       4025.2,
       4025.95,
       1846,
       0
    ],
    [
       "2022-12-08T12:05:00+0530",
       4027.05,
       4029.1,
       4026,
       4027.2,
       2124,
       0
    ],
    [
       "2022-12-08T12:10:00+0530",
       4027.2,
       4028.7,
       4025,
       4026.45,
       2755,
       0
    ],
    [
       "2022-12-08T12:15:00+0530",
       4026.45,
       4030,
       4024,
       4027.85,
       4557,
       0
    ],
    [
       "2022-12-08T12:20:00+0530",
       4027.5,
       4027.5,
       4022,
       4024,
       4754,
       0
    ],
    [
       "2022-12-08T12:25:00+0530",
       4023.5,
       4024,
       4013,
       4019.05,
       19887,
       0
    ],
    [
       "2022-12-08T12:30:00+0530",
       4019.05,
       4026,
       4018.05,
       4022.4,
       4525,
       0
    ],
    [
       "2022-12-08T12:35:00+0530",
       4022.4,
       4022.85,
       4020,
       4020,
       2662,
       0
    ],
    [
       "2022-12-08T12:40:00+0530",
       4020.9,
       4022.9,
       4018,
       4019.1,
       6153,
       0
    ],
    [
       "2022-12-08T12:45:00+0530",
       4019.1,
       4022,
       4015,
       4022,
       5930,
       0
    ],
    [
       "2022-12-08T12:50:00+0530",
       4021.35,
       4025,
       4019.35,
       4020.95,
       3868,
       0
    ],
    [
       "2022-12-08T12:55:00+0530",
       4020.95,
       4021.25,
       4019,
       4021.05,
       1941,
       0
    ],
    [
       "2022-12-08T13:00:00+0530",
       4021.95,
       4025.95,
       4020.5,
       4023.9,
       4373,
       0
    ],
    [
       "2022-12-08T13:05:00+0530",
       4024.75,
       4025,
       4022.05,
       4024,
       1943,
       0
    ],
    [
       "2022-12-08T13:10:00+0530",
       4024,
       4024.95,
       4020.6,
       4022,
       3407,
       0
    ],
    [
       "2022-12-08T13:15:00+0530",
       4022,
       4024.8,
       4018.3,
       4023.7,
       3754,
       0
    ],
    [
       "2022-12-08T13:20:00+0530",
       4023.7,
       4023.7,
       4020,
       4021.1,
       4532,
       0
    ],
    [
       "2022-12-08T13:25:00+0530",
       4021.1,
       4023.2,
       4020.05,
       4021.4,
       2274,
       0
    ],
    [
       "2022-12-08T13:30:00+0530",
       4021.4,
       4023.95,
       4017.8,
       4022.3,
       4903,
       0
    ],
    [
       "2022-12-08T13:35:00+0530",
       4022.3,
       4023,
       4020,
       4020.5,
       2178,
       0
    ],
    [
       "2022-12-08T13:40:00+0530",
       4020.65,
       4021,
       4018.3,
       4019,
       2141,
       0
    ],
    [
       "2022-12-08T13:45:00+0530",
       4020.7,
       4020.7,
       4019,
       4020.4,
       1486,
       0
    ],
    [
       "2022-12-08T13:50:00+0530",
       4020.35,
       4020.4,
       4013,
       4014.9,
       9492,
       0
    ],
    [
       "2022-12-08T13:55:00+0530",
       4014.9,
       4018.7,
       4006.55,
       4018.65,
       16930,
       0
    ],
    [
       "2022-12-08T14:00:00+0530",
       4018.5,
       4022,
       4013.5,
       4017.85,
       7519,
       0
    ],
    [
       "2022-12-08T14:05:00+0530",
       4017.85,
       4020,
       4015.1,
       4016.5,
       3226,
       0
    ],
    [
       "2022-12-08T14:10:00+0530",
       4016.5,
       4017.9,
       4015,
       4017.75,
       2683,
       0
    ],
    [
       "2022-12-08T14:15:00+0530",
       4017.75,
       4022,
       4016.45,
       4020.05,
       8026,
       0
    ],
    [
       "2022-12-08T14:20:00+0530",
       4021,
       4021.8,
       4018.3,
       4020.55,
       4814,
       0
    ],
    [
       "2022-12-08T14:25:00+0530",
       4020.55,
       4020.8,
       4017,
       4018.65,
       2556,
       0
    ],
    [
       "2022-12-08T14:30:00+0530",
       4018.65,
       4022,
       4018.3,
       4022,
       8231,
       0
    ],
    [
       "2022-12-08T14:35:00+0530",
       4022,
       4026,
       4021,
       4025.95,
       12086,
       0
    ],
    [
       "2022-12-08T14:40:00+0530",
       4025.35,
       4028,
       4023,
       4027,
       15324,
       0
    ],
    [
       "2022-12-08T14:45:00+0530",
       4027,
       4040,
       4027,
       4035.85,
       57774,
       0
    ],
    [
       "2022-12-08T14:50:00+0530",
       4036,
       4039,
       4027.1,
       4031.05,
       21891,
       0
    ],
    [
       "2022-12-08T14:55:00+0530",
       4031.05,
       4032.35,
       4024,
       4030,
       8723,
       0
    ],
    [
       "2022-12-08T15:00:00+0530",
       4030,
       4034.3,
       4025.6,
       4029.2,
       14720,
       0
    ],
    [
       "2022-12-08T15:05:00+0530",
       4029.25,
       4030.9,
       4021.7,
       4022.65,
       15604,
       0
    ],
    [
       "2022-12-08T15:10:00+0530",
       4022.95,
       4025,
       4020,
       4021.7,
       18777,
       0
    ],
    [
       "2022-12-08T15:15:00+0530",
       4021.75,
       4028.1,
       4021.4,
       4026.35,
       26944,
       0
    ],
    [
       "2022-12-08T15:20:00+0530",
       4026.35,
       4028.4,
       4021,
       4022,
       38479,
       0
    ],
    [
       "2022-12-08T15:25:00+0530",
       4022,
       4026.25,
       4020.6,
       4023.35,
       16916,
       0
    ]
 ]
}
