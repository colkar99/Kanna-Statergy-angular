import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YearlyCheckBaseComponent } from './yearly-check-base.component';

describe('YearlyCheckBaseComponent', () => {
  let component: YearlyCheckBaseComponent;
  let fixture: ComponentFixture<YearlyCheckBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YearlyCheckBaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YearlyCheckBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
