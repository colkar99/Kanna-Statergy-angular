import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PracticeCompComponent } from './practice-comp/practice-comp.component';
import { TestingPerDayComponent } from './testing-per-day/testing-per-day.component';

@NgModule({
  declarations: [
    AppComponent,
    PracticeCompComponent,
    TestingPerDayComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
