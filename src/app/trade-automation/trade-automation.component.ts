import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../api-service.service';

@Component({
  selector: 'app-trade-automation',
  templateUrl: './trade-automation.component.html',
  styleUrls: ['./trade-automation.component.css']
})
export class TradeAutomationComponent implements OnInit {
  reached: boolean = false;
  constructor(public apiService: ApiServiceService) {
    this.apiService.getEvery5MinsData().subscribe((data) =>{
      console.log(data);
    })
    setInterval(() => {
      let date = new Date();
      if(date.getMinutes() % 5 != 0) this.reached = false;
      if (date.getMinutes() % 5 == 0 && !this.reached ) {
        this.reached  = true
        alert(date.getMinutes() + " Minutes");
        this.apiService.getEvery5MinsData().subscribe((data) =>{
          console.log(data);
        })
      }
    }, 1000)
  }

  ngOnInit(): void {
  }

}
