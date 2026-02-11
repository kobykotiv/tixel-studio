
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function CodeBlock({ children }: { children: React.ReactNode }) {
    return (
        <pre className="bg-muted/50 p-4 rounded-md text-sm overflow-x-auto">
            <code className="text-foreground font-code">{children}</code>
        </pre>
    );
}

export function ApiDocs() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
        <header className="mb-12">
            <h1 className="text-4xl font-bold tracking-tighter mb-2 font-headline">Tixel API Documentation</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
                Welcome to the Tixel API. Here you'll find everything you need to integrate our powerful image tiling service directly into your own applications.
            </p>
        </header>
        
        <div className="space-y-16">
            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Authentication</h2>
                <p className="text-muted-foreground">
                    The Tixel API is currently open and does not require an API key or authentication for its endpoints. Feel free to start building right away!
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-6 border-b pb-2">Endpoints</h2>
                <div className="space-y-12">
                    {/* GET /api/status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-4">
                                <span className="font-mono text-sm bg-blue-500/20 text-blue-300 py-1 px-3 rounded-full">GET</span>
                                <span>/api/status</span>
                            </CardTitle>
                            <CardDescription>A simple health check endpoint to verify that the API is up and running.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold mb-2">Success Response (200 OK)</h4>
                            <CodeBlock>{`{\n  "status": "ok"\n}`}</CodeBlock>
                        </CardContent>
                    </Card>
                    
                    {/* POST /api/tile */}
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center gap-4">
                                 <span className="font-mono text-sm bg-green-500/20 text-green-300 py-1 px-3 rounded-full">POST</span>
                                <span>/api/tile</span>
                            </CardTitle>
                            <CardDescription>Upload an image file and receive a seamlessly tiled version as a PNG image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div>
                                <h4 className="font-semibold mb-2">Request Body</h4>
                                <p className="text-muted-foreground mb-4">The request must be sent as <code className="bg-muted/50 p-1 rounded-sm font-code">multipart/form-data</code> with the following fields:</p>
                                <ul className="list-disc pl-5 space-y-4 text-muted-foreground">
                                    <li>
                                        <code className="bg-muted/50 p-1 rounded-sm font-code text-foreground">image</code> (required): The source image file.
                                        <ul className="list-inside list-[circle] pl-5 mt-2 text-sm space-y-1">
                                            <li>Max file size: 10MB.</li>
                                            <li>Supported formats: PNG, JPG, GIF, etc. (any standard image format).</li>
                                        </ul>
                                    </li>
                                     <li>
                                        <code className="bg-muted/50 p-1 rounded-sm font-code text-foreground">rows</code> (optional): The number of rows in the output grid.
                                        <ul className="list-inside list-[circle] pl-5 mt-2 text-sm space-y-1">
                                            <li>Type: Integer</li>
                                            <li>Default: 4</li>
                                            <li>Range: 1 - 100</li>
                                        </ul>
                                    </li>
                                     <li>
                                        <code className="bg-muted/50 p-1 rounded-sm font-code text-foreground">cols</code> (optional): The number of columns in the output grid.
                                         <ul className="list-inside list-[circle] pl-5 mt-2 text-sm space-y-1">
                                            <li>Type: Integer</li>
                                            <li>Default: 4</li>
                                             <li>Range: 1 - 100</li>
                                        </ul>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Success Response (200 OK)</h4>
                                <p className="text-muted-foreground mb-2">The response body will be the binary data of the generated PNG image. The following headers will be set:</p>
                                 <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
                                    <li><code className="bg-muted/50 p-1 rounded-sm font-code">Content-Type: image/png</code></li>
                                    <li><code className="bg-muted/50 p-1 rounded-sm font-code">Content-Disposition: attachment; filename="tiled_image.png"</code></li>
                                </ul>
                            </div>

                             <div>
                                <h4 className="font-semibold mb-2">Error Responses</h4>
                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                                    <li><code className="bg-muted/50 p-1 rounded-sm font-code">400 Bad Request</code>: Returned if the <code className="bg-muted/50 p-1 rounded-sm font-code">image</code> is missing, exceeds the 10MB limit, or if `rows`/`cols` are invalid numbers or out of range.</li>
                                    <li><code className="bg-muted/50 p-1 rounded-sm font-code">500 Internal Server Error</code>: Returned if an unexpected error occurs during server-side image processing.</li>
                                </ul>
                             </div>

                             <div>
                                <h4 className="font-semibold mb-2">Example (cURL)</h4>
                                <p className="text-muted-foreground mb-2 text-sm">This example tiles a local file <code className="bg-muted/50 p-1 rounded-sm font-code">texture.jpg</code> into an 8x8 grid and saves the output to <code className="bg-muted/50 p-1 rounded-sm font-code">tiled_output.png</code>.</p>
                                <CodeBlock>{`curl -X POST \\
  -F "image=@/path/to/your/texture.jpg" \\
  -F "rows=8" \\
  -F "cols=8" \\
  https://<your-app-url>/api/tile \\
  -o tiled_output.png`}</CodeBlock>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    </div>
  );
}
