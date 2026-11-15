import { error } from "@sveltejs/kit";
import { getRecipe, getRecipeSlugs } from "#lib/recipes.js";
import type { EntryGenerator, PageLoad } from "./$types";

// Tell the pre-renderer which slugs exist: one route per markdown file.
export const entries: EntryGenerator = () => getRecipeSlugs().map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
    const result = getRecipe(params.slug);
    if (!result) error(404, `There is no recipe called "${params.slug}".`);
    return result;
};
