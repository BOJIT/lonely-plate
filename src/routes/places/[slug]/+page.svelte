<script lang="ts">
	import { resolve } from "$app/paths";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import { Button } from "#lib/components/ui/button/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();

	// The compiled markdown file is a Svelte component, so it renders like any other.
	const Content = $derived(data.content);
	const place = $derived(data.place);
</script>

<svelte:head>
	<title>{place.title} · Atlas</title>
	<meta name="description" content={place.summary} />
</svelte:head>

<main class="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:py-12">
	<Button href={resolve("/")} variant="ghost" size="sm" class="-ml-3 mb-6">
		<ArrowLeft />
		All places
	</Button>

	<header class="mb-8 space-y-3">
		<Badge variant="secondary">{place.category}</Badge>
		<h1 class="text-4xl font-bold tracking-tight">{place.title}</h1>
		<p class="text-muted-foreground flex items-center gap-1.5 text-sm">
			<MapPin class="size-4" />
			{place.location}
			<span aria-hidden="true">·</span>
			<span class="tabular-nums">{place.lat.toFixed(4)}, {place.lng.toFixed(4)}</span>
		</p>
		<p class="text-lg leading-relaxed">{place.summary}</p>
	</header>

	<article class="prose prose-zinc dark:prose-invert max-w-none">
		<Content />
	</article>

	<div class="mt-10 border-t pt-6">
		<Button href="{resolve('/')}?place={place.slug}">
			<MapPin />
			View on map
		</Button>
	</div>
</main>
