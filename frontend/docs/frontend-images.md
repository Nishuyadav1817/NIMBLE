# Frontend Image Guidelines

**Audience:** Srivalli (Frontend Engineer)

All article images are served from `https://media.thenimble.in` via Cloudflare CDN. The backend compresses uploads to WebP (quality 82, max width 1920px) before storing them in R2. No client-side conversion is required.

## Uploading images

Send a `POST` request to `/api/media/upload` with the Clerk session token in the `Authorization: Bearer <token>` header and the file as `multipart/form-data`. The response includes the public `url` to embed in article content, plus `width` and `height` for stable rendering.

```ts
const formData = new FormData()
formData.append('file', file)

const response = await fetch(`${API_URL}/api/media/upload`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const { url, width, height } = await response.json()
```

## Rendering images in articles

Browsers render WebP natively. The CDN handles global caching — no extra image CDN configuration is needed on the frontend.

### Required attributes

- Add `loading="lazy"` to every `<img>` tag so below-the-fold images defer loading.
- Set explicit `width` and `height` on cover images to reserve layout space and avoid cumulative layout shift (CLS).

### Examples

```html
<!-- Inline article image -->
<img
  src="https://media.thenimble.in/articles/1712345678900-photo.png.webp"
  alt="Description of the image"
  loading="lazy"
/>

<!-- Cover image -->
<img
  src="https://media.thenimble.in/articles/1712345678900-cover.jpg.webp"
  alt="Article cover"
  width="1200"
  height="630"
  loading="lazy"
/>
```

### React example

```tsx
<img
  src={imageUrl}
  alt={altText}
  width={isCover ? 1200 : undefined}
  height={isCover ? 630 : undefined}
  loading="lazy"
/>
```

## What you do not need to do

- No WebP polyfill or format detection — all stored images are WebP.
- No signed URLs or proxy endpoints — URLs are public and permanently cacheable.
- No client-side compression — the backend handles resize and encoding.
