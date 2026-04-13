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
    // For signal inputs and our custom logic in constructor, 
    // we might need a fresh instance or manually trigger state if needed.
    // In our modern component, systemDark is set in constructor.
    // Since we mocked matchMedia AFTER component creation in beforeEach, 
    // we should create component AFTER mocking or use a fresh fixture.
    
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [NgxRwriterViewer] });
    const newFixture = TestBed.createComponent(NgxRwriterViewer);
    newFixture.componentRef.setInput('theme', 'auto');
    newFixture.detectChanges();
    
    const element = newFixture.nativeElement.querySelector('.rwriter-content');
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

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [NgxRwriterViewer] });
    const newFixture = TestBed.createComponent(NgxRwriterViewer);
    newFixture.componentRef.setInput('theme', 'auto');
    newFixture.detectChanges();
    
    const element = newFixture.nativeElement.querySelector('.rwriter-content');
    expect(element.classList.contains('dark-theme')).toBe(true);
  });
});

