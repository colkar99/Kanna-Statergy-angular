import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeCompComponent } from './practice-comp.component';

describe('PracticeCompComponent', () => {
  let component: PracticeCompComponent;
  let fixture: ComponentFixture<PracticeCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PracticeCompComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
