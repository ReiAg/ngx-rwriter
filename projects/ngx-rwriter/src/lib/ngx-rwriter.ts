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
        <select (change)="execCommand('formatBlock', $any($event.target).value)" title="Paragraph Style">
          <option value="P">Paragraph</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="H4">Heading 4</option>
        </select>

        <select (change)="execCommand('fontName', $any($event.target).value)" title="Font Family">
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
        </select>

        <button type="button" (click)="execCommand('bold')" title="Bold"><b>B</b></button>
        <button type="button" (click)="execCommand('italic')" title="Italic"><i>I</i></button>
        <button type="button" (click)="execCommand('underline')" title="Underline"><u>U</u></button>
        
        <span class="separator"></span>

        <!-- Alignment -->
        <button type="button" (click)="align('Left')" title="Align Left">&#9776; L</button>
        <button type="button" (click)="align('Center')" title="Align Center">&#9776; C</button>
        <button type="button" (click)="align('Right')" title="Align Right">&#9776; R</button>
        <button type="button" (click)="align('Full')" title="Justify">&#9776; J</button>

        <span class="separator"></span>

        <!-- Insert -->
        <button type="button" (click)="insertLink()" title="Insert Link">&#128279; Link</button>
        
        <label class="image-upload-label" title="Insert Image">
          &#128196; Image
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
    .rwriter-toolbar button:hover, .rwriter-toolbar select:hover, .image-upload-label:hover {
      background: #f0f0f0;
      border-color: #bbb;
    }
    .rwriter-toolbar .separator {
      width: 1px;
      height: 24px;
      background: #e0e0e0;
      margin: 0 4px;
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

  private onChange = (value: string) => {};
  public onTouched = () => {};

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
    const url = prompt('Enter link URL:');
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
    if (this.selectedImage && !this.editorRef.nativeElement.contains(target) && !target.classList.contains('resizer-handle')) {
      this.selectedImage = null;
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
      // Tricky: we are anchored at bottom-left, but resizing TR means dragging TR.
      // Top changes, Right changes. Simplest approach for inline resizing is just changing width/height.
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
