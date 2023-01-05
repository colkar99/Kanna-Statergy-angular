import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDayBaseComponent } from './multi-day-base.component';

describe('MultiDayBaseComponent', () => {
  let component: MultiDayBaseComponent;
  let fixture: ComponentFixture<MultiDayBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDayBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDayBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
