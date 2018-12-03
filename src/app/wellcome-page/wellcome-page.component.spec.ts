import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WellcomePageComponent } from './wellcome-page.component';

describe('WellcomePageComponent', () => {
  let component: WellcomePageComponent;
  let fixture: ComponentFixture<WellcomePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WellcomePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WellcomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
