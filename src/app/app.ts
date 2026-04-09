import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxRwriter } from 'ngx-rwriter';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, NgxRwriter],
  template: `
    <div style="max-width: 800px; margin: 40px auto; padding: 20px; font-family: sans-serif;">
      <h2>ngx-rwriter Demo</h2>
      <p>This is a rich text editor built natively in Angular 21.</p>
      
      <lib-ngx-rwriter [(ngModel)]="content"></lib-ngx-rwriter>

      <div style="margin-top: 40px;">
        <h3>Raw HTML Output:</h3>
        <pre style="background: #f4f4f4; padding: 15px; border-radius: 6px; overflow-x: auto;">{{ content() }}</pre>
      </div>
    </div>
  `
})
export class App {
  protected readonly title = signal('workspace');
  content = signal('<p>Start typing or add an image...</p>');
}
