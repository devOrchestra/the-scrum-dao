import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdsaleOrderItemComponent } from './crowdsale-order-item.component';

describe('CrowdsaleOrderItemComponent', () => {
  let component: CrowdsaleOrderItemComponent;
  let fixture: ComponentFixture<CrowdsaleOrderItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdsaleOrderItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdsaleOrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
