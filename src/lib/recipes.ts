import type { Component } from "svelte";

/** Frontmatter fields every markdown file in `src/content/Recipes` must define. */
export type RecipeMeta = {
    title: string;
    location: string;
    category: "Drink" | "Snack" | "Main" | "Dessert";
    summary: string;
    lat: number;
    lng: number;
    link?: string;
    image?: string;
};

export type Recipe = RecipeMeta & {
    /** Derived from the markdown filename, and used as the route: /recipes/[slug] */
    slug: string;
};

type RecipeModule = { default: Component; metadata: RecipeMeta };

// mdsvex compiles each markdown file into a Svelte component that also exports its frontmatter as `metadata`.
// Eager loading keeps this simple for a small content set. For hundreds of entries, switch to a
// lazy glob for the page components and generate a lightweight index of metadata at build time.
const modules = import.meta.glob<RecipeModule>("/src/content/recipes/*.md", { eager: true });

function slugFromPath(path: string): string {
    return path.split("/").pop()!.replace(/\.md$/, "");
}

function toRecipe(slug: string, meta: Partial<RecipeMeta> | undefined): Recipe {
    const valid =
        meta &&
        typeof meta.title === "string" &&
        typeof meta.summary === "string" &&
        typeof meta.lat === "number" &&
        typeof meta.lng === "number" &&
        meta.lat >= -90 &&
        meta.lat <= 90 &&
        meta.lng >= -180 &&
        meta.lng <= 180;

    if (!valid) {
        throw new Error(
            `src/content/recipes/${slug}.md needs frontmatter with title, summary, and numeric lat/lng in range.`
        );
    }
    return { location: "", category: "", ...meta, slug } as Recipe;
}

const entries = Object.entries(modules).map(([path, mod]) => {
    const slug = slugFromPath(path);
    return { recipe: toRecipe(slug, mod.metadata), content: mod.default };
});

/** All recipes, sorted by title. */
export function getRecipes(): Recipe[] {
    return entries.map((e) => e.recipe).sort((a, b) => a.title.localeCompare(b.title));
}

export function getRecipeSlugs(): string[] {
    return entries.map((e) => e.recipe.slug);
}

/** One recipe's metadata and its rendered markdown component, or undefined if the slug is unknown. */
export function getRecipe(slug: string): { recipe: Recipe; content: Component } | undefined {
    return entries.find((e) => e.recipe.slug === slug);
}
