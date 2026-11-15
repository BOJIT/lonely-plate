<script lang="ts">
  import { resolve } from "$app/paths";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import MapPin from "@lucide/svelte/icons/map-pin";
  import Soup from "@lucide/svelte/icons/soup";
  import { Button } from "#lib/components/ui/button/index.js";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // The compiled markdown file is a Svelte component, so it renders like any other.
  const Content = $derived(data.content);
  const recipe = $derived(data.recipe);
</script>

<svelte:head>
  <title>Recipe - {recipe.title}</title>
  <meta name="description" content={recipe.summary} />
</svelte:head>

<main class="mx-auto min-h-dvh max-w-2xl px-4 py-8 sm:py-12 bg-ochre-light">
  <Button href={resolve("/")} variant="ghost" size="sm" class="-ml-3 mb-6">
    <ArrowLeft />
    All recipes
  </Button>

  <header class="mb-8 space-y-3">
    <h1 class="text-4xl font-bold tracking-tight">{recipe.title}</h1>
    <p class="text-muted-foreground flex items-center gap-1.5 text-sm">
      <MapPin class="size-4" />
      {recipe.location}
      <span aria-hidden="true">·</span>
      <span class="tabular-nums"
        >{recipe.lat.toFixed(4)}, {recipe.lng.toFixed(4)}</span
      >
    </p>
    <p class="text-lg leading-relaxed">{recipe.summary}</p>
  </header>

  {#if recipe.image}
    <div class="flex items-center justify-center">
      <img
        src="{resolve('/')}img/{recipe.image}"
        alt={recipe.title}
        class="rounded-full w-full md:w-1/2 p-2 object-center"
      />
    </div>
    <div class="mt-10 border-t border-black pt-6 flex gap-1"></div>
  {/if}

  <article class="prose prose-zinc dark:prose-invert max-w-none">
    <Content />
  </article>

  <div class="mt-10 border-t border-black pt-6 flex gap-1">
    <Button href="{resolve('/')}?recipe={recipe.slug}">
      <MapPin />
      View on map
    </Button>
    {#if recipe.link}
      <Button href={recipe.link}>
        <Soup />
        Go to Recipe
      </Button>
    {/if}
  </div>
</main>

<style>
  :global(body) {
    background: #ecd5a0;
  }
</style>
