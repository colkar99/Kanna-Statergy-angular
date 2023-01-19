import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TradeAutomationComponent } from './trade-automation/trade-automation.component';
import { MultiDayComponent } from './multi-day/multi-day.component';
import { MultiDayBaseComponent } from './multi-day/multi-day-base/multi-day-base.component';
import { ReduceTradeCountComponent } from './reduce-trade-count/reduce-trade-count.component';
import { ReduceTradeBaseComponent } from './reduce-trade-count/reduce-trade-base.component/reduce-trade-base.component';
import { YearlyCheckBaseComponent } from './yearly-check-base/yearly-check-base.component';
import { YearlyCheckMainComponent } from './yearly-check-base/yearly-check-main/yearly-check-main.component'
@NgModule({
  declarations: [
    AppComponent,
    TradeAutomationComponent,
    MultiDayComponent,
    MultiDayBaseComponent,
    ReduceTradeCountComponent,
    ReduceTradeBaseComponent,
    YearlyCheckBaseComponent,
    YearlyCheckMainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
