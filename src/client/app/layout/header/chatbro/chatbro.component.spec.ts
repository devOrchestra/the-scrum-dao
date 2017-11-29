import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbroComponent } from './chatbro.component';

describe('ChatbroComponent', () => {
  let component: ChatbroComponent;
  let fixture: ComponentFixture<ChatbroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatbroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatbroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
