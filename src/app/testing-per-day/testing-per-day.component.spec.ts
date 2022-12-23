import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingPerDayComponent } from './testing-per-day.component';

describe('TestingPerDayComponent', () => {
  let component: TestingPerDayComponent;
  let fixture: ComponentFixture<TestingPerDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingPerDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestingPerDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
