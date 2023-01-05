import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // perTradeCost: number = 120;

  
  constructor(public datas: DataService) {
    this.datas.pertTradeCost = 120;
    this.datas.lotsize = 50;
  }
  ngOnInit(): void {
    // this.setDatas()
  }

 
}
