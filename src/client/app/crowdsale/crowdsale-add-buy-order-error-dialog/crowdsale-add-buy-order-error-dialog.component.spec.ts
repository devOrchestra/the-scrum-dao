import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdsaleAddBuyOrderErrorDialogComponent } from './crowdsale-add-buy-order-error-dialog.component';

describe('CrowdsaleAddBuyOrderErrorDialogComponent', () => {
  let component: CrowdsaleAddBuyOrderErrorDialogComponent;
  let fixture: ComponentFixture<CrowdsaleAddBuyOrderErrorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdsaleAddBuyOrderErrorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdsaleAddBuyOrderErrorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
