import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  forwardRef,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RwriterTranslations, RW_EN } from './rwriter-translations';

export interface ImageUploadConfig {
  mode: 'base64' | 'upload';
  uploadFn?: (file: File) => Promise<string>;
}

@Component({
  selector: 'lib-ngx-rwriter',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxRwriter),
      multi: true
    }
  ],
  template: `
    <div class="rwriter-container">
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
        <button type="button" (click)="insertLink()" [title]="translations.insertLink">&#128279; {{ translations.link }}</button>
        
        <label class="image-upload-label" [title]="translations.insertImage">
          &#128196; {{ translations.image }}
          <input type="file" accept="image/*" (change)="insertImage($event)" style="display:none">
        </label>
      </div>

      <div class="editor-wrapper">
        <div 
          #editor 
          class="rwriter-editor" 
          contenteditable="true" 
          (input)="onInput()" 
          (blur)="onTouched()"
          (click)="onEditorClick($event)"
          (keydown)="onEditorKeydown($event)">
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
      border: 1px solid #ccc;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #fff;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .rwriter-toolbar {
      padding: 10px;
      background: #fdfdfd;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }
    .rwriter-toolbar button, .rwriter-toolbar select, .image-upload-label {
      padding: 6px 10px;
      background: #fff;
      border: 1px solid #dcdcdc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, border-color 0.2s;
    }
    .rwriter-toolbar button:hover, .rwriter-toolbar select:hover, .image-upload-label:hover, .color-picker-label:hover {
      background: #f0f0f0;
      border-color: #bbb;
    }
    .rwriter-toolbar .separator {
      width: 1px;
      height: 24px;
      background: #e0e0e0;
      margin: 0 4px;
    }
    
    /* Custom Color Pickers */
    .color-picker-container {
      position: relative;
      display: inline-flex;
    }
    .color-picker-label {
      padding: 6px 8px;
      background: #fff;
      border: 1px solid #dcdcdc;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      font-size: 14px;
      transition: background 0.2s, border-color 0.2s;
    }
    .color-palette {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 4px;
      background: #fff;
      border: 1px solid #ccc;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-radius: 4px;
      padding: 8px;
      z-index: 100;
      display: grid;
      grid-template-columns: repeat(10, 20px);
      gap: 2px;
      width: max-content;
    }
    .color-swatch {
      width: 20px;
      height: 20px;
      cursor: pointer;
      border: 1px solid rgba(0,0,0,0.1);
      box-sizing: border-box;
      border-radius: 2px;
    }
    .color-swatch:hover {
      transform: scale(1.15);
      border-color: #000;
      z-index: 2;
    }
    .clear-bg {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #666;
      background: #f9f9f9;
    }

    .editor-wrapper {
      position: relative;
    }
    .rwriter-editor {
      min-height: 300px;
      padding: 16px;
      outline: none;
      overflow-y: auto;
      line-height: 1.5;
      font-size: 16px;
    }
    .rwriter-editor p {
      margin: 0 0 1em 0;
    }
    .rwriter-editor img {
      max-width: 100%;
      cursor: pointer;
      transition: outline 0.1s;
    }
    
    /* Resizer overlay */
    .image-resizer-overlay {
      position: absolute;
      border: 2px dashed #007bff;
      pointer-events: none;
      box-sizing: border-box;
      z-index: 10;
    }
    .resizer-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #fff;
      border: 2px solid #007bff;
      border-radius: 50%;
      pointer-events: auto;
      box-sizing: border-box;
    }
    .resizer-handle.top-left { top: -6px; left: -6px; cursor: nwse-resize; }
    .resizer-handle.top-right { top: -6px; right: -6px; cursor: nesw-resize; }
    .resizer-handle.bottom-left { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .resizer-handle.bottom-right { bottom: -6px; right: -6px; cursor: nwse-resize; }
  `]
})
export class NgxRwriter implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor', { static: true }) editorRef!: ElementRef<HTMLDivElement>;
  
  @Input() imageConfig: ImageUploadConfig = { mode: 'base64' };
  @Input() translations: RwriterTranslations = RW_EN;

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
