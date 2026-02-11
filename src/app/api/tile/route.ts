import { NextRequest, NextResponse } from 'next/server';
import Jimp from 'jimp';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        
        const imageFile = formData.get('image') as File | null;
        const rowsStr = formData.get('rows') as string | null;
        const colsStr = formData.get('cols') as string | null;

        const rows = parseInt(rowsStr || '4', 10);
        const cols = parseInt(colsStr || '4', 10);

        if (!imageFile) {
            return NextResponse.json({ error: 'Image file is required. Please provide it as "image" in the form data.' }, { status: 400 });
        }
        
        if (imageFile.size > 10 * 1024 * 1024) { // 10MB
            return NextResponse.json({ error: 'Image file size exceeds the 10MB limit.' }, { status: 400 });
        }

        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0 || rows > 100 || cols > 100) {
            return NextResponse.json({ error: 'Invalid "rows" or "cols" parameter. Must be between 1 and 100.' }, { status: 400 });
        }

        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        const sourceImage = await Jimp.read(imageBuffer);

        const { width, height } = sourceImage.bitmap;
        
        const outputWidth = width * cols;
        const outputHeight = height * rows;
        
        const maxDim = 8192;
         if (outputWidth > maxDim || outputHeight > maxDim) {
             return NextResponse.json({ error: `Tiled dimensions (${outputWidth}x${outputHeight}) exceed maximum allowed size of ${maxDim}x${maxDim}.` }, { status: 400 });
        }

        const tiledImage = new Jimp(outputWidth, outputHeight);

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                tiledImage.blit(sourceImage, x * width, y * height);
            }
        }

        const outputBuffer = await tiledImage.getBufferAsync(Jimp.MIME_PNG);

        return new NextResponse(outputBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': 'attachment; filename="tiled_image.png"',
            },
        });

    } catch (error: any) {
        console.error('Tiling API Error:', error);
        return NextResponse.json({ error: 'Failed to process image.', details: error.message }, { status: 500 });
    }
}
