<script lang="ts">
  import { browser } from "$app/env";
  import { page } from "$app/state";
  import { resolve } from "$app/paths";
  import type { Map as MapLibreMap } from "maplibre-gl";
  import {
    WineIcon,
    SoupIcon,
    CroissantIcon,
    CandyIcon,
  } from "@lucide/svelte/icons";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerPopup,
    MarkerTooltip,
  } from "#lib/components/ui/map/index.js";
  import { Button } from "#lib/components/ui/button/index.js";
  import { getPlaces } from "#lib/places.js";
  import { fitView } from "#lib/map-view.js";
  import type { Component } from "svelte";

  const iconMap: Record<string, Component> = {
    Drink: WineIcon,
    Snack: CroissantIcon,
    Main: SoupIcon,
    Dessert: CandyIcon,
  };

  const styleUrl = "/map_style.json";
  const styles = { light: styleUrl, dark: styleUrl };

  const recipes = getPlaces();

  let map = $state<MapLibreMap | null>(null);

  // `?place=slug` (used by the "View on map" link on each article) opens the map centred on that marker.
  // url.searchParams can't be read while pre-rendering, so this only runs in the browser.
  const focused = browser
    ? recipes.find((r) => r.slug === page.url.searchParams.get("recipe"))
    : undefined;

  // Frame every marker on first load, keeping clear of the floating card (left on desktop, top on mobile).
  // The map is only created in the browser, so the server-side values are placeholders.
  function initialView(): { center: [number, number]; zoom: number } {
    if (!browser) return { center: [0, 20], zoom: 1 };
    if (focused) return { center: [focused.lng, focused.lat], zoom: 5 };

    const wide = window.innerWidth >= 1024;
    return fitView(
      recipes,
      { width: window.innerWidth, height: window.innerHeight },
      wide
        ? { top: 80, right: 80, bottom: 80, left: 420 }
        : { top: 150, right: 40, bottom: 90, left: 40 },
    );
  }

  const { center, zoom } = initialView();
</script>

<svelte:head>
  <title>Lonely Plate - BP's Journal of World Cuisine</title>
  <meta name="description" content="Interactive map of recipes I've cooked!" />
</svelte:head>

<div class="relative h-dvh w-screen overflow-hidden">
  <Map {center} {zoom} {styles} bind:map options={{ renderWorldCopies: true }}>
    {#each recipes as recipe (recipe.slug)}
      {@const Icon = iconMap[recipe.category] ?? SoupIcon}
      <MapMarker longitude={recipe.lng} latitude={recipe.lat}>
        <MarkerContent>
          <div
            class="bg-amber-200 text-red-950 ring-red-900 grid size-8 place-items-center rounded-full shadow-lg ring-2 transition-transform hover:scale-110"
          >
            <Icon class="size-4" />
          </div>
        </MarkerContent>

        <MarkerTooltip>{recipe.title}</MarkerTooltip>

        <MarkerPopup class="w-64 p-0" closeButton>
          <div class="space-y-3 p-4">
            <div class="space-y-1.5">
              <h2 class="text-base leading-tight font-semibold">
                {recipe.title}
              </h2>
              <p class="text-muted-foreground text-xs">{recipe.location}</p>
            </div>
            <p class="text-sm leading-snug">{recipe.summary}</p>
            <Button
              href={resolve("/recipes/[slug]", { slug: recipe.slug })}
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
  </Map>

  <div
    class="pointer-events-none absolute top-0 left-0 right-0 z-10 w-full text-center"
  >
    <div class="bg-amber-100/50 p-1">
      <h1 class="text-black text-5xl p-3">Lonely Plate!</h1>
      <p class="text-black">
        BP's collection of recipes from around the world!
      </p>
    </div>
  </div>
</div>
