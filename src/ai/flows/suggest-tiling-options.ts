'use server';

/**
 * @fileOverview Suggests tiling grid dimensions based on the content of an uploaded image.
 *
 * - suggestTilingOptions - A function that suggests tiling options.
 * - SuggestTilingOptionsInput - The input type for the suggestTilingOptions function.
 * - SuggestTilingOptionsOutput - The return type for the suggestTilingOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTilingOptionsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to generate tiling suggestions for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type SuggestTilingOptionsInput = z.infer<typeof SuggestTilingOptionsInputSchema>;

const SuggestTilingOptionsOutputSchema = z.object({
  suggestedOptions: z
    .array(z.string())
    .describe('Suggested tiling options (e.g., 2x2, 4x4, 8x8).'),
});
export type SuggestTilingOptionsOutput = z.infer<typeof SuggestTilingOptionsOutputSchema>;

export async function suggestTilingOptions(input: SuggestTilingOptionsInput): Promise<SuggestTilingOptionsOutput> {
  return suggestTilingOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTilingOptionsPrompt',
  input: {schema: SuggestTilingOptionsInputSchema},
  output: {schema: SuggestTilingOptionsOutputSchema},
  prompt: `You are a tiling expert. Given an image, suggest tiling grid dimensions (e.g., 2x2, 4x4, 8x8) that would be aesthetically pleasing.

Image: {{media url=photoDataUri}}

Please suggest three tiling options.`,
});

const suggestTilingOptionsFlow = ai.defineFlow(
  {
    name: 'suggestTilingOptionsFlow',
    inputSchema: SuggestTilingOptionsInputSchema,
    outputSchema: SuggestTilingOptionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
