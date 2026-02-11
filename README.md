# Tixel: The Ultimate Texture Tiling Tool, Built with AI 🚀

Welcome to Tixel, a powerful and intuitive web application for creating seamless, repeating patterns from your images. This isn't just any app; it was built live in **Firebase Studio** with the help of a friendly AI coding partner! 🤖✨

## What is Tixel?

Tixel is a feature-rich texture tiling utility that makes pattern generation a breeze. Whether you're a game developer, a graphic designer, or just someone who loves cool patterns, Tixel has you covered.

### 🔥 Key Features:

*   **Seamless Tiling:** Upload an image and instantly see a live preview of your tiled texture.
*   **Customizable Grid:** Choose from presets like 2x2, 4x4, 8x8, or set your own custom row and column counts.
*   **Batch Processing:** Process multiple images at once! Tixel handles them in optimized chunks.
*   **Lossless Compression:** Download your final tiled images as high-quality, perfectly compressed PNGs or zipped archives, with zero quality loss.
*   **Data Savings:** See exactly how much space you've saved with our efficient compression.
*   **Progressive Web App (PWA):** Install Tixel on your device for a native app-like experience and offline access.
*   **Ad-Supported:** All features are free for everyone, supported by non-intrusive ads.
*   **Developer API:** A simple, powerful API for programmatic texture tiling.

## The Magic Behind the Curtain ✨

This entire application was iteratively developed through a conversation with an AI in Firebase Studio. From scaffolding the Next.js project to implementing complex features like batch processing, PWA conversion, and AdSense integration, every step was a collaboration between human and machine.

This project stands as a testament to a new era of software development where AI partners help turn ideas into reality faster than ever before.

## API Usage

Tixel now offers a simple API for programmatic tiling.

### Status Check

-   **Endpoint:** `GET /api/status`
-   **Description:** A simple health check endpoint.
-   **Success Response (200):**
    ```json
    {
      "status": "ok"
    }
    ```

### Image Tiling

-   **Endpoint:** `POST /api/tile`
-   **Description:** Upload an image and get a tiled version back. The request must be `multipart/form-data`.
-   **Form Data Parameters:**
    -   `image`: The source image file to be tiled. (Max 10MB)
    -   `rows` (optional): The number of rows for the tiled output. (Default: 4)
    -   `cols` (optional): The number of columns for the tiled output. (Default: 4)
-   **Success Response (200):**
    -   The response body will be the binary data of the final tiled PNG image.
    -   The `Content-Type` will be `image/png`.
    -   The `Content-Disposition` header will be set to `attachment`, prompting a download.
-   **Error Responses:**
    -   `400 Bad Request`: If the image is missing, or `rows`/`cols` are invalid.
    -   `500 Internal Server Error`: If an error occurs during image processing.

#### Example Usage (cURL)

```bash
curl -X POST \
  -F "image=@/path/to/your/texture.jpg" \
  -F "rows=8" \
  -F "cols=8" \
  https://<your-app-url>/api/tile \
  -o tiled_output.png
```

### Tech Stack

*   **Framework:** Next.js & React (App Router)
*   **UI:** ShadCN UI Components & Tailwind CSS
*   **PWA:** `@ducanh2912/next-pwa`
*   **Development Environment:** Firebase Studio

Feel free to explore the code in `src/app/page.tsx` to see how it all works!
