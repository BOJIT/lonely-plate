import { mdsvex } from 'mdsvex';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit({
            compilerOptions: {
                // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
                runes: ({ filename }) =>
                    filename.split(/[/\\]/).includes('node_modules') ? undefined : true
            },

            // Every route is pre-rendered, so the site builds to plain static files in ./build
            adapter: adapter(),
            paths: {
                base: process.env.NODE_ENV === 'production' ? process.env.BASE_PATH ?? '' : ''
            },
            preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
            extensions: ['.svelte', '.svx', '.md']
        })
    ]
});
