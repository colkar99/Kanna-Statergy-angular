import { Component, OnInit } from '@angular/core';

import { DataService } from './data.service';

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

  liveBuySlSell = 10,
  liveSellSlBuy = 11,

  completed = 12,

}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kanna-statergyAngular';
  MB: MartketData = {
    allHigh: 0, allLow: 0, high: 0, low: 0, open: 0, UB: 0, LB: 0, target: 0, stopLoss: 0, priceToTrade: 0, trades: [], status: Order.nill, isFirstTrade: true, comments: [], slOrderStatus: 1, slOrderPlaced: false, slPriceToTrade: 0
  };
  trades = [];
  constructor(private datas: DataService) { }
  ngOnInit(): void {
    this.mainFunction()
  }
  mainFunction() {
    this.datas.datas.forEach((data, index) => {
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
      // let endTime = `${new Date(data[0]).getHours()}${new Date(data[0]).getMinutes()}`;
      // if (endTime == '1515') {
      //   let closePrice = data[Val.open];

      //   if (this.MB.status == Order.liveBuy) {
      //     this.MB.comments.push(`TimeEnd Sell exe at open price ${closePrice}`)

      //   } else if (this.MB.status == Order.liveSell) {
      //     this.MB.comments.push(`TimeEnd Buy exe at open price ${closePrice}`)
      //   } else {
      //     this.MB.comments.push(`Cancell all the pending orders and close the trade`)
      //   }
      //   this.MB.status = Order.completed;
      //   this.MB.target = 0;
      //   this.MB.stopLoss = 0;
      //   this.MB.priceToTrade = 0;
      //   this.MB.slOrderPlaced = false;
      //   this.MB.slPriceToTrade = 0;
      //   this.MB.slOrderStatus = Order.cancelled
      // }


      switch (this.MB.status) {
        case 1: {
          //No Trade
          this.checkToPlaceOrder(data);
          break;
        }
        case 2: {
          //Normal Buy placed
          //check  high crossed trade price
          if(data[Val.high] >= this.MB.priceToTrade){
            //exec Order
            this.MB.status = Order.liveBuyNormal;
            this.MB.comments.push(`Normal Buy Order Exec at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            //new High
            if(data[Val.high] > this.MB.high){
              this.MB.comments.push(`New High(${data[Val.high]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }
            
          if(data[Val.low] <= this.MB.LB){
            //cancel Buy Order cnage status to 1
            this.MB.status = Order.nill
            this.MB.comments.push(`LB Normal Buy Cancelled at  ${this.getTimeForComment(data)}`)

             //Place normal Buy/ Tgt buy order
             if(data[Val.low] <= this.MB.low){
              this.MB.status = Order.pendingSellNormal;
              this.MB.priceToTrade = data[Val.low] - 1;
              this.MB.comments.push(`LB Normal Sell Order Placed at${data[Val.low - 1]} ${this.getTimeForComment(data)}`)
            }else{
              this.MB.status = Order.pendingSellTarget;
              this.MB.priceToTrade = data[Val.low] - 1;
              this.setTargetFunction('BUY')
              this.MB.comments.push(`LB TGT SELL Order Placed at${data[Val.low - 1]} TGT:${this.MB.target} , SL:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            if(data[Val.low] <= this.MB.low){
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
          //High >= Target 
          if(data[Val.high] >= this.MB.target){
              this.MB.comments.push(`TGT Reached New High(${data[Val.high]}) at ${this.getTimeForComment(data)}`)
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high]; 
              this.setUpperBandAndLowerBand(data);
              this.MB.comments.push(`Convert To normal Buy order ${this.MB.priceToTrade} at ${this.getTimeForComment(data)}`)
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              return
            //update bands and convert to normal order
            //new high >  old high
          }
          // low <= stoploss
          if(data[Val.low] <= this.MB.stopLoss){
            //place SL Sell Order
            this.MB.slPriceToTrade = data[Val.low] - 1;
            if(data[Val.low] <= this.MB.low){
              //Normal Order
              this.MB.comments.push(`New Low(${data[Val.low]}) at ${this.getTimeForComment(data)}`)
              this.setUpperBandAndLowerBand(data);
              this.MB.status = Order.pendingSellNormal
              this.MB.comments.push(`SL hit Normall sell order Placed at ${data[Val.low] - 1} at ${this.getTimeForComment(data)}`)
            }else{
              this.MB.status = Order.pendingSellTarget
              this.setTargetFunction('SELL')
              this.MB.comments.push(`SL hit TGT sell order Placed at ${data[Val.low] - 1} TGT${this.MB.target} sl:${this.MB.stopLoss} at ${this.getTimeForComment(data)}`)

              //Target Order

            }
            //check new Low   

          }

          break;
        }
        case 4: {
            //Normal sell placed
          //check  low crossed trade price
          if(data[Val.low] <= this.MB.priceToTrade){
            //exec Order
            this.MB.status = Order.liveSellNormal;
            this.MB.comments.push(`Normal sell Order Exec at ${this.MB.priceToTrade} ${this.getTimeForComment(data)}`)
            //new low
            if(data[Val.low] < this.MB.low){
              this.MB.comments.push(`New Low(${data[Val.low]}) Band Revise at ${this.getTimeForComment(data)}`)
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);
            }
            return
          }
          //check  High greater than UB 
          if(data[Val.high] >= this.MB.UB){
            //cancel Buy Order cnage status to 1
            this.MB.status = Order.nill
            this.MB.comments.push(`UB Normal Sell Cancelled at  ${this.getTimeForComment(data)}`)

            //Place normal Buy/ Tgt buy order
            if(data[Val.high] >= this.MB.high){
              this.MB.status = Order.pendingBUYNomal;
              this.MB.priceToTrade = data[Val.high] + 1;
              this.MB.comments.push(`UB Normal Buy Order Placed at${data[Val.high + 1]} ${this.getTimeForComment(data)}`)
            }else{
              this.MB.status = Order.pendingBUYTarget;
              this.MB.priceToTrade = data[Val.high] + 1;
              this.setTargetFunction('BUY')
              this.MB.comments.push(`UB TGT Buy Order Placed at${data[Val.high + 1]} TGT:${this.MB.target} , SL:${this.MB.stopLoss} ${this.getTimeForComment(data)}`)
            }

            if(data[Val.high] >= this.MB.high){
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
          //Sell live
          break
        }
      }

      // if(data[Val.high] >= )
      // console.log(index);
    })
    console.log(this.MB)
  }




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
        this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
        this.MB.status = Order.pendingBUYTarget;
      } else {
        this.MB.status = Order.pendingBUYNomal;
        this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
      }
      this.MB.priceToTrade = this.customParseFloat(data[Val.high] + 1);
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
        this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} ${this.getTimeForComment(data)}`);
      }
      else {
        this.MB.status = Order.pendingSellNormal
        this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1}, ${this.getTimeForComment(data)}`)
      }
      this.MB.priceToTrade = this.customParseFloat(data[Val.low] - 1);
      console.log(`Crossed LB SELL Order placed at ${data[Val.low] - 1}`);
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
    //   nill = 1,
    // pendingBUYNomal = 2, //initial trade
    // pendingBUYTarget = 3, //initial trade

    // pendingSellNormal = 4, //initial trade
    // pendingSellTarget = 5, //initial trade

    // liveBuyNormal = 6, //initial trade with no SL trade
    // liveBuyTarget = 7, //initial trade with no SL trade

    // liveSellNormal = 8, //initial trade with no SL trade
    // liveSellTarget = 9, //initial trade with no SL trade

    // liveBuySlSell = 10,
    // liveSellSlBuy = 11,

    // completed = 12,
    switch (num) {
      case 1:
        return 'Not Started';
      case 2:
        return "Normal Buy order placed";
      case 3:
        return "Target Buy order placed";
      case 4:
        return "Normal Sell order placed";
      case 5:
        return "Target Sell order placed";
      case 6:
        return "Live buy Normal";
      case 7:
        return "Live buy Target";
      case 8:
        return "Live sell Normal";
      case 9:
        return "Live sell Target";
      case 10:
        return "Live Buy Stoploss Sell placed";
      case 11:
        return "Live Sell Stoploss Buy placed";
      case 12:
        return "Completed";


      default: return 'Null'
    }

  }
  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
  //get time for comment method
  getTimeForComment(data:any){
    return `Time: ${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`
  }
}
