import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxRwriter } from './ngx-rwriter';

describe('NgxRwriter', () => {
  let component: NgxRwriter;
  let fixture: ComponentFixture<NgxRwriter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxRwriter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxRwriter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
