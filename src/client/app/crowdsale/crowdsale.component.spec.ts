import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdsaleComponent } from './crowdsale.component';

describe('CrowdsaleComponent', () => {
  let component: CrowdsaleComponent;
  let fixture: ComponentFixture<CrowdsaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdsaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdsaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
