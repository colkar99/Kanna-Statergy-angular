import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReduceTradeCountComponent } from './reduce-trade-count.component';

describe('ReduceTradeCountComponent', () => {
  let component: ReduceTradeCountComponent;
  let fixture: ComponentFixture<ReduceTradeCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReduceTradeCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReduceTradeCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
