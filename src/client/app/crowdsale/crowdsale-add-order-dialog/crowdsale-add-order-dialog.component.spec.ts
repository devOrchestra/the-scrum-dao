import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdsaleAddOrderDialogComponent } from './crowdsale-add-order-dialog.component';

describe('CrowdsaleAddOrderDialogComponent', () => {
  let component: CrowdsaleAddOrderDialogComponent;
  let fixture: ComponentFixture<CrowdsaleAddOrderDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrowdsaleAddOrderDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrowdsaleAddOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
