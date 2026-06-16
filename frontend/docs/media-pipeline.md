# Media Pipeline

Owner: Chinthan

## Backend Flow

`POST /api/media/upload` accepts one multipart image file from an authenticated author.

Allowed input types:

- `image/jpeg`
- `image/png`
- `image/webp`

Limits and transforms:

- Maximum upload size: `IMAGE_MAX_UPLOAD_BYTES`, default `10485760` bytes.
- Maximum output width: `IMAGE_MAX_WIDTH`, default `1920`.
- Output format: WebP.
- Output quality: `IMAGE_WEBP_QUALITY`, default `82`.

The compressed image is uploaded to Cloudflare R2 under `articles/{timestamp}-{uuid}-{filename}.webp`.
Every upload is written with:

```http
Cache-Control: public, max-age=31536000, immutable
Content-Type: image/webp
```

The API returns the public CDN URL and dimensions:

```json
{
  "id": "media_record_id",
  "url": "https://media.thenimble.in/articles/example.webp",
  "filename": "original.png",
  "mimeType": "image/webp",
  "size": 245812,
  "width": 1920,
  "height": 1080
}
```

## Cloudflare Setup

Pratham must confirm:

- R2 bucket name is `nimble-media`.
- `media.thenimble.in` is attached to the R2 bucket.
- The `media.thenimble.in` DNS record is proxied through Cloudflare.
- Render has `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and `R2_PUBLIC_URL`.

R2 has zero egress fees, and the proxied Cloudflare domain caches images globally at the edge.

## Frontend Contract

Srivalli can upload editor images with:

```ts
const formData = new FormData()
formData.append('file', file)

const media = await api.post('/api/media/upload', formData)
```

Use the returned `media.url` directly in Tiptap image nodes. Article images should render with `loading="lazy"`. Cover images should include stable `width` and `height` attributes where the layout knows them.
