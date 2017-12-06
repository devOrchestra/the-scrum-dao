import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkToJiraComponent } from './link-to-jira.component';

describe('LinkToJiraComponent', () => {
  let component: LinkToJiraComponent;
  let fixture: ComponentFixture<LinkToJiraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkToJiraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkToJiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
