import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiDayComponent } from './multi-day/multi-day.component';
import { ReduceTradeCountComponent } from './reduce-trade-count/reduce-trade-count.component';
import { TradeAutomationComponent } from './trade-automation/trade-automation.component';
import { YearlyCheckBaseComponent } from './yearly-check-base/yearly-check-base.component';
import { KiteSuccessLoginPageComponent } from './kite-success-login-page/kite-success-login-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: TradeAutomationComponent },
  { path: 'Muti-day', component: MultiDayComponent },
  { path: 'reduce-count', component: ReduceTradeCountComponent },
  { path: 'Yearly-Check', component: YearlyCheckBaseComponent },
  { path: 'kite-success-login', component: KiteSuccessLoginPageComponent }



];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
