import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxRwriterViewer } from './ngx-rwriter-viewer';
import { vi } from 'vitest';

describe('NgxRwriterViewer', () => {
  let component: NgxRwriterViewer;
  let fixture: ComponentFixture<NgxRwriterViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxRwriterViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxRwriterViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply dark-theme class when theme is dark', () => {
    fixture.componentRef.setInput('theme', 'dark');
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.rwriter-content');
    expect(element.classList.contains('dark-theme')).toBe(true);
  });

  it('should NOT apply dark-theme class when theme is light', () => {
    fixture.componentRef.setInput('theme', 'light');
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.rwriter-content');
    expect(element.classList.contains('dark-theme')).toBe(false);
  });

  it('should handle auto theme based on media query', () => {
    // Mock matchMedia for light mode
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    fixture.componentRef.setInput('theme', 'auto');
    component.ngOnInit(); // Trigger ngOnInit again with mock
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.rwriter-content');
    expect(element.classList.contains('dark-theme')).toBe(false); 
  });

  it('should handle auto theme when system is dark', () => {
    // Mock matchMedia for dark mode
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    fixture.componentRef.setInput('theme', 'auto');
    component.ngOnInit(); // Trigger ngOnInit with dark mock
    fixture.detectChanges();
    
    const element = fixture.nativeElement.querySelector('.rwriter-content');
    expect(element.classList.contains('dark-theme')).toBe(true);
  });
});
