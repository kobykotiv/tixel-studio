'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a text prompt to help users create textures.
 *
 * - generateTexturePrompt - A function that generates a texture prompt.
 * - GenerateTexturePromptInput - The input type for the generateTexturePrompt function.
 * - GenerateTexturePromptOutput - The return type for the generateTexturePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTexturePromptInputSchema = z.object({
  style: z.string().describe('The desired style of the texture (e.g., realistic, abstract, cartoonish).'),
  material: z.string().describe('The primary material or element of the texture (e.g., wood, metal, fabric, nature).'),
  details: z.string().describe('Specific details or features to include in the texture (e.g., scratches, patterns, reflections).'),
  resolution: z.string().describe('The desired resolution of the texture (e.g., 4k, 8k, high resolution).'),
});
export type GenerateTexturePromptInput = z.infer<typeof GenerateTexturePromptInputSchema>;

const GenerateTexturePromptOutputSchema = z.object({
  prompt: z.string().describe('A generated text prompt that can be used to create the texture.'),
});
export type GenerateTexturePromptOutput = z.infer<typeof GenerateTexturePromptOutputSchema>;

export async function generateTexturePrompt(input: GenerateTexturePromptInput): Promise<GenerateTexturePromptOutput> {
  return generateTexturePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTexturePrompt',
  input: {schema: GenerateTexturePromptInputSchema},
  output: {schema: GenerateTexturePromptOutputSchema},
  prompt: `You are a texture prompt generator. Generate a detailed and creative texture prompt based on the following input parameters:

Style: {{{style}}}
Material: {{{material}}}
Details: {{{details}}}
Resolution: {{{resolution}}}

The generated prompt should be suitable for use with image generation models to create a seamless and tileable texture.

Texture Prompt:`,
});

const generateTexturePromptFlow = ai.defineFlow(
  {
    name: 'generateTexturePromptFlow',
    inputSchema: GenerateTexturePromptInputSchema,
    outputSchema: GenerateTexturePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
