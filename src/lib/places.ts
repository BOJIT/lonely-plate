import type { Component } from "svelte";

/** Frontmatter fields every markdown file in `src/content/places` must define. */
export type PlaceMeta = {
	title: string;
	location: string;
	category: string;
	summary: string;
	lat: number;
	lng: number;
};

export type Place = PlaceMeta & {
	/** Derived from the markdown filename, and used as the route: /places/[slug] */
	slug: string;
};

type PlaceModule = { default: Component; metadata: PlaceMeta };

// mdsvex compiles each markdown file into a Svelte component that also exports its frontmatter as `metadata`.
// Eager loading keeps this simple for a small content set. For hundreds of entries, switch to a
// lazy glob for the page components and generate a lightweight index of metadata at build time.
const modules = import.meta.glob<PlaceModule>("/src/content/places/*.md", { eager: true });

function slugFromPath(path: string): string {
	return path.split("/").pop()!.replace(/\.md$/, "");
}

function toPlace(slug: string, meta: Partial<PlaceMeta> | undefined): Place {
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
			`src/content/places/${slug}.md needs frontmatter with title, summary, and numeric lat/lng in range.`
		);
	}
	return { location: "", category: "", ...meta, slug } as Place;
}

const entries = Object.entries(modules).map(([path, mod]) => {
	const slug = slugFromPath(path);
	return { place: toPlace(slug, mod.metadata), content: mod.default };
});

/** All places, sorted by title. */
export function getPlaces(): Place[] {
	return entries.map((e) => e.place).sort((a, b) => a.title.localeCompare(b.title));
}

export function getPlaceSlugs(): string[] {
	return entries.map((e) => e.place.slug);
}

/** One place's metadata and its rendered markdown component, or undefined if the slug is unknown. */
export function getPlace(slug: string): { place: Place; content: Component } | undefined {
	return entries.find((e) => e.place.slug === slug);
}
