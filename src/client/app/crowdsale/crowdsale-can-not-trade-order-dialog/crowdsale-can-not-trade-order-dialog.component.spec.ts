import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdsaleCanNotTradeOrderDialogComponent } from './crowdsale-can-not-trade-order-dialog.component';

describe('CrowdsaleCanNotTradeOrderDialogComponent', () => {
  let component: CrowdsaleCanNotTradeOrderDialogComponent;
  let fixture: ComponentFixture<CrowdsaleCanNotTradeOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdsaleCanNotTradeOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdsaleCanNotTradeOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
