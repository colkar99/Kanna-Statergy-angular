import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { ReduceCountService } from './reduce-trade-count/reduce.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // perTradeCost: number = 120;


  constructor(public datas: DataService, public reduceService: ReduceCountService) {
    this.datas.pertTradeCost = 120;
    this.datas.lotsize = 50;
    this.reduceService.pertTradeCost = 120;
    this.reduceService.lotsize = 50;
  }
  ngOnInit(): void {
    // this.setDatas()
  }


}
