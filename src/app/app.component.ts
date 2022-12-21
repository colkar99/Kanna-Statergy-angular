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
  open = 1,
  high = 2,
  low = 3,
}
enum Order {
  nill = 1,
  pendingBUY = 2,
  pendingSell = 3,
  liveBuy = 4,
  liveSell = 5,
  completed = 6,
  cancelled = 7,

}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kanna-statergyAngular';
  marketObject: MartketData = {
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
        this.marketObject.date = data[0]
        this.marketObject.open = data[Val.open];
        this.marketObject.high = data[Val.high];
        this.marketObject.allHigh = data[Val.high];
        this.marketObject.low = data[Val.low];
        this.marketObject.allLow = data[Val.low];
        this.setUpperBandAndLowerBand(data)
        return;
      }
      let endTime = `${new Date(data[0]).getHours()}${new Date(data[0]).getMinutes()}`;
      if (endTime == '1515') {
        let closePrice = data[Val.open];

        if (this.marketObject.status == Order.liveBuy) {
          this.marketObject.comments.push(`TimeEnd Sell exe at open price ${closePrice}`)

        } else if (this.marketObject.status == Order.liveSell) {
          this.marketObject.comments.push(`TimeEnd Buy exe at open price ${closePrice}`)
        } else {
          this.marketObject.comments.push(`Cancell all the pending orders and close the trade`)
        }
        this.marketObject.status = Order.completed;
        this.marketObject.target = 0;
        this.marketObject.stopLoss = 0;
        this.marketObject.priceToTrade = 0;
        this.marketObject.slOrderPlaced = false;
        this.marketObject.slPriceToTrade = 0;
        this.marketObject.slOrderStatus = Order.cancelled
      }


      switch (this.marketObject.status) {
        case 1: {
          //No Trade
          this.checkToPlaceOrder(data);
          break;
        }
        case 2: {
          //Buy placed
          if (this.marketObject.target == 0) {
            //Normal Buy goes here

            if (data[Val.high] >= this.marketObject.priceToTrade) {
              //Trade executed logic goes here
              this.marketObject.comments.push(`Buy exe at ${this.marketObject.priceToTrade}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

              if (data[Val.high] > this.marketObject.high) {
                this.marketObject.high = data[Val.high];
                this.marketObject.allHigh = data[Val.high]
              }
              this.marketObject.status = Order.liveBuy;
              this.marketObject.isFirstTrade = false;
              this.setUpperBandAndLowerBand(data)
              return
            }

            if (data[Val.low] <= this.marketObject.LB) {
              //Cancel Buy order and place Sell order
              this.marketObject.comments.push(`LB Buy cancelled ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.checkToPlaceOrder(data);
              // this.marketObject.priceToTrade = this.marketObject.low - 1;
              // this.marketObject.orderSide = 'SELL';
              // this.marketObject.status = Order.pendingSell;
            }

            //cancel Buy order 
            // new Low or Low crossed existing lower band


          } else {
            //TGT BUY logic goes here
            if (data[Val.high] >= this.marketObject.priceToTrade) {
              this.marketObject.comments.push(`Buy exe at ${this.marketObject.priceToTrade} ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.marketObject.status = Order.liveBuy;
              this.marketObject.isFirstTrade = false;
              if (data[Val.high] >= this.marketObject.high) this.marketObject.allHigh = data[Val.high];

              if (data[Val.high] >= this.marketObject.target) {
                this.marketObject.high = data[Val.high];
                this.marketObject.comments.push(`TGT Reached , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.checkToPlaceOrder(data);
              }
            }

            if (data[Val.low] <= this.marketObject.stopLoss) {

              this.marketObject.comments.push(`Buy TGT SL reached cancelled , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
              this.checkToPlaceOrder(data);

            }

          }
          //normal order 
          // Order execute 
          // New High OR New low Order may cancel and repeat case 1 logic
          //TGT Order
          // Order execute
          // May reach stoploss and repeat case 1 logic  
          break;
        }
        case 3: {
          debugger
          /// Sell placed
          if (this.marketObject.target == 0) {
            //Normal Buy goes here
            //44  45
            if (data[Val.low] <= this.marketObject.priceToTrade) {
              //Trade executed logic goes here
              this.marketObject.comments.push(`Sell exe at ${this.marketObject.priceToTrade}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

              if (data[Val.low] < this.marketObject.low) {
                this.marketObject.comments.push(`New Low  ${data[Val.low]}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                this.marketObject.low = data[Val.low];
                this.marketObject.allLow = data[Val.low]
              }
              this.marketObject.status = Order.liveSell;
              this.marketObject.isFirstTrade = false;
              this.setUpperBandAndLowerBand(data)
              return
            }

            if (data[Val.high] >= this.marketObject.UB) {
              //Cancel Buy order and place Sell order
              this.marketObject.comments.push(`UB SELL cancelled ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.checkToPlaceOrder(data);
              // this.marketObject.priceToTrade = this.marketObject.low - 1;
              // this.marketObject.orderSide = 'SELL';
              // this.marketObject.status = Order.pendingSell;
            }

            //cancel Buy order 
            // new Low or Low crossed existing lower band


          } else {
            debugger
            //TGT BUY logic goes here
            if (data[Val.low] <= this.marketObject.priceToTrade) {
              this.marketObject.comments.push(`Sell exe at ${this.marketObject.priceToTrade} , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.marketObject.status = Order.liveSell;
              this.marketObject.isFirstTrade = false;

              if (data[Val.low] <= this.marketObject.low) {
                this.marketObject.allLow = data[Val.low];
              }
              if (data[Val.low] <= this.marketObject.target) {
                if (data[Val.low] <= this.marketObject.low)
                  this.marketObject.low = data[Val.low];
                this.marketObject.comments.push(`TGT Reached, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.checkToPlaceOrder(data);
              }
            }

            if (data[Val.high] >= this.marketObject.stopLoss) {

              this.marketObject.comments.push(`Sell stoploss reached cancelled , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
              this.checkToPlaceOrder(data);

            }

          }
          break;
        }
        case 4: {
          //Buy live
          //Normal Trade
          if (this.marketObject.target == 0) {
            //New high reverse UB and LB
            if (data[Val.high] > this.marketObject.high) {
              this.marketObject.high = data[Val.high];
              this.marketObject.allHigh = data[Val.high]
              this.setUpperBandAndLowerBand(data)
            }
            //Reached LB place Sell Order
            if (data[Val.low] < this.marketObject.LB) {
              //Cancel Buy order 
              this.checkToPlaceOrder(data, true);
              //Repeat case 1
            }
          } else {
            //TGT Trade
            //Target reached update UB and LB
            if (data[Val.high] >= this.marketObject.target) {
              this.marketObject.high = data[Val.high];
              this.setUpperBandAndLowerBand(data);
              this.marketObject.target = 0;
              this.marketObject.stopLoss = 0;
              this.marketObject.comments.push('Reached Target TGt order changed to normal order')
            }
            if (data[Val.low] <= this.marketObject.low) {
              this.marketObject.low = data[Val.low];
              this.marketObject.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);

            }

            //Stoploss reached place Sell Order
            if ((data[Val.low] <= this.marketObject.stopLoss && !this.marketObject.slOrderPlaced) || (data[Val.low] <= this.marketObject.slPriceToTrade && this.marketObject.slOrderPlaced)) {
              if (this.marketObject.slOrderPlaced && this.marketObject.slOrderStatus == Order.pendingSell && data[Val.low] <= this.marketObject.slPriceToTrade) {
                debugger
                this.marketObject.comments.push(`Stop Loss sell order exe at: ${this.marketObject.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.marketObject.slOrderPlaced = false;
                this.marketObject.priceToTrade = this.marketObject.slPriceToTrade;
                this.marketObject.stopLoss = 0;
                this.marketObject.target = 0;
                this.marketObject.status = Order.liveSell;
                this.marketObject.slOrderStatus = Order.nill;
                this.marketObject.slPriceToTrade = 0;
                this.checkToPlaceOrder(data, true);
              } else {
                this.marketObject.slOrderPlaced = true;
                this.marketObject.slPriceToTrade = data[Val.low] - 1;
                this.marketObject.slOrderStatus = Order.pendingSell;
                this.marketObject.comments.push(`Stop Loss reached placed sell order at: ${this.marketObject.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                // this.marketObject.target = 0
                // this.marketObject.stopLoss = 0
                // this.marketObject.priceToTrade = data[Val.low] - 1
                // this.marketObject.status = Order.pendingSell
                this.checkToPlaceOrder(data, true);
                // this.marketObject.comments.push(`Stop Loss reached placed sell order at: ${this.marketObject.priceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              }


            }
          }


          break
        }
        case 5: {
          //Sell live
          //Normal Trade
          if (this.marketObject.target == 0) {
            //New Low reverse UB and LB
            if (data[Val.low] < this.marketObject.low) {
              this.marketObject.low = data[Val.low];
              this.marketObject.allLow = data[Val.low]
              this.setUpperBandAndLowerBand(data)
            }
            //Reached UB place BUY Order
            if (data[Val.high] >= this.marketObject.UB) {
              //Cancel Buy order 
              this.checkToPlaceOrder(data, true);
              //Repeat case 1
            }
          } else {
            debugger
            //TGT Trade
            //Target reached update UB and LB
            //Stoploss reached place buy Order
            //TGT Trade
            //Target reached update UB and LB
            if (data[Val.low] <= this.marketObject.target) {
              this.marketObject.low = data[Val.low];
              this.setUpperBandAndLowerBand(data);
              this.marketObject.target = 0;
              this.marketObject.stopLoss = 0;
              this.marketObject.comments.push('Reached Target TGt order changed to normal order')
            }
            //Stoploss reached place Sell Order

            if (data[Val.low] <= this.marketObject.low) {
              this.marketObject.low = data[Val.low];
              this.marketObject.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);

            }
            if ((data[Val.high] >= this.marketObject.stopLoss && !this.marketObject.slOrderPlaced) || (data[Val.high] >= this.marketObject.slPriceToTrade && this.marketObject.slOrderPlaced)) {

              if (this.marketObject.slOrderPlaced && this.marketObject.slOrderStatus == Order.pendingBUY && data[Val.high] >= this.marketObject.slPriceToTrade) {
                debugger
                this.marketObject.comments.push(`Stop Loss Buy order exe at: ${this.marketObject.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.marketObject.slOrderPlaced = false;
                this.marketObject.priceToTrade = this.marketObject.slPriceToTrade;
                this.marketObject.stopLoss = 0;
                this.marketObject.target = 0;
                this.marketObject.status = Order.liveBuy;
                this.marketObject.slOrderStatus = Order.nill;
                this.marketObject.slPriceToTrade = 0;
                this.checkToPlaceOrder(data, true);
              } else {
                this.marketObject.slOrderPlaced = true;
                this.marketObject.slPriceToTrade = data[Val.high] + 1;
                this.marketObject.slOrderStatus = Order.pendingBUY;
                this.marketObject.comments.push(`Stop Loss reached placed Buy order at: ${this.marketObject.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                // this.marketObject.target = 0
                // this.marketObject.stopLoss = 0
                // this.marketObject.priceToTrade = data[Val.low] - 1
                // this.marketObject.status = Order.pendingSell
                this.checkToPlaceOrder(data, true);
                // this.marketObject.comments.push(`Stop Loss reached placed sell order at: ${this.marketObject.priceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              }
            }
          }
          break
        }
      }

      // if(data[Val.high] >= )
      // console.log(index);
    })
    console.log(this.marketObject)
  }




  //Check to place Order
  checkToPlaceOrder(data: any, slOrder?: boolean) {
    //Initial order excution
    if (data[Val.high] >= this.marketObject.high) {
      this.marketObject.high = data[Val.high];
      this.marketObject.allHigh = data[Val.high];
      this.setUpperBandAndLowerBand(data)
    }
    //tract tgt order stop loss
    // if (data[Val.high] >= this.marketObject.stopLoss && slOrder) {
    //   this.marketObject.comments.push(`UB Buy order placed at ${data[Val.high] + 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
    //   this.marketObject.status = Order.completed;
    //   this.setPreviousOrder();
    // }
    if (data[Val.high] >= this.marketObject.UB) {
      //Handle SL Order here
      if (slOrder) {
        this.marketObject.comments.push(`UB Buy order placed at ${data[Val.high] + 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
        this.marketObject.status = Order.completed;
        this.setPreviousOrder();
      }
      ////////////
      if (data[Val.high] < this.marketObject.high) {
        this.setTargetFunction('BUY')
      }
      this.marketObject.status = Order.pendingBUY
      this.marketObject.priceToTrade = this.customParseFloat(data[Val.high] + 1);
      if (this.marketObject.target) this.marketObject.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1} Target at ${this.marketObject.target}, Stoploss:${this.marketObject.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);

      else this.marketObject.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

      console.log(`Crossed UB Buy Order placed at ${data[Val.high] + 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
      return
    }
    if (data[Val.low] <= this.marketObject.low) {
      this.marketObject.low = data[Val.low];
      this.marketObject.allLow = data[Val.low];
      this.setUpperBandAndLowerBand(data)
    }
    //Stop loss track for tgt orders
    // if (data[Val.low] <= this.marketObject.stopLoss && slOrder) {
    //   this.marketObject.comments.push(`Stop Loss Sell order placed at ${data[Val.low] - 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
    //   this.marketObject.slOrderPlaced = true;
    //   this.marketObject.slOrderStatus = Order.pendingSell
    //   // this.marketObject.status = Order.completed;
    //   this.setPreviousOrder();
    // }
    if (data[Val.low] <= this.marketObject.LB) {
      //Handle SL Order here
      if (slOrder) {
        this.marketObject.comments.push(`LB Sell order placed at ${data[Val.low] - 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

        this.marketObject.status = Order.completed;
        this.setPreviousOrder();
      }
      ////////////
      if (data[Val.low] > this.marketObject.low) {
        this.setTargetFunction('SELL')
      }


      if (this.marketObject.target) this.marketObject.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1} Target at ${this.marketObject.target}, Stoploss:${this.marketObject.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);

      else this.marketObject.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

      this.marketObject.priceToTrade = this.customParseFloat(data[Val.low] - 1);
      this.marketObject.status = Order.pendingSell
      console.log(`Crossed LB SELL Order placed at ${data[Val.low] - 1}`);
      return
    }
  }

  //reset Stoploss order
  resetStopLossOrder() {
    this.marketObject.slOrderPlaced = false;
    this.marketObject.slPriceToTrade = 0;
    this.marketObject.slOrderStatus = Order.nill;

  }
  //Set PreviousOrder Status
  setPreviousOrder() {
    this.marketObject.previuosOrder = { ...this.marketObject };
  }
  //set Target function
  setTargetFunction(type: string) {
    if (type == "BUY") {
      let dif: number = this.marketObject.open - this.marketObject.allLow;
      this.marketObject.target = this.marketObject.open + dif;
      this.marketObject.stopLoss = this.marketObject.allLow;
    } else if (type == "SELL") {
      let dif: number = this.marketObject.allHigh - this.marketObject.open;
      this.marketObject.target = this.marketObject.open - dif;
      this.marketObject.stopLoss = this.marketObject.allHigh;
    }

  }

  //Find upper and Lower Band
  setUpperBandAndLowerBand(data: any) {
    let diff = data[Val.high] - data[Val.low];
    let UB = this.customParseFloat(data[Val.high] + diff);
    let LB = this.customParseFloat(data[Val.low] - diff);
    if (this.marketObject.isFirstTrade) {
      if (!this.marketObject.UB || this.marketObject.UB >= UB) this.marketObject.UB = UB;
      //18264 < 18275
      if (!this.marketObject.LB || LB >= this.marketObject.LB) this.marketObject.LB = LB;
    } else {
      this.marketObject.UB = UB;
      this.marketObject.LB = LB;
    }

  }
  //Helper functions//////////////
  //Get status
  getStatus(num: number) {
    //   nill = 1,
    // pendingBUY = 2,
    // pendingSell = 3,
    // liveBuy = 4,
    // liveSell = 5,
    // completed = 6,
    switch (num) {
      case 1:
        return 'Not Started';
      case 2:
        return "Buy order placed";
      case 3:
        return "Sell order placed";
      case 4:
        return "Buy Order Live";
      case 5:
        return "Sell Order Live";
      case 6:
        return "Order completed";
      default: return 'Null'
    }

  }
  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
  //
}
