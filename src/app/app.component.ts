import { Component, OnInit } from '@angular/core';

import { DataService } from './data.service';

interface MartketData {
  high: number,
  low: number,
  open: number,
  UB: number,
  LB: number,
  orderOpen: boolean,
  orderSide: string,
  target: number,
  stopLoss: number,
  priceToTrade: number,
  trades: [],
  status: number,
  isFirstTrade: boolean,
  comments: string[]
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
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kanna-statergyAngular';
  marketObject: MartketData = {
    high: 0, low: 0, open: 0, UB: 0, LB: 0, orderOpen: false, orderSide: '', target: 0, stopLoss: 0, priceToTrade: 0, trades: [], status: Order.nill, isFirstTrade: true,comments:[]
  };
  trades = [];
  constructor(private datas: DataService) { }
  ngOnInit(): void {
    this.mainFunction()
  }
  mainFunction() {
    this.datas.datas.forEach((data, index) => {
      if (index == 0) {
        this.marketObject.open = data[Val.open];
        this.marketObject.high = data[Val.high];
        this.marketObject.low = data[Val.low];
        this.setUpperBandAndLowerBand(data)
        return;
      }

      // if(this.marketObject.orderOpen){
      //   if(this.marketObject.orderSide == 'BUY'){
      //     if(this.marketObject.orderType == 'TGT'){

      //     }else if(this.marketObject.orderType == 'Normal'){

      //     }
      //   }else if(this.marketObject.orderSide == "SELL"){
      //     if(this.marketObject.orderType == 'TGT'){
      //       if(data[Val.low] <= this.marketObject.priceToTrade){
      //         let order = {side: 'SELL',type: 'TGT', sellPrice:this.marketObject.priceToTrade,stopLoss: this.marketObject.stopLoss,
      //                       target: this.marketObject.target}
      //         this.marketObject.orderOpen = false;              
      //       }
      //     }else if(this.marketObject.orderType == 'Normal'){

      //     }
      //   }
      // }

      switch (this.marketObject.status) {
        case 1: {
          this.checkToPlaceOrder(data);
          break;
        }
        case 2: {
          if (this.marketObject.target == 0) {
            //Normal Buy goes here

            if (data[Val.high] >= this.marketObject.priceToTrade) {
              //Trade executed logic goes here
              if (data[Val.high] > this.marketObject.high) {
                this.marketObject.high = data[Val.high];
              }
              this.marketObject.status = Order.liveBuy;
              this.marketObject.isFirstTrade = false;
              this.setUpperBandAndLowerBand(data)
              return
            }

            if (data[Val.low] <= this.marketObject.LB) {
              //Cancel Buy order and place Sell order
              this.marketObject.comments.push(`LB Buy cancelled`)
              this.checkToPlaceOrder(data);
              // this.marketObject.priceToTrade = this.marketObject.low - 1;
              // this.marketObject.orderSide = 'SELL';
              // this.marketObject.status = Order.pendingSell;
            }

            //cancel Buy order 
            // new Low or Low crossed existing lower band


          } else {
            //TGT BUY logic goes here
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
          //normal order 
          // update new UB and LB and check Track SL 
          // SL May hit and repeat case 1 by reset high,low,UB,LB
          //TGT Order
          // TGT reached and trake new UB ,LB,High,LOw
          // May reach SL and repeat case 1  
        }
      }

      // if(data[Val.high] >= )
      // console.log(index);
    })
    console.log(this.marketObject)
  }




  //Check to place Order
  checkToPlaceOrder(data: any) {
    //Initial order excution
    if (data[Val.high] >= this.marketObject.high) {
      this.marketObject.high = data[Val.high];
      this.setUpperBandAndLowerBand(data)
    }
    if (data[Val.high] >= this.marketObject.UB) {
      this.marketObject.orderOpen = true;
      if (data[Val.high] < this.marketObject.high) {
        this.setTargetFunction('BUY')
      }
      this.marketObject.orderSide = "BUY";
      this.marketObject.status = Order.pendingBUY
      this.marketObject.priceToTrade = this.customParseFloat(data[Val.high] + 1);
      if(this.marketObject.target) this.marketObject.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1} Target at ${this.marketObject.target}, Stoploss:${this.marketObject.stopLoss}`);
      else this.marketObject.comments.push(`Crossed UB Buy Order placed at ${data[Val.high] + 1}`)
      console.log(`Crossed UB Buy Order placed at ${data[Val.high] + 1}`);
      return
    }
    if (data[Val.low] <= this.marketObject.low) {
      this.marketObject.low = data[Val.low];
      this.setUpperBandAndLowerBand(data)
    }
    if (data[Val.low] <= this.marketObject.LB) {
      this.marketObject.orderOpen = true;
      if (data[Val.low] > this.marketObject.low) {
        this.setTargetFunction('SELL')
      }
      this.marketObject.orderSide = "SELL"
      this.marketObject.priceToTrade = this.customParseFloat(data[Val.low] - 1);
      this.marketObject.status = Order.pendingSell
      console.log(`Crossed LB SELL Order placed at ${data[Val.low] - 1}`);
      return
    }
  }
  //set Target function
  setTargetFunction(type: string) {
    if (type == "BUY") {
      let dif: number = this.marketObject.open - this.marketObject.low;
      this.marketObject.target = this.marketObject.open + dif;
      this.marketObject.stopLoss = this.marketObject.low;
    } else if (type == "SELL") {
      let dif: number = this.marketObject.high - this.marketObject.open;
      this.marketObject.target = this.marketObject.open - dif;
      this.marketObject.stopLoss = this.marketObject.high;
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
  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
}
