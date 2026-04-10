import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ngx-rwriter-viewer',
  standalone: true,
  template: `<div class="rwriter-content" [class.dark-theme]="theme === 'dark'" [innerHTML]="content"></div>`,
  styleUrls: ['../assets/rwriter-styles.css'],
  encapsulation: ViewEncapsulation.None
})
export class NgxRwriterViewer {
  @Input() content: string = '';
  @Input() theme: 'light' | 'dark' | 'auto' = 'auto';
}
