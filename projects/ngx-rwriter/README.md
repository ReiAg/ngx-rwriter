# ngx-rwriter

`ngx-rwriter` is a powerful, lightweight, and modern Rich Text Editor for Angular 21+. It provides a familiar, Word-like interface with native support for images, alignment, and formatting.

## Features

- **Formatting:** Bold, Italic, Underline, Paragraph Styles (P, H1-H4), Font Family selection, and Text/Background Color pickers.
- **Lists:** Bulleted (`<ul>`) and Numbered (`<ol>`) lists.
- **Alignment:** Left, Center, Right, and Justified alignment for both text and images.
- **Image Support:**
  - Drag-and-drop or select images.
  - **Visual Resizing:** Click an image to reveal handles and resize it directly in the editor.
  - **Flexible Uploads:** Choose between automatic Base64 encoding or custom server-side uploads.
- **Links:** Easily insert and manage hyperlinks.
- **Form Support:** Fully compatible with `ngModel` and Reactive Forms (`formControl`, `formControlName`).
- **Clean Output:** Generates clean, semantic HTML.

## Installation

```bash
npm install ngx-rwriter
```

## Basic Usage

### 1. Import the Component

Since `ngx-rwriter` is a standalone component, you can import it directly into your component or module.

```typescript
import { NgxRwriter } from 'ngx-rwriter';
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

`ngx-rwriter` provides two ways to safely render your saved HTML back to the screen:

### Option A: The Viewer Component (Recommended)
Import the `<ngx-rwriter-viewer>` standalone component. It automatically isolates the HTML and applies the correct typography rules.

```typescript
import { NgxRwriterViewer } from 'ngx-rwriter';

@Component({
  standalone: true,
  imports: [NgxRwriterViewer],
  template: `
    <!-- Just pass the raw HTML string to the [content] input -->
    <ngx-rwriter-viewer [content]="savedNewsHtml" theme="light"></ngx-rwriter-viewer>
  `
})
export class NewsArticleComponent {
  savedNewsHtml = '<h1>My Article</h1><p>...</p>';
}
```

### Option B: Global CSS Import
If you prefer to render the `[innerHTML]` yourself, you must wrap it in a `.rwriter-content` class and import the library's CSS file into your global stylesheet (e.g., `styles.scss` or `angular.json`).

```css
/* styles.css */
@import "@reiagaru/ngx-rwriter/assets/rwriter-styles.css";
```

```html
<!-- your-component.html -->
<div class="rwriter-content" [innerHTML]="savedNewsHtml"></div>
```

## Documentation

### Inputs

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `imageConfig` | `ImageUploadConfig` | `{ mode: 'base64' }` | Configuration for how images are handled when inserted. |
| `translations`| `RwriterTranslations`| `RW_EN` | Dictionary for overriding tooltip/placeholder text. |
| `theme`       | `'auto' \| 'light' \| 'dark'` | `'auto'` | Switches the editor interface theme. Auto uses OS preference. |

### Internationalization (i18n)

`ngx-rwriter` provides a scalable translation input. It ships with built-in dictionaries for English, Russian, and Kazakh.

```typescript
import { NgxRwriter, RW_RU, RW_EN, RW_KK } from 'ngx-rwriter';

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
  
  // Or provide your own custom dictionary mapped to your app's i18n
  /*
  currentLang = {
    paragraph: 'My Custom Paragraph',
    // ... all other required keys
  }
  */
}
```

### Image Configuration

The `imageConfig` input allows you to control how images are stored.

#### Mode: Base64 (Default)
Images are converted to base64 strings and embedded directly in the HTML output. No backend setup is required.

#### Mode: Upload (Server-side)
To upload images to your own server, provide a custom `uploadFn`.

```typescript
import { ImageUploadConfig } from 'ngx-rwriter';

editorConfig: ImageUploadConfig = {
  mode: 'upload',
  uploadFn: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    // Your upload logic here
    const response = await myApiService.upload(formData);
    return response.url; // Return the public URL of the image
  }
};
```

```html
<ngx-rwriter [imageConfig]="editorConfig"></ngx-rwriter>
```

### Advanced Image Features

#### Resizing
Simply click on any image inside the editor. A blue dashed box with handles will appear. Drag the handles to resize the image while maintaining its aspect ratio.

#### Alignment
While an image is selected, using the alignment buttons (Left, Center, Right) will apply specific styles to the image:
- **Left/Right:** Floats the image and allows text to wrap around it.
- **Center:** Displays the image as a block element centered on the page.

### Styling the Editor
You can wrap the editor in a container to control its width or height. The editor component itself has a minimum height of `300px` and grows with content.

```css
.editor-container {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #ddd;
}
```

### CSS Overrides

The editor is designed to be easily customizable. Here is a list of the primary CSS classes you can target in your global stylesheet (e.g., `styles.css` or `styles.scss`) to change the look and feel:

| Class | Description |
| :--- | :--- |
| `.rwriter-container` | The outermost wrapper of the entire component. |
| `.dark-theme` | Applied to the container when `[theme]="'dark'"`. |
| `.rwriter-toolbar` | The toolbar container holding all buttons, dropdowns, and pickers. |
| `.separator` | The vertical divider between groups of toolbar buttons. |
| `.color-picker-container` | Wrapper for the custom color picker toggle and dropdown. |
| `.color-picker-label` | The button/label that opens the color palette. |
| `.color-palette` | The popup container holding the color swatches. |
| `.color-swatch` | The individual color squares inside the color palette. |
| `.image-upload-label` | The label acting as the "Insert Image" button. |
| `.editor-wrapper` | The relative wrapper directly around the contenteditable area. |
| `.rwriter-editor` | The actual `contenteditable` div where text is typed and content is placed. |
| `.image-resizer-overlay` | The border overlay that appears around a selected image. |
| `.resizer-handle` | The draggable corner points (`.top-left`, `.bottom-right`, etc.) used for resizing. |

*Note: Since the component uses Angular's default view encapsulation, you must place these overrides in your global styles, or use `::ng-deep` if styling from within a parent component.*

## License

MIT
