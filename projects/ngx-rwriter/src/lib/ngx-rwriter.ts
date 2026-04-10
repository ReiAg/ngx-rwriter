import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
  HostListener,
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  OnChanges,
  OnDestroy,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RwriterTranslations, RW_EN } from './rwriter-translations';

export interface ImageUploadConfig {
  mode: 'base64' | 'upload';
  uploadFn?: (file: File) => Promise<string>;
}

@Component({
  selector: 'ngx-rwriter',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxRwriter),
      multi: true
    }
  ],
  template: `
    <div class="rwriter-container" [class.dark-theme]="isDarkTheme">
      <div class="rwriter-toolbar">
        <!-- Formatting -->
        <select (change)="execCommand('formatBlock', $any($event.target).value)" [title]="translations.paragraphStyle">
          <option value="P">{{ translations.paragraph }}</option>
          <option value="H1">{{ translations.heading1 }}</option>
          <option value="H2">{{ translations.heading2 }}</option>
          <option value="H3">{{ translations.heading3 }}</option>
          <option value="H4">{{ translations.heading4 }}</option>
        </select>

        <select (change)="execCommand('fontName', $any($event.target).value)" [title]="translations.fontFamily">
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>

        <button type="button" (click)="execCommand('bold')" [title]="translations.bold"><b>B</b></button>
        <button type="button" (click)="execCommand('italic')" [title]="translations.italic"><i>I</i></button>
        <button type="button" (click)="execCommand('underline')" [title]="translations.underline"><u>U</u></button>
        
        <span class="separator"></span>

        <!-- Alignment -->
        <button type="button" (click)="align('Left')" [title]="translations.alignLeft">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="15" y2="12"></line>
            <line x1="3" y1="18" x2="19" y2="18"></line>
          </svg>
        </button>
        <button type="button" (click)="align('Center')" [title]="translations.alignCenter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="6" y1="12" x2="18" y2="12"></line>
            <line x1="4" y1="18" x2="20" y2="18"></line>
          </svg>
        </button>
        <button type="button" (click)="align('Right')" [title]="translations.alignRight">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="9" y1="12" x2="21" y2="12"></line>
            <line x1="5" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <button type="button" (click)="align('Full')" [title]="translations.justify">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <span class="separator"></span>

        <!-- Lists -->
        <button type="button" (click)="execCommand('insertUnorderedList')" [title]="translations.bulletedList">&bull; List</button>
        <button type="button" (click)="execCommand('insertOrderedList')" [title]="translations.numberedList">1. List</button>

        <span class="separator"></span>

        <!-- Colors -->
        <div class="color-picker-container" (mousedown)="$event.preventDefault()" (click)="toggleTextColorPicker()">
          <div class="color-picker-label" [title]="translations.textColor">
            <span class="color-icon" style="color: #d93025; font-weight: bold; font-family: serif; border-bottom: 3px solid currentColor; line-height: 1;">A</span>
          </div>
          <div class="color-palette" *ngIf="showTextColorPicker">
            <div *ngFor="let c of colors" class="color-swatch" [style.background]="c" (click)="setTextColor(c, $event)" [title]="c"></div>
          </div>
        </div>

        <div class="color-picker-container" (mousedown)="$event.preventDefault()" (click)="toggleBgColorPicker()">
          <div class="color-picker-label" [title]="translations.backgroundColor">
            <span class="color-icon" style="background: #fbbc04; color: #000; padding: 0 2px; font-family: serif; line-height: 1;">ab</span>
          </div>
          <div class="color-palette" *ngIf="showBgColorPicker">
            <div *ngFor="let c of colors" class="color-swatch" [style.background]="c" (click)="setBgColor(c, $event)" [title]="c"></div>
            <div class="color-swatch clear-bg" [title]="translations.clearBackground" (click)="setBgColor('transparent', $event)">&#10005;</div>
          </div>
        </div>

        <span class="separator"></span>

        <!-- Insert -->
        <div class="table-picker-container" (mouseenter)="showTablePalette = true" (mouseleave)="showTablePalette = false">
          <button type="button" (click)="insertTable()" [title]="translations.insertTable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="12" y1="3" x2="12" y2="21"></line>
            </svg>
          </button>
          <div class="table-palette" *ngIf="showTablePalette">
            <div class="table-grid-header">
              <span *ngIf="hoveredGridRow && hoveredGridCol">{{hoveredGridRow}} x {{hoveredGridCol}}</span>
              <span *ngIf="!hoveredGridRow || !hoveredGridCol">{{translations.table}}</span>
            </div>
            <div class="table-grid" (mouseleave)="hoveredGridRow = 0; hoveredGridCol = 0">
              <div *ngFor="let r of gridRows" class="table-grid-row">
                <div *ngFor="let c of gridCols" 
                     class="table-grid-cell"
                     [class.active]="r <= hoveredGridRow && c <= hoveredGridCol"
                     (mouseenter)="hoveredGridRow = r; hoveredGridCol = c"
                     (click)="insertTableGrid(r, c)">
                </div>
              </div>
            </div>
            <div class="table-custom-inputs">
              <div class="custom-inputs-row">
                <input type="number" min="1" [value]="customTableRows" (input)="customTableRows = $any($event.target).valueAsNumber" [title]="translations.tableRows">
                <span>x</span>
                <input type="number" min="1" [value]="customTableCols" (input)="customTableCols = $any($event.target).valueAsNumber" [title]="translations.tableCols">
              </div>
              <button type="button" class="insert-btn" (click)="insertCustomTable()">{{translations.insert}}</button>
            </div>
          </div>
        </div>
        
        <button type="button" (click)="insertLink()" [title]="translations.insertLink">&#128279; {{ translations.link }}</button>
        
        <label class="image-upload-label" [title]="translations.insertImage">
          &#128196; {{ translations.image }}
          <input type="file" accept="image/*" (change)="insertImage($event)" style="display:none">
        </label>
      </div>

      <div class="editor-wrapper">
        <div 
          #editor 
          class="rwriter-editor rwriter-content" 
          [style.height]="height"
          [style.minHeight]="height ? 'auto' : '300px'"
          contenteditable="true" 
          (input)="onInput()" 
          (blur)="onTouched()"
          (click)="onEditorClick($event)"
          (keydown)="onEditorKeydown($event)"
          (scroll)="updateResizerPosition()">
        </div>

        <!-- Image Resize Overlay -->
        <div *ngIf="selectedImage" 
             class="image-resizer-overlay" 
             [style.top.px]="resizerTop" 
             [style.left.px]="resizerLeft"
             [style.width.px]="resizerWidth"
             [style.height.px]="resizerHeight">
          <div class="resizer-handle top-left" (mousedown)="startResize($event, 'tl')"></div>
          <div class="resizer-handle top-right" (mousedown)="startResize($event, 'tr')"></div>
          <div class="resizer-handle bottom-left" (mousedown)="startResize($event, 'bl')"></div>
          <div class="resizer-handle bottom-right" (mousedown)="startResize($event, 'br')"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rwriter-container {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      overflow: hidden;
    }
    .rwriter-container:focus-within {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }
    .rwriter-container .rwriter-toolbar {
      padding: 8px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }
    .rwriter-container .rwriter-toolbar button, 
    .rwriter-container .rwriter-toolbar select, 
    .rwriter-container .image-upload-label {
      padding: 6px 10px;
      background: transparent !important;
      border: 1px solid transparent !important;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: #475569 !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
    }
    .rwriter-container .rwriter-toolbar select {
      appearance: none;
      padding-right: 26px;
      background-color: #ffffff !important;
      border: 1px solid #cbd5e1 !important;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
      background-repeat: no-repeat !important;
      background-position: right 8px center !important;
      background-size: 14px !important;
    }
    .rwriter-container .rwriter-toolbar button:hover, 
    .rwriter-container .image-upload-label:hover, 
    .rwriter-container .color-picker-label:hover {
      background-color: #e2e8f0 !important;
      color: #0f172a !important;
    }
    .rwriter-container .rwriter-toolbar select:hover {
      border-color: #94a3b8 !important;
      background-color: #f8fafc !important;
    }
    .rwriter-container .rwriter-toolbar .separator {
      width: 1px;
      height: 20px;
      background-color: #cbd5e1;
      margin: 0 4px;
      display: inline-block;
    }
    
    .rwriter-container .color-picker-container {
      position: relative;
      display: inline-flex;
    }
    .rwriter-container .color-picker-label {
      padding: 6px 8px;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      transition: all 0.2s ease-in-out;
    }
    .rwriter-container .color-palette {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 10px;
      z-index: 100;
      display: grid;
      grid-template-columns: repeat(10, 22px);
      gap: 4px;
      width: max-content;
      animation: fadeIn 0.15s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .rwriter-container .color-swatch {
      width: 22px;
      height: 22px;
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 4px;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }
    .rwriter-container .color-swatch:hover {
      transform: scale(1.15);
      box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b82f6;
      z-index: 2;
    }
    .rwriter-container .clear-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #64748b;
      background: #f1f5f9;
      grid-column: span 10;
      width: auto;
      height: 28px;
      margin-top: 4px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
    }
    .rwriter-container .clear-bg:hover {
      background: #e2e8f0;
      color: #0f172a;
      transform: none;
      box-shadow: none;
    }
    
    .rwriter-container .table-picker-container {
      position: relative;
      display: inline-flex;
    }
    .rwriter-container .table-palette {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 12px;
      z-index: 100;
      width: max-content;
      animation: fadeIn 0.15s ease-out;
    }
    .rwriter-container .table-palette::before {
      content: '';
      position: absolute;
      top: -10px;
      left: 0;
      right: 0;
      height: 10px;
      background: transparent;
    }
    .rwriter-container .table-grid-header {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      text-align: center;
      font-weight: 500;
    }
    .rwriter-container .table-grid {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-bottom: 12px;
    }
    .rwriter-container .table-grid-row {
      display: flex;
      gap: 3px;
    }
    .rwriter-container .table-grid-cell {
      width: 18px;
      height: 18px;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.1s;
    }
    .rwriter-container .table-grid-cell.active {
      background-color: #bfdbfe;
      border-color: #3b82f6;
    }
    .rwriter-container .table-custom-inputs {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .rwriter-container .custom-inputs-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 13px;
      color: #475569;
    }
    .rwriter-container .custom-inputs-row input {
      width: 40px;
      padding: 4px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      text-align: center;
      font-size: 13px;
      color: #334155;
      outline: none;
    }
    .rwriter-container .custom-inputs-row input:focus {
      border-color: #3b82f6;
    }
    .rwriter-container .table-palette .insert-btn {
      background-color: #3b82f6 !important;
      color: #ffffff !important;
      border: none !important;
      padding: 6px !important;
      border-radius: 4px !important;
      font-weight: 600 !important;
      cursor: pointer;
      width: 100%;
      text-align: center;
      font-size: 13px;
    }
    .rwriter-container .table-palette .insert-btn:hover {
      background-color: #2563eb !important;
    }

    .rwriter-container .editor-wrapper {
      position: relative;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .rwriter-container .rwriter-editor, .rwriter-content {
      outline: none;
      line-height: 1.6;
      font-size: 16px;
      text-align: initial;
      color: #334155;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    .rwriter-container .rwriter-editor {
      min-height: 300px;
      padding: 20px 24px;
      overflow-y: auto;
      flex-grow: 1;
    }

    /* Isolation Styles to counteract Tailwind Preflight */
    .rwriter-container .rwriter-editor p, .rwriter-content p { margin: 0 0 1.25em 0 !important; display: block !important; }
    .rwriter-container .rwriter-editor h1, .rwriter-content h1 { font-size: 2.25em !important; font-weight: 700 !important; margin: 0.75em 0 !important; display: block !important; line-height: 1.2 !important; color: #0f172a !important; }
    .rwriter-container .rwriter-editor h2, .rwriter-content h2 { font-size: 1.8em !important; font-weight: 700 !important; margin: 0.8em 0 !important; display: block !important; line-height: 1.3 !important; color: #1e293b !important; }
    .rwriter-container .rwriter-editor h3, .rwriter-content h3 { font-size: 1.5em !important; font-weight: 600 !important; margin: 0.85em 0 !important; display: block !important; line-height: 1.4 !important; color: #334155 !important; }
    .rwriter-container .rwriter-editor h4, .rwriter-content h4 { font-size: 1.25em !important; font-weight: 600 !important; margin: 0.9em 0 !important; display: block !important; line-height: 1.5 !important; color: #475569 !important; }
    
    .rwriter-container .rwriter-editor ul, .rwriter-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-container .rwriter-editor ol, .rwriter-content ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 1em 0 !important; display: block !important; }
    .rwriter-container .rwriter-editor li, .rwriter-content li { display: list-item !important; margin-bottom: 0.25em !important; }
    
    .rwriter-container .rwriter-editor blockquote, .rwriter-content blockquote { margin: 1.5em 0 !important; padding-left: 1em !important; border-left: 4px solid #e2e8f0 !important; color: #64748b !important; font-style: italic !important; }
    .rwriter-container .rwriter-editor b, .rwriter-container .rwriter-editor strong, .rwriter-content b, .rwriter-content strong { font-weight: 600 !important; display: inline !important; color: inherit !important; }
    .rwriter-container .rwriter-editor i, .rwriter-container .rwriter-editor em, .rwriter-content i, .rwriter-content em { font-style: italic !important; display: inline !important; }
    .rwriter-container .rwriter-editor u, .rwriter-content u { text-decoration: underline !important; display: inline !important; text-underline-offset: 2px !important; }
    
    .rwriter-container .rwriter-editor table, .rwriter-content table { border-collapse: collapse; width: 100%; margin: 1.25em 0 !important; }
    .rwriter-container .rwriter-editor table td, .rwriter-container .rwriter-editor table th, .rwriter-content table td, .rwriter-content table th { border: 1px solid #cbd5e1 !important; padding: 8px 12px !important; }
    .rwriter-container.dark-theme .rwriter-editor table td, .rwriter-container.dark-theme .rwriter-editor table th, .dark-theme.rwriter-content table td, .dark-theme.rwriter-content table th { border-color: #475569 !important; }
    
    /* Ensure background-color (hilite) is visible and not overridden */
    .rwriter-container .rwriter-editor [style*='background-color'], .rwriter-content [style*='background-color'] {
      display: inline !important;
      border-radius: 2px;
      padding: 0 2px;
    }

    .rwriter-container .rwriter-editor img, .rwriter-content img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      border-radius: 4px;
      transition: box-shadow 0.2s;
    }
    .rwriter-container .rwriter-editor img:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    /* Resizer overlay */
    .rwriter-container .image-resizer-overlay {
      position: absolute;
      border: 2px solid #3b82f6;
      pointer-events: none;
      box-sizing: border-box;
      z-index: 10;
      border-radius: 4px;
      box-shadow: 0 0 0 1px rgba(255,255,255,0.5);
    }
    .rwriter-container .resizer-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #ffffff;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      pointer-events: auto;
      box-sizing: border-box;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }
    .rwriter-container .resizer-handle.top-left { top: -6px; left: -6px; cursor: nwse-resize; }
    .rwriter-container .resizer-handle.top-right { top: -6px; right: -6px; cursor: nesw-resize; }
    .rwriter-container .resizer-handle.bottom-left { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .rwriter-container .resizer-handle.bottom-right { bottom: -6px; right: -6px; cursor: nwse-resize; }
    
    /* Dark Theme */
    .rwriter-container.dark-theme {
      background: #0f172a !important;
      border-color: #334155 !important;
      color: #e2e8f0 !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
    }
    .rwriter-container.dark-theme:focus-within {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
    .rwriter-container.dark-theme .rwriter-toolbar {
      background: #1e293b !important;
      border-bottom-color: #334155 !important;
    }
    .rwriter-container.dark-theme .rwriter-toolbar button,
    .rwriter-container.dark-theme .rwriter-toolbar select,
    .rwriter-container.dark-theme .image-upload-label,
    .rwriter-container.dark-theme .color-picker-label {
      background-color: transparent !important;
      border-color: transparent !important;
      color: #cbd5e1 !important;
    }
    .rwriter-container.dark-theme .rwriter-toolbar select {
      background-color: #0f172a !important;
      border-color: #475569 !important;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
    }
    .rwriter-container.dark-theme .rwriter-toolbar button:hover,
    .rwriter-container.dark-theme .image-upload-label:hover,
    .rwriter-container.dark-theme .color-picker-label:hover {
      background-color: #334155 !important;
      color: #f8fafc !important;
    }
    .rwriter-container.dark-theme .rwriter-toolbar select:hover {
      border-color: #64748b !important;
      background-color: #1e293b !important;
    }
    .rwriter-container.dark-theme .rwriter-toolbar .separator {
      background-color: #475569 !important;
    }
    .rwriter-container.dark-theme .color-palette {
      background: #1e293b !important;
      border-color: #334155 !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
    }
    .rwriter-container.dark-theme .color-swatch {
      border-color: rgba(255,255,255,0.1) !important;
    }
    .rwriter-container.dark-theme .color-swatch:hover {
      box-shadow: 0 0 0 2px #1e293b, 0 0 0 4px #3b82f6;
    }
    .rwriter-container.dark-theme .clear-bg {
      color: #94a3b8 !important;
      background: #0f172a !important;
      border-color: #475569 !important;
    }
    .rwriter-container.dark-theme .clear-bg:hover {
      background: #334155 !important;
      color: #f8fafc !important;
    }
    .rwriter-container.dark-theme .rwriter-content,
    .dark-theme.rwriter-content {
      color: #e2e8f0 !important;
    }
    .rwriter-container.dark-theme .rwriter-editor h1, .dark-theme.rwriter-content h1 { color: #f8fafc !important; }
    .rwriter-container.dark-theme .rwriter-editor h2, .dark-theme.rwriter-content h2 { color: #f1f5f9 !important; }
    .rwriter-container.dark-theme .rwriter-editor h3, .dark-theme.rwriter-content h3 { color: #e2e8f0 !important; }
    .rwriter-container.dark-theme .rwriter-editor h4, .dark-theme.rwriter-content h4 { color: #cbd5e1 !important; }
    .rwriter-container.dark-theme .rwriter-editor blockquote, .dark-theme.rwriter-content blockquote { border-left-color: #475569 !important; color: #94a3b8 !important; }
  `]
})
export class NgxRwriter implements ControlValueAccessor, AfterViewInit, OnInit, OnChanges, OnDestroy {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  
  @Input() theme: 'auto' | 'light' | 'dark' = 'auto';
  @Input() imageConfig: ImageUploadConfig = { mode: 'base64' };
  @Input() translations: RwriterTranslations = RW_EN;
  @Input() height?: string;

  isDarkTheme = false;
  private mediaQueryList: MediaQueryList | null = null;
  private themeChangeListener = (e: MediaQueryListEvent) => {
    if (this.theme === 'auto') {
      this.isDarkTheme = e.matches;
      this.cdr.detectChanges();
    }
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryList.addEventListener('change', this.themeChangeListener);
    }
    this.updateThemeState();
  }

  ngOnChanges() {
    this.updateThemeState();
  }

  ngOnDestroy() {
    if (this.mediaQueryList) {
      this.mediaQueryList.removeEventListener('change', this.themeChangeListener);
    }
  }

  private updateThemeState() {
    if (this.theme === 'dark') {
      this.isDarkTheme = true;
    } else if (this.theme === 'light') {
      this.isDarkTheme = false;
    } else if (this.mediaQueryList) {
      this.isDarkTheme = this.mediaQueryList.matches;
    }
  }

  private onChange = (value: string) => {};
  public onTouched = () => {};

  // Custom Color Picker State
  showTextColorPicker = false;
  showBgColorPicker = false;

  // Material-like color palette
  colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'
  ];

  // Table Picker State
  showTablePalette = false;
  gridRows = [1, 2, 3, 4, 5, 6];
  gridCols = [1, 2, 3, 4, 5, 6];
  hoveredGridRow = 0;
  hoveredGridCol = 0;
  customTableRows = 2;
  customTableCols = 2;

  // Image Resizer State
  selectedImage: HTMLImageElement | null = null;
  resizerTop = 0;
  resizerLeft = 0;
  resizerWidth = 0;
  resizerHeight = 0;

  private isResizing = false;
  private resizeHandle = '';
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  ngAfterViewInit() {
    this.editorRef.nativeElement.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Simple fallback to ensure P tag is used for new lines
        document.execCommand('formatBlock', false, 'P');
      }
    });
  }

  writeValue(value: string): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.innerHTML = value || '<p><br></p>';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.editorRef) {
      this.editorRef.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }

  onInput() {
    this.onChange(this.editorRef.nativeElement.innerHTML);
    this.updateResizerPosition(); 
  }

  execCommand(command: string, value: string = '') {
    this.editorRef.nativeElement.focus();
    document.execCommand(command, false, value);
    this.onInput();
  }

  bgColor(color: string) {
    this.editorRef.nativeElement.focus();
    // hiliteColor is standard for text highlight in modern webkit browsers
    document.execCommand('hiliteColor', false, color);
    // fallback for Firefox
    document.execCommand('backColor', false, color);
    this.onInput();
  }

  // --- Custom Color Picker Actions ---
  toggleTextColorPicker() {
    this.showTextColorPicker = !this.showTextColorPicker;
    this.showBgColorPicker = false;
  }

  toggleBgColorPicker() {
    this.showBgColorPicker = !this.showBgColorPicker;
    this.showTextColorPicker = false;
  }

  setTextColor(color: string, event: MouseEvent) {
    event.stopPropagation();
    this.execCommand('foreColor', color);
    this.showTextColorPicker = false;
  }

  setBgColor(color: string, event: MouseEvent) {
    event.stopPropagation();
    this.bgColor(color);
    this.showBgColorPicker = false;
  }
  // -----------------------------------

  align(alignment: 'Left' | 'Center' | 'Right' | 'Full') {
    this.editorRef.nativeElement.focus();
    if (this.selectedImage) {
      if (alignment === 'Left') {
        this.selectedImage.style.display = 'inline';
        this.selectedImage.style.float = 'left';
        this.selectedImage.style.margin = '0 1em 1em 0';
      } else if (alignment === 'Right') {
        this.selectedImage.style.display = 'inline';
        this.selectedImage.style.float = 'right';
        this.selectedImage.style.margin = '0 0 1em 1em';
      } else if (alignment === 'Center') {
        this.selectedImage.style.display = 'block';
        this.selectedImage.style.float = 'none';
        this.selectedImage.style.margin = '1em auto';
      } else {
        this.selectedImage.style.display = 'inline';
        this.selectedImage.style.float = 'none';
        this.selectedImage.style.margin = '0';
      }
      this.updateResizerPosition();
      this.onInput();
    } else {
      document.execCommand('justify' + alignment, false, '');
      this.onInput();
    }
  }

  insertTableGrid(rows: number, cols: number) {
    this.insertTableHtml(rows, cols);
  }

  insertTable() {
    this.insertTableHtml(2, 2);
  }

  insertCustomTable() {
    if (this.customTableRows > 0 && this.customTableCols > 0) {
      this.insertTableHtml(this.customTableRows, this.customTableCols);
    }
  }

  private insertTableHtml(rows: number, cols: number) {
    this.showTablePalette = false;
    this.hoveredGridRow = 0;
    this.hoveredGridCol = 0;
    
    this.editorRef.nativeElement.focus();
    let html = '<table class="rwriter-table"><tbody>';
    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        html += '<td><br></td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    this.execCommand('insertHTML', html);
  }

  insertLink() {
    const url = prompt(this.translations.enterLinkUrl);
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  async insertImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    if (this.imageConfig.mode === 'base64') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        this.execCommand('insertImage', url);
      };
      reader.readAsDataURL(file);
    } else if (this.imageConfig.mode === 'upload' && this.imageConfig.uploadFn) {
      try {
        const url = await this.imageConfig.uploadFn(file);
        this.execCommand('insertImage', url);
      } catch (err) {
        console.error('Image upload failed', err);
      }
    }
    
    input.value = '';
  }

  onEditorClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'img') {
      this.selectedImage = target as HTMLImageElement;
      this.updateResizerPosition();
    } else {
      this.selectedImage = null;
    }
  }

  onEditorKeydown(event: KeyboardEvent) {
    if (this.selectedImage && (event.key === 'Backspace' || event.key === 'Delete')) {
      this.selectedImage.remove();
      this.selectedImage = null;
      this.onInput();
      event.preventDefault();
    }
  }

  updateResizerPosition() {
    if (!this.selectedImage) return;
    
    const editorWrapper = this.editorRef.nativeElement.parentElement;
    if (!editorWrapper) return;
    
    const wrapperRect = editorWrapper.getBoundingClientRect();
    const imgRect = this.selectedImage.getBoundingClientRect();
    
    this.resizerTop = imgRect.top - wrapperRect.top + editorWrapper.scrollTop;
    this.resizerLeft = imgRect.left - wrapperRect.left + editorWrapper.scrollLeft;
    this.resizerWidth = imgRect.width;
    this.resizerHeight = imgRect.height;
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Deselect image if clicking outside
    if (this.selectedImage && !this.editorRef.nativeElement.contains(target) && !target.classList.contains('resizer-handle')) {
      this.selectedImage = null;
    }
    
    // Close color pickers if clicking outside
    if (!target.closest('.color-picker-container')) {
      this.showTextColorPicker = false;
      this.showBgColorPicker = false;
    }
  }

  startResize(event: MouseEvent, handle: string) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.selectedImage) return;

    this.isResizing = true;
    this.resizeHandle = handle;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.selectedImage.clientWidth;
    this.startHeight = this.selectedImage.clientHeight;

    const onMouseMove = (e: MouseEvent) => this.doResize(e);
    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      this.onInput(); 
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  doResize(event: MouseEvent) {
    if (!this.isResizing || !this.selectedImage) return;

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;

    const ratio = this.startWidth / this.startHeight;

    if (this.resizeHandle === 'br') {
      newWidth = this.startWidth + dx;
    } else if (this.resizeHandle === 'tr') {
      newWidth = this.startWidth + dx;
    } else if (this.resizeHandle === 'bl') {
      newWidth = this.startWidth - dx;
    } else if (this.resizeHandle === 'tl') {
      newWidth = this.startWidth - dx;
    }

    newHeight = newWidth / ratio;

    if (newWidth > 20 && newHeight > 20) {
      this.selectedImage.style.width = newWidth + 'px';
      this.selectedImage.style.height = newHeight + 'px';
      this.updateResizerPosition();
    }
  }
}
