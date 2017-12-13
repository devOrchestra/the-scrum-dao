import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorListWorkerItemComponent } from './contributor-list-worker-item.component';

describe('ContributorListWorkerItemComponent', () => {
  let component: ContributorListWorkerItemComponent;
  let fixture: ComponentFixture<ContributorListWorkerItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributorListWorkerItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributorListWorkerItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
