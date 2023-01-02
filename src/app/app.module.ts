import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PracticeCompComponent } from './practice-comp/practice-comp.component';
import { TestingPerDayComponent } from './testing-per-day/testing-per-day.component';
import { TradeAutomationComponent } from './trade-automation/trade-automation.component';

@NgModule({
  declarations: [
    AppComponent,
    PracticeCompComponent,
    TestingPerDayComponent,
    TradeAutomationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
