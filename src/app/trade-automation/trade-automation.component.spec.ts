import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeAutomationComponent } from './trade-automation.component';

describe('TradeAutomationComponent', () => {
  let component: TradeAutomationComponent;
  let fixture: ComponentFixture<TradeAutomationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeAutomationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeAutomationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
