# ngx-rwriter

`ngx-rwriter` is a powerful, lightweight, and modern Rich Text Editor for Angular 21+. It provides a familiar, Word-like interface with native support for images, videos, alignment, and formatting.

## Features

- **Formatting:** Bold, Italic, Underline, Paragraph Styles (P, H1-H4), Font Family selection, and Text/Background Color pickers.
- **Lists:** Bulleted (`<ul>`) and Numbered (`<ol>`) lists.
- **Alignment:** Left, Center, Right, and Justified alignment for text, images, and videos.
- **Video Support:**
  - **YouTube:** Paste standard or shortened YouTube URLs.
  - **Direct Links:** Support for `.mp4`, `.webm`, and `.ogg` files.
  - **Visual Resizing:** Click a video to reveal handles and resize it directly.
- **Image Support:**
  - Drag-and-drop or select images.
  - **Visual Resizing:** Click an image to reveal handles and resize it directly.
  - **Flexible Uploads:** Choose between automatic Base64 encoding or custom server-side uploads.
- **Links:** Modern custom palette for inserting hyperlinks.
- **Form Support:** Fully compatible with `ngModel` and Reactive Forms (`formControl`, `formControlName`).
- **Clean Output:** Generates clean, semantic HTML.

## Installation

```bash
npm i @reiagaru/ngx-rwriter
```

## Basic Usage

### 1. Import the Component

Since `ngx-rwriter` is a standalone component, you can import it directly into your component or module.

```typescript
import { NgxRwriter } from '@reiagaru/ngx-rwriter';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [NgxRwriter, FormsModule],
  template: `
    <ngx-rwriter [(ngModel)]="htmlContent"></ngx-rwriter>
  `
})
export class MyComponent {
  htmlContent = '<p>Hello World!</p>';
}
```

## Rendering Output (Fixing Broken Styles)

Rich text editors generate raw HTML tags (like `<p>`, `<ul>`, `<h1>`) that often lose their default styling when placed in an Angular app—especially if you use a framework like Tailwind CSS that aggressively resets defaults (Preflight).

Furthermore, Angular's default HTML sanitization strips out inline CSS styles (like text highlighting and background colors) used by the editor.

To solve both of these issues, `ngx-rwriter` provides a dedicated standalone Viewer component. It automatically isolates the HTML from global CSS resets and securely renders the inline styles.

### Using the Viewer Component
Import the `<ngx-rwriter-viewer>` standalone component and pass your backend HTML string to the `[content]` input.

```typescript
import { NgxRwriterViewer } from '@reiagaru/ngx-rwriter';

@Component({
  standalone: true,
  imports: [NgxRwriterViewer],
  template: `
    <ngx-rwriter-viewer 
      [content]="savedNewsHtml" 
      theme="auto">
    </ngx-rwriter-viewer>
  `
})
export class NewsArticleComponent {
  // This string from your backend will render safely with all colors and margins intact
  savedNewsHtml = '<h1 style="background-color: yellow;">My Article</h1><p>...</p>';
}
```

## Documentation

### Inputs

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `imageConfig` | `ImageUploadConfig` | `{ mode: 'base64' }` | Configuration for how images are handled when inserted. |
| `translations`| `RwriterTranslations`| `RW_EN` | Dictionary for overriding tooltip/placeholder text. |
| `theme`       | `'auto' \| 'light' \| 'dark'` | `'auto'` | Switches the editor interface theme. Auto uses OS preference. |
| `height`      | `string` | `undefined` | Optional fixed height for the editor area (e.g. '500px'). |

### Internationalization (i18n)

`ngx-rwriter` provides a scalable translation input. It ships with built-in dictionaries for English, Russian, and Kazakh.

```typescript
import { NgxRwriter, RW_RU, RW_EN, RW_KK } from '@reiagaru/ngx-rwriter';

@Component({
  standalone: true,
  imports: [NgxRwriter],
  template: `
    <ngx-rwriter [translations]="currentLang"></ngx-rwriter>
  `
})
export class MyComponent {
  // Use built-in Russian dictionary
  currentLang = RW_RU; 
}
```

### Advanced Media Features

#### Resizing
Simply click on any image or video inside the editor. A blue dashed box with handles will appear. Drag the handles to resize the element.

#### Alignment
While a media element is selected, using the alignment buttons (Left, Center, Right) will apply specific styles:
- **Left/Right:** Floats the element and allows text to wrap around it.
- **Center:** Displays the element as a block centered on the page.

### CSS Overrides

| Class | Description |
| :--- | :--- |
| `.rwriter-container` | The outermost wrapper of the entire component. |
| `.dark-theme` | Applied to the container when theme is dark. |
| `.rwriter-toolbar` | The toolbar container holding all buttons. |
| `.input-palette` | The custom dropdown for Link and Video URLs. |
| `.rwriter-editor` | The actual `contenteditable` area. |
| `.image-resizer-overlay` | The resize handles overlay. |

## License

MIT
