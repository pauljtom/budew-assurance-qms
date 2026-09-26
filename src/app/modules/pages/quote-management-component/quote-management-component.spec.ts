import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteManagementComponent } from './quote-management-component';

describe('QuoteManagementComponent', () => {
  let component: QuoteManagementComponent;
  let fixture: ComponentFixture<QuoteManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteManagementComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuoteManagementComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
