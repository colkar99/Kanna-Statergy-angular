import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http'
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TradeAutomationComponent } from './trade-automation/trade-automation.component';
import { MultiDayComponent } from './multi-day/multi-day.component';
import { MultiDayBaseComponent } from './multi-day/multi-day-base/multi-day-base.component';

@NgModule({
  declarations: [
    AppComponent,
    TradeAutomationComponent,
    MultiDayComponent,
    MultiDayBaseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
