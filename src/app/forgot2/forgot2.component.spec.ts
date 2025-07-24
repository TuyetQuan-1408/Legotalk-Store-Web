import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forgot2Component } from './forgot2.component';

describe('Forgot2Component', () => {
  let component: Forgot2Component;
  let fixture: ComponentFixture<Forgot2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forgot2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Forgot2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
