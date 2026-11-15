<script lang="ts">
	import { onMount } from "svelte";
	import { browser } from "$app/env";
	import { page } from "$app/state";
	import { resolve } from "$app/paths";
	import type { Map as MapLibreMap } from "maplibre-gl";
	import MapPin from "@lucide/svelte/icons/map-pin";
	import ArrowRight from "@lucide/svelte/icons/arrow-right";
	import {
		Map,
		MapControls,
		MapMarker,
		MarkerContent,
		MarkerPopup,
		MarkerTooltip,
	} from "#lib/components/ui/map/index.js";
	import { Button } from "#lib/components/ui/button/index.js";
	import { Badge } from "#lib/components/ui/badge/index.js";
	import { getPlaces, type Place } from "#lib/places.js";
	import { fitView } from "#lib/map-view.js";

    const styleUrl = "/map_style.json";
    const styles = { light: styleUrl, dark: styleUrl };

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
	<title>Lonely Plate - BP's Journal of World Cuisine</title>
	<meta
		name="description"
		content="Interactive map of recipes I've cooked!"
	/>
</svelte:head>

<div class="relative h-dvh w-screen overflow-hidden">
	<Map {center} {zoom} {styles} bind:map options={{ renderWorldCopies: true }}>
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
</div>
