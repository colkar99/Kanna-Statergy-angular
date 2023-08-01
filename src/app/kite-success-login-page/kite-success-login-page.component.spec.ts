import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KiteSuccessLoginPageComponent } from './kite-success-login-page.component';

describe('KiteSuccessLoginPageComponent', () => {
  let component: KiteSuccessLoginPageComponent;
  let fixture: ComponentFixture<KiteSuccessLoginPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KiteSuccessLoginPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KiteSuccessLoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
