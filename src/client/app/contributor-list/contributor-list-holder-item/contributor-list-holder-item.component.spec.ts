import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributorListHolderItemComponent } from './contributor-list-holder-item.component';

describe('ContributorListHolderItemComponent', () => {
  let component: ContributorListHolderItemComponent;
  let fixture: ComponentFixture<ContributorListHolderItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributorListHolderItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributorListHolderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
