import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

enum Val {
  open = 1,
  high = 2,
  low = 3,
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Kanna-statergyAngular';
  marketObject: { high: number, low: number, open: number, UB: number | null, LB: number | null, leaseUB: number, leaseLB: number } = {
    high: 0, low: 0, open: 0, UB: null, LB: null, leaseUB: 0, leaseLB: 0
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

      if (data[Val.high] > this.marketObject.high) {

        this.setUpperBandAndLowerBand(data, "NEWHIGH")
      }
      if (data[Val.low] < this.marketObject.low) {
        this.setUpperBandAndLowerBand(data, "NEWLOW")
      }
      // if(data[Val.high] >= )
      // console.log(index);
    })
    console.log(this.marketObject)
  }


  //Find upper and Lower Band
  setUpperBandAndLowerBand(data: any, type?: string) {
    debugger
    if (type == "NEWHIGH") {
      this.marketObject.high = data[Val.high];
    }
    if (type == "NEWLOW") {
      this.marketObject.low = data[Val.low];
    }
    let diff = data[Val.high] - data[Val.low];
    this.marketObject.UB = this.customParseFloat(data[Val.high] + diff);
    this.marketObject.LB = this.customParseFloat(data[Val.low] - diff);

    if (this.marketObject.leaseLB == 0 && this.marketObject.leaseUB == 0) {
      this.marketObject.leaseLB = this.marketObject.LB;
      this.marketObject.leaseUB = this.marketObject.UB;
    }
    //200 < 0
    if (this.marketObject.UB < this.marketObject.leaseUB) {
      console.log("Hi")
      this.marketObject.leaseUB = this.marketObject.UB;
    }
    //18468 > 18501 
    if (this.marketObject.leaseLB > this.marketObject.LB) {
      this.marketObject.leaseLB = this.marketObject.LB;
    }

  }
  //Convert num to decimal with single
  customParseFloat(value: number) {
    return parseFloat(value.toFixed(2))
  }
}
