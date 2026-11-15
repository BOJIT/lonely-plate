import { error } from "@sveltejs/kit";
import { getPlace, getPlaceSlugs } from "#lib/places.js";
import type { EntryGenerator, PageLoad } from "./$types";

// Tell the pre-renderer which slugs exist: one route per markdown file.
export const entries: EntryGenerator = () => getPlaceSlugs().map((slug) => ({ slug }));

export const load: PageLoad = ({ params }) => {
	const result = getPlace(params.slug);
	if (!result) error(404, `There is no place called "${params.slug}".`);
	return result;
};
