import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiDayComponent } from './multi-day/multi-day.component';
import { TradeAutomationComponent } from './trade-automation/trade-automation.component';

const routes: Routes = [
  {path:'', redirectTo: 'home' , pathMatch: 'full'},
  {path:'home', component: TradeAutomationComponent},
  {path:'Muti-day', component: MultiDayComponent},
  // {path:'per-day', component: TestingPerDayComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
