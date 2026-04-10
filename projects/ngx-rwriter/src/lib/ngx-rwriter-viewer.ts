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
      color: inherit;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .rwriter-content p { margin: 0 0 1em 0 !important; display: block !important; }
    .rwriter-content h1 { font-size: 2em !important; font-weight: bold !important; margin: 0.67em 0 !important; display: block !important; }
    .rwriter-content h2 { font-size: 1.5em !important; font-weight: bold !important; margin: 0.83em 0 !important; display: block !important; }
    .rwriter-content h3 { font-size: 1.17em !important; font-weight: bold !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-content h4 { font-size: 1em !important; font-weight: bold !important; margin: 1.33em 0 !important; display: block !important; }
    .rwriter-content ul { list-style-type: disc !important; padding-left: 40px !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-content ol { list-style-type: decimal !important; padding-left: 40px !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-content li { display: list-item !important; }
    .rwriter-content blockquote { margin: 1em 40px !important; }
    .rwriter-content b, .rwriter-content strong { font-weight: bold !important; display: inline !important; }
    .rwriter-content i, .rwriter-content em { font-style: italic !important; display: inline !important; }
    .rwriter-content u { text-decoration: underline !important; display: inline !important; }
    .rwriter-content [style*="background-color"] { display: inline !important; }
    .rwriter-content img { max-width: 100%; cursor: pointer; transition: outline 0.1s; }
    .dark-theme.rwriter-content { color: #e0e0e0 !important; }
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
