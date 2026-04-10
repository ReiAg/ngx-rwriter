import { Component, Input, ViewEncapsulation, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'ngx-rwriter-viewer',
  standalone: true,
  template: `<div class="rwriter-content" [class.dark-theme]="theme === 'dark'" [innerHTML]="safeContent"></div>`,
  styleUrls: ['../assets/rwriter-styles.css'],
  encapsulation: ViewEncapsulation.None
})
export class NgxRwriterViewer {
  @Input() content: string = '';
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';

  private sanitizer = inject(DomSanitizer);

  get safeContent(): SafeHtml {
    // Bypassing security trust so inline styles (like background-color) from the editor are preserved
    return this.sanitizer.bypassSecurityTrustHtml(this.content || '');
  }
}

