import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDayComponent } from './multi-day.component';

describe('MultiDayComponent', () => {
  let component: MultiDayComponent;
  let fixture: ComponentFixture<MultiDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
