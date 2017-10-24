import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignUpFailureComponent } from './sign-up-failure.component';

describe('SignUpFailureComponent', () => {
  let component: SignUpFailureComponent;
  let fixture: ComponentFixture<SignUpFailureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignUpFailureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpFailureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
