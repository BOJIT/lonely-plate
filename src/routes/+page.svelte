<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/env";
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import type { Map as MapLibreMap } from "maplibre-gl";
	import { toggleMode } from "mode-watcher";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
	import ChevronDown from "@lucide/svelte/icons/chevron-down";
	import Sun from "@lucide/svelte/icons/sun";
	import Moon from "@lucide/svelte/icons/moon";
	import {
		Map,
		MapControls,
		MapMarker,
		MarkerContent,
		MarkerPopup,
		MarkerTooltip,
	} from "#lib/components/ui/map/index.js";
	import * as Card from "#lib/components/ui/card/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import { getPlaces, type Place } from "#lib/places.js";
	import { fitView } from "#lib/map-view.js";

	const places = getPlaces();

	let map = $state<MapLibreMap | null>(null);
	let listOpen = $state(true);

	// `?place=slug` (used by the "View on map" link on each article) opens the map centred on that marker.
	// url.searchParams can't be read while pre-rendering, so this only runs in the browser.
	const focused = browser
		? places.find((p) => p.slug === page.url.searchParams.get("place"))
		: undefined;

	// Frame every marker on first load, keeping clear of the floating card (left on desktop, top on mobile).
	// The map is only created in the browser, so the server-side values are placeholders.
	function initialView(): { center: [number, number]; zoom: number } {
		if (!browser) return { center: [0, 20], zoom: 1 };
		if (focused) return { center: [focused.lng, focused.lat], zoom: 5 };

		const wide = window.innerWidth >= 1024;
		return fitView(
			places,
			{ width: window.innerWidth, height: window.innerHeight },
			wide
				? { top: 80, right: 80, bottom: 80, left: 420 }
				: { top: 150, right: 40, bottom: 90, left: 40 }
		);
	}

	const { center, zoom } = initialView();

	onMount(() => {
		// Start with the list collapsed on small screens so the map has room.
		if (window.innerWidth < 1024) listOpen = false;
	});

	function flyTo(place: Place) {
		map?.flyTo({
			center: [place.lng, place.lat],
			zoom: Math.max(map.getZoom(), 5),
			essential: true,
		});
	}
</script>

<svelte:head>
	<title>Atlas · A map of world landmarks</title>
	<meta
		name="description"
		content="An interactive map of world landmarks. Each marker links to its own page."
	/>
</svelte:head>

<div class="relative h-dvh w-screen overflow-hidden">
	<!-- renderWorldCopies lets the camera pan freely past the world's edge, so the initial framing can
	     leave room for the floating card instead of being pinned to the world's bounds. -->
	<Map {center} {zoom} bind:map options={{ renderWorldCopies: true }}>
		{#each places as place (place.slug)}
			<MapMarker longitude={place.lng} latitude={place.lat}>
				<MarkerContent>
					<div
						class="bg-primary text-primary-foreground ring-background grid size-8 place-items-center rounded-full shadow-lg ring-2 transition-transform hover:scale-110"
					>
						<MapPin class="size-4" />
					</div>
				</MarkerContent>

				<MarkerTooltip>{place.title}</MarkerTooltip>

				<MarkerPopup class="w-64 p-0" closeButton>
					<div class="space-y-3 p-4">
						<div class="space-y-1.5">
							<Badge variant="secondary">{place.category}</Badge>
							<h2 class="text-base leading-tight font-semibold">{place.title}</h2>
							<p class="text-muted-foreground text-xs">{place.location}</p>
						</div>
						<p class="text-sm leading-snug">{place.summary}</p>
						<Button
							href={resolve("/places/[slug]", { slug: place.slug })}
							size="sm"
							class="w-full"
						>
							Read more
							<ArrowRight />
						</Button>
					</div>
				</MarkerPopup>
			</MapMarker>
		{/each}

		<MapControls position="bottom-right" showZoom showCompass showFullscreen />
	</Map>

	<!-- Floating place index. pointer-events-none lets the map receive drags anywhere around the card. -->
	<div class="pointer-events-none absolute top-0 left-0 z-10 w-full max-w-sm p-3 sm:p-4">
		<Card.Root class="bg-card/90 pointer-events-auto gap-3 py-4 shadow-lg backdrop-blur">
			<Card.Header class="px-4">
				<div class="flex items-center justify-between gap-2">
					<div class="space-y-1">
						<Card.Title class="text-base">Atlas</Card.Title>
						<Card.Description>
							{places.length} landmarks · select a marker to explore
						</Card.Description>
					</div>
					<div class="flex shrink-0 gap-1">
						<Button variant="outline" size="icon-sm" onclick={toggleMode} aria-label="Toggle theme">
							<Sun class="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
							<Moon
								class="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
							/>
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							onclick={() => (listOpen = !listOpen)}
							aria-label={listOpen ? "Hide place list" : "Show place list"}
							aria-expanded={listOpen}
						>
							<ChevronDown class="size-4 transition-transform {listOpen ? 'rotate-180' : ''}" />
						</Button>
					</div>
				</div>
			</Card.Header>

			{#if listOpen}
				<Card.Content class="px-2">
					<ul class="max-h-[50dvh] space-y-0.5 overflow-y-auto">
						{#each places as place (place.slug)}
							<li class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => flyTo(place)}
									class="hover:bg-accent focus-visible:ring-ring/50 min-w-0 flex-1 rounded-md px-2 py-1.5 text-left outline-none focus-visible:ring-[3px]"
								>
									<span class="block truncate text-sm font-medium">{place.title}</span>
									<span class="text-muted-foreground block truncate text-xs">{place.location}</span>
								</button>
								<Button
									href={resolve("/places/[slug]", { slug: place.slug })}
									variant="ghost"
									size="icon-sm"
									aria-label="Open {place.title}"
								>
									<ArrowUpRight />
								</Button>
							</li>
						{/each}
					</ul>
				</Card.Content>
			{/if}
		</Card.Root>
	</div>
</div>
