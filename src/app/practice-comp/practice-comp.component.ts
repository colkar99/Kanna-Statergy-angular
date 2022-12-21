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
  selector: 'app-practice-comp',
  templateUrl: './practice-comp.component.html',
  styleUrls: ['./practice-comp.component.css']
})
export class PracticeCompComponent implements OnInit {

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
      let endTime = `${new Date(data[0]).getHours()}${new Date(data[0]).getMinutes()}`;
      if (endTime == '1515') {
        let closePrice = data[Val.open];

        if (this.MB.status == Order.liveBuy) {
          this.MB.comments.push(`TimeEnd Sell exe at open price ${closePrice}`)

        } else if (this.MB.status == Order.liveSell) {
          this.MB.comments.push(`TimeEnd Buy exe at open price ${closePrice}`)
        } else {
          this.MB.comments.push(`Cancell all the pending orders and close the trade`)
        }
        this.MB.status = Order.completed;
        this.MB.target = 0;
        this.MB.stopLoss = 0;
        this.MB.priceToTrade = 0;
        this.MB.slOrderPlaced = false;
        this.MB.slPriceToTrade = 0;
        this.MB.slOrderStatus = Order.cancelled
      }


      switch (this.MB.status) {
        case 1: {
          //No Trade
          this.checkToPlaceOrder(data);
          break;
        }
        case 2: {
          //Buy placed
          if (this.MB.target == 0) {
            //Normal Buy goes here

            if (data[Val.high] >= this.MB.priceToTrade) {
              //Trade executed logic goes here
              this.MB.comments.push(`Buy exe at ${this.MB.priceToTrade}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

              if (data[Val.high] > this.MB.high) {
                this.MB.high = data[Val.high];
                this.MB.allHigh = data[Val.high]
              }
              this.MB.status = Order.liveBuy;
              this.MB.isFirstTrade = false;
              this.setUpperBandAndLowerBand(data)
              return
            }

            if (data[Val.low] <= this.MB.LB) {
              //Cancel Buy order and place Sell order
              this.MB.comments.push(`LB Buy cancelled ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.checkToPlaceOrder(data);
              // this.MB.priceToTrade = this.MB.low - 1;
              // this.MB.orderSide = 'SELL';
              // this.MB.status = Order.pendingSell;
            }

            //cancel Buy order 
            // new Low or Low crossed existing lower band


          } else {
            //TGT BUY logic goes here
            if (data[Val.high] >= this.MB.priceToTrade) {
              this.MB.comments.push(`Buy exe at ${this.MB.priceToTrade} ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.MB.status = Order.liveBuy;
              this.MB.isFirstTrade = false;
              if (data[Val.high] >= this.MB.high) this.MB.allHigh = data[Val.high];

              if (data[Val.high] >= this.MB.target) {
                this.MB.high = data[Val.high];
                this.MB.comments.push(`TGT Reached , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.checkToPlaceOrder(data);
              }
            }

            if (data[Val.low] <= this.MB.stopLoss) {

              this.MB.comments.push(`Buy TGT SL reached cancelled , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
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
          if (this.MB.target == 0) {
            //Normal Buy goes here
            //44  45
            if (data[Val.low] <= this.MB.priceToTrade) {
              //Trade executed logic goes here
              this.MB.comments.push(`Sell exe at ${this.MB.priceToTrade}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

              if (data[Val.low] < this.MB.low) {
                this.MB.comments.push(`New Low  ${data[Val.low]}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                this.MB.low = data[Val.low];
                this.MB.allLow = data[Val.low]
              }
              this.MB.status = Order.liveSell;
              this.MB.isFirstTrade = false;
              this.setUpperBandAndLowerBand(data)
              return
            }

            if (data[Val.high] >= this.MB.UB) {
              //Cancel Buy order and place Sell order
              this.MB.comments.push(`UB SELL cancelled ,Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.checkToPlaceOrder(data);
              // this.MB.priceToTrade = this.MB.low - 1;
              // this.MB.orderSide = 'SELL';
              // this.MB.status = Order.pendingSell;
            }

            //cancel Buy order 
            // new Low or Low crossed existing lower band


          } else {
            //TGT BUY logic goes here
            // if((this.MB.slOrderPlaced && this.MB.slOrderStatus == Order.pendingSell)){
            //   //Stop loss sell order logic goes here
            //   if(data[Val.low] <= this.MB.slPriceToTrade){
            //     alert("SL Sell order executed")
            //   }
            // }
            if (data[Val.low] <= this.MB.priceToTrade) {
              this.MB.comments.push(`Sell exe at ${this.MB.priceToTrade} , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              this.MB.status = Order.liveSell;
              this.MB.isFirstTrade = false;

              if (data[Val.low] <= this.MB.low) {
                this.MB.allLow = data[Val.low];
              }
              if (data[Val.low] <= this.MB.target) {
                if (data[Val.low] <= this.MB.low)
                  this.MB.low = data[Val.low];
                this.MB.comments.push(`TGT Reached, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.checkToPlaceOrder(data);
              }
            }

            if (data[Val.high] >= this.MB.stopLoss) {

              this.MB.comments.push(`Sell stoploss reached cancelled , Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
              this.checkToPlaceOrder(data);

            }

          }
          break;
        }
        case 4: {
          //Buy live
          //Normal Trade
          debugger
     
          if (this.MB.target == 0) {

              //Reached LB place Sell Order
            if (data[Val.low] < this.MB.LB) {
              //Cancel Buy order 
              this.MB.slOrderPlaced = true;
              this.MB.slOrderStatus = Order.pendingSell;
              this.MB.slPriceToTrade = data[Val.low] - 1;
              this.MB.comments.push(`LB Reached SL sell order Placed ${data[Val.low] - 1}`);
              if(data[Val.low] < this.MB.LB) this.setTargetFunction('SELL')
              this.checkToPlaceOrder(data, true);

              //Repeat case 1
            }
            //New high reverse UB and LB
            if (data[Val.high] > this.MB.high) {
              this.MB.high = data[Val.high];
              this.MB.allHigh = data[Val.high]
              this.setUpperBandAndLowerBand(data)
            }
          
          } else {
            //TGT Trade
            //Target reached update UB and LB
            if (data[Val.high] >= this.MB.target) {
              this.MB.high = data[Val.high];
              this.setUpperBandAndLowerBand(data);
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push('Reached Target TGt order changed to normal order')
            }
            if (data[Val.low] <= this.MB.low) {
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);

            }

            //Stoploss reached place Sell Order
            if ((data[Val.low] <= this.MB.stopLoss && !this.MB.slOrderPlaced) || (data[Val.low] <= this.MB.slPriceToTrade && this.MB.slOrderPlaced)) {
              if (this.MB.slOrderPlaced && this.MB.slOrderStatus == Order.pendingSell && data[Val.low] <= this.MB.slPriceToTrade) {
                debugger
                this.MB.comments.push(`Stop Loss sell order exe at: ${this.MB.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.MB.slOrderPlaced = false;
                this.MB.priceToTrade = this.MB.slPriceToTrade;
                this.MB.stopLoss = 0;
                this.MB.target = 0;
                this.MB.status = Order.liveSell;
                this.MB.slOrderStatus = Order.nill;
                this.MB.slPriceToTrade = 0;
                this.checkToPlaceOrder(data, true);
              } else {
                this.MB.slOrderPlaced = true;
                this.MB.slPriceToTrade = data[Val.low] - 1;
                this.MB.slOrderStatus = Order.pendingSell;
                this.MB.comments.push(`Stop Loss reached placed sell order at: ${this.MB.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                // this.MB.target = 0
                // this.MB.stopLoss = 0
                // this.MB.priceToTrade = data[Val.low] - 1
                // this.MB.status = Order.pendingSell
                this.checkToPlaceOrder(data, true);
                // this.MB.comments.push(`Stop Loss reached placed sell order at: ${this.MB.priceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              }


            }
          }


          break
        }
        case 5: {
          //Sell live
          //Normal Trade
          if (this.MB.target == 0) {
            //New Low reverse UB and LB
            if (data[Val.low] < this.MB.low) {
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low]
              this.setUpperBandAndLowerBand(data)
            }
            //Reached UB place BUY Order
            if (data[Val.high] >= this.MB.UB) {
              //Cancel Buy order 
                //Cancel Buy order 
                this.MB.slOrderPlaced = true;
                this.MB.slOrderStatus = Order.pendingBUY;
                this.MB.slPriceToTrade = data[Val.high] + 1;
                this.MB.comments.push(`UB Reached SL BUY order Placed ${ data[Val.high] + 1}`);
                if(data[Val.high] < this.MB.UB) this.setTargetFunction('BUY')
                this.checkToPlaceOrder(data, true);
  
                //Repeat case 1
              this.checkToPlaceOrder(data, true);
              //Repeat case 1
            }
          } else {
            //TGT Trade
            //Target reached update UB and LB
            //Stoploss reached place buy Order
            //TGT Trade
            //Target reached update UB and LB
            if (data[Val.low] <= this.MB.target) {
              this.MB.low = data[Val.low];
              this.setUpperBandAndLowerBand(data);
              this.MB.target = 0;
              this.MB.stopLoss = 0;
              this.MB.comments.push('Reached Target TGt order changed to normal order')
            }
            //Stoploss reached place Sell Order

            if (data[Val.low] <= this.MB.low) {
              this.MB.low = data[Val.low];
              this.MB.allLow = data[Val.low];
              this.setUpperBandAndLowerBand(data);

            }
            if ((data[Val.high] >= this.MB.stopLoss && !this.MB.slOrderPlaced) || (data[Val.high] >= this.MB.slPriceToTrade && this.MB.slOrderPlaced)) {

              if (this.MB.slOrderPlaced && this.MB.slOrderStatus == Order.pendingBUY && data[Val.high] >= this.MB.slPriceToTrade) {
                this.MB.comments.push(`Stop Loss Buy order exe at: ${this.MB.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
                this.MB.slOrderPlaced = false;
                this.MB.priceToTrade = this.MB.slPriceToTrade;
                this.MB.stopLoss = 0;
                this.MB.target = 0;
                this.MB.status = Order.liveBuy;
                this.MB.slOrderStatus = Order.nill;
                this.MB.slPriceToTrade = 0;
                this.checkToPlaceOrder(data, true);
              } else {
                this.MB.slOrderPlaced = true;
                this.MB.slPriceToTrade = data[Val.high] + 1;
                this.MB.slOrderStatus = Order.pendingBUY;
                this.MB.comments.push(`Stop Loss reached placed Buy order at: ${this.MB.slPriceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

                // this.MB.target = 0
                // this.MB.stopLoss = 0
                // this.MB.priceToTrade = data[Val.low] - 1
                // this.MB.status = Order.pendingSell
                this.checkToPlaceOrder(data, true);
                // this.MB.comments.push(`Stop Loss reached placed sell order at: ${this.MB.priceToTrade} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
              }
            }
          }
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
    debugger
    if (data[Val.high] >= this.MB.high) {
      this.MB.high = data[Val.high];
      this.MB.allHigh = data[Val.high];
      this.setUpperBandAndLowerBand(data)
    }
    //tract tgt order stop loss
    // if (data[Val.high] >= this.MB.stopLoss && slOrder) {
    //   this.MB.comments.push(`UB Buy order placed at ${data[Val.high] + 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
    //   this.MB.status = Order.completed;
    //   this.setPreviousOrder();
    // }
    if (data[Val.high] >= this.MB.UB) {
      //Handle SL Order here
      if (slOrder) {
        this.MB.comments.push(`UB Buy order placed at ${data[Val.high] + 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
        this.MB.status = Order.completed;
        this.setPreviousOrder();
      }
      ////////////
      if (data[Val.high] < this.MB.high) {
        this.setTargetFunction('BUY')
      }
      this.MB.status = Order.pendingBUY
      this.MB.priceToTrade = this.customParseFloat(data[Val.high] + 1);
      if (this.MB.target) this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);

      else this.MB.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

      console.log(`Crossed UB Buy Order placed at ${data[Val.high] + 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);
      return
    }
    if (data[Val.low] <= this.MB.low) {
      this.MB.low = data[Val.low];
      this.MB.allLow = data[Val.low];
      this.setUpperBandAndLowerBand(data)
    }
    //Stop loss track for tgt orders
    // if (data[Val.low] <= this.MB.stopLoss && slOrder) {
    //   this.MB.comments.push(`Stop Loss Sell order placed at ${data[Val.low] - 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)
    //   this.MB.slOrderPlaced = true;
    //   this.MB.slOrderStatus = Order.pendingSell
    //   // this.MB.status = Order.completed;
    //   this.setPreviousOrder();
    // }
    if (data[Val.low] <= this.MB.LB) {
      //Handle SL Order here
      if (slOrder) {
        this.MB.comments.push(`LB Sell order placed at ${data[Val.low] - 1} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

        this.MB.status = Order.completed;
        this.setPreviousOrder();
      }
      ////////////
      if (data[Val.low] > this.MB.low) {
        this.setTargetFunction('SELL')
      }


      if (this.MB.target) this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1} Target at ${this.MB.target}, Stoploss:${this.MB.stopLoss} Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`);

      else this.MB.comments.push(`Crossed LB Sell Order placed at ${data[Val.low] - 1}, Time:${new Date(data[0]).getHours()}:${new Date(data[0]).getMinutes()}`)

      this.MB.priceToTrade = this.customParseFloat(data[Val.low] - 1);
      this.MB.status = Order.pendingSell
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
