import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ngx-rwriter-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="rwriter-content" [class.dark-theme]="theme === 'dark'" [innerHTML]="safeContent"></div>`,
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .rwriter-content {
      min-height: 1em;
      outline: none;
      line-height: 1.6;
      font-size: 16px;
      text-align: initial;
      color: #334155;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .rwriter-content p { margin: 0 0 1.25em 0 !important; display: block !important; }
    .rwriter-content h1 { font-size: 2.25em !important; font-weight: 700 !important; margin: 0.75em 0 !important; display: block !important; line-height: 1.2 !important; color: #0f172a !important; }
    .rwriter-content h2 { font-size: 1.8em !important; font-weight: 700 !important; margin: 0.8em 0 !important; display: block !important; line-height: 1.3 !important; color: #1e293b !important; }
    .rwriter-content h3 { font-size: 1.5em !important; font-weight: 600 !important; margin: 0.85em 0 !important; display: block !important; line-height: 1.4 !important; color: #334155 !important; }
    .rwriter-content h4 { font-size: 1.25em !important; font-weight: 600 !important; margin: 0.9em 0 !important; display: block !important; line-height: 1.5 !important; color: #475569 !important; }
    .rwriter-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-content ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-content li { display: list-item !important; margin-bottom: 0.25em !important; }
    .rwriter-content blockquote { margin: 1.5em 0 !important; padding-left: 1em !important; border-left: 4px solid #e2e8f0 !important; color: #64748b !important; font-style: italic !important; }
    .rwriter-content b, .rwriter-content strong { font-weight: 600 !important; display: inline !important; color: inherit !important; }
    .rwriter-content i, .rwriter-content em { font-style: italic !important; display: inline !important; }
    .rwriter-content u { text-decoration: underline !important; display: inline !important; text-underline-offset: 2px !important; }
    
    .rwriter-content table { border-collapse: collapse; width: 100%; margin: 1.25em 0 !important; }
    .rwriter-content table td, .rwriter-content table th { border: 1px solid #cbd5e1 !important; padding: 8px 12px !important; }
    .dark-theme.rwriter-content table td, .dark-theme.rwriter-content table th { border-color: #475569 !important; }
    .rwriter-content [style*='background-color'] { display: inline !important; border-radius: 2px; padding: 0 2px; }
    .rwriter-content img { max-width: 100%; height: auto; border-radius: 4px; }
    .dark-theme.rwriter-content { color: #e2e8f0 !important; }
    .dark-theme.rwriter-content h1 { color: #f8fafc !important; }
    .dark-theme.rwriter-content h2 { color: #f1f5f9 !important; }
    .dark-theme.rwriter-content h3 { color: #e2e8f0 !important; }
    .dark-theme.rwriter-content h4 { color: #cbd5e1 !important; }
    .dark-theme.rwriter-content blockquote { border-left-color: #475569 !important; color: #94a3b8 !important; }
  `]
})
export class NgxRwriterViewer {
  @Input() content: string = '';
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

  private sanitizer = inject(DomSanitizer);

  get safeContent(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.content || '');
  }
}
