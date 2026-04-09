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

## Documentation

### Inputs

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `imageConfig` | `ImageUploadConfig` | `{ mode: 'base64' }` | Configuration for how images are handled when inserted. |
| `translations`| `RwriterTranslations`| `RW_EN` | Dictionary for overriding tooltip/placeholder text. |
| `theme`       | `'light' \| 'dark'`   | `'light'` | Switches the editor interface between light and dark modes. |

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

## License

MIT
