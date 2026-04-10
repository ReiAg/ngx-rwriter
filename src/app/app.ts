import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxRwriter, NgxRwriterViewer, RW_EN, RW_RU, RW_KK, RwriterTranslations } from '@reiagaru/ngx-rwriter';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgxRwriter, NgxRwriterViewer],
  template: `
    <div style="max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif;" [style.color]="isDark() ? '#e0e0e0' : '#000'" [style.background]="isDark() ? '#121212' : '#fff'">
      <h2>ngx-rwriter Demo</h2>
      <p>This is a rich text editor built natively in Angular 21.</p>
      
      <!-- Controls -->
      <div style="margin-bottom: 20px; display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <strong>Language:</strong>
        <button (click)="setLang(RW_EN)">English</button>
        <button (click)="setLang(RW_RU)">Русский</button>
        <button (click)="setLang(RW_KK)">Қазақша</button>
        
        <strong style="margin-left: 20px;">Theme:</strong>
        <button (click)="toggleTheme()">Toggle Dark Mode</button>
      </div>

      <ngx-rwriter [(ngModel)]="content" [translations]="currentTranslations" [theme]="isDark() ? 'dark' : 'light'"></ngx-rwriter>

      <div style="margin-top: 40px;">
        <h3>Viewer Output (Final Result):</h3>
        <div style="border: 1px solid #ddd; padding: 20px; border-radius: 6px;">
          <ngx-rwriter-viewer [content]="content()" [theme]="isDark() ? 'dark' : 'light'"></ngx-rwriter-viewer>
        </div>
      </div>

      <div style="margin-top: 40px;">
        <h3>Raw HTML Output:</h3>
        <pre [style.background]="isDark() ? '#2d2d2d' : '#f4f4f4'" style="padding: 15px; border-radius: 6px; overflow-x: auto;">{{ content() }}</pre>
      </div>
    </div>
  `
})
export class App {
  protected readonly title = signal('workspace');
  content = signal('<p>Start typing or add an image...</p>');
  isDark = signal(false);
  
  // Expose the imported constants to the template
  readonly RW_EN = RW_EN;
  readonly RW_RU = RW_RU;
  readonly RW_KK = RW_KK;

  currentTranslations: RwriterTranslations = RW_EN;

  setLang(lang: RwriterTranslations) {
    this.currentTranslations = lang;
  }

  toggleTheme() {
    this.isDark.set(!this.isDark());
    document.body.style.background = this.isDark() ? '#121212' : '#fff';
  }
}
