import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyCheckMainComponent } from './yearly-check-main.component';

describe('YearlyCheckMainComponent', () => {
  let component: YearlyCheckMainComponent;
  let fixture: ComponentFixture<YearlyCheckMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YearlyCheckMainComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YearlyCheckMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
