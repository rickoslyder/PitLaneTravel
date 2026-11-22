/**
 * Above-the-fold class list for /races. Tailwind generates utilities only for
 * these tokens. The races page test fails if the hero, header, or shell gains
 * a static class that is missing here, so the inlined sheet can be regenerated.
 */
export const racesCriticalClassMarkup = `
<body class="bg-background mx-auto min-h-screen w-full antialiased motion-safe:scroll-smooth">
<a class="sr-only">Skip</a>
<div class="flex min-h-screen min-w-0 flex-col">
<div class="min-h-0 w-full flex-1 lg:!top-16 lg:!bottom-auto lg:!h-[calc(100svh-4rem)]"></div>
<div class="flex min-h-svh w-full">
<div class="hidden lg:block lg:flex"></div>
<main class="bg-background relative flex min-h-svh w-full min-w-0 flex-1 flex-col">
<div class="flex min-h-screen flex-col">
<header class="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
<div class="flex h-14 min-w-0 items-center gap-2 px-3 sm:gap-4 sm:px-4">
<button class="inline-flex size-7 shrink-0 items-center justify-center rounded-md -ml-1 sm:-ml-2">
<span class="size-4"></span>
</button>
<div class="bg-border h-6 w-[1px] shrink-0"></div>
<div class="flex min-w-0 flex-1 items-center justify-between gap-2">
<nav class="min-w-0">
<ol class="text-muted-foreground flex flex-wrap items-center gap-1.5 break-words text-sm sm:gap-2.5">
<li class="inline-flex items-center gap-1.5">
<a class="transition-colors"></a>
</li>
<li class="[&>svg]:size-3.5"></li>
</ol>
</nav>
</div>
</div>
</header>
<div class="min-w-0 flex-1">
<div class="flex-1 space-y-8 p-4 pt-0">
<div class="bg-background">
<div class="bg-background relative overflow-hidden py-4 sm:py-32">
<div class="absolute inset-0 -z-10 size-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]">
<div class="bg-primary absolute inset-x-0 top-0 -z-10 m-auto size-[310px] rounded-full opacity-20 blur-[100px]"></div>
</div>
<div class="mx-auto max-w-7xl px-6 lg:px-8">
<div class="mx-auto max-w-2xl text-center">
<h1 class="text-4xl font-bold tracking-tight sm:text-6xl"></h1>
<p class="text-muted-foreground mt-6 text-lg leading-8"></p>
</div>
</div>
</div>
</div>
<div class="space-y-8">
<div class="bg-card text-card-foreground mx-auto max-w-7xl rounded-lg border p-6 shadow-sm shadow">
<h2 class="mb-6 text-center text-2xl font-bold"></h2>
<div class="mb-6 flex flex-wrap justify-center gap-2">
<button class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors bg-primary text-primary-foreground border-transparent"></button>
<button class="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors bg-background hover:bg-muted"></button>
<button class="bg-foreground text-background border-transparent"></button>
<button class="bg-background text-foreground hover:bg-muted"></button>
</div>
<div class="space-y-6">
<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div class="flex items-center gap-3">
<div class="relative flex-1">
<svg class="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2"></svg>
<input class="border-input bg-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-base pl-9 md:text-sm" />
</div>
<button class="border-input bg-background inline-flex size-10 items-center justify-center rounded-md border"></button>
</div>
<div class="flex items-center gap-2">
<button class="bg-brand text-brand-foreground inline-flex size-10 items-center justify-center rounded-md text-sm font-medium"></button>
<button class="hover:bg-accent hover:text-accent-foreground inline-flex size-10 items-center justify-center rounded-md"></button>
</div>
</div>
<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
<article class="bg-card text-card-foreground group h-full cursor-pointer rounded-lg border shadow-sm">
<div class="contents">
<div class="flex flex-col space-y-1.5 p-6 pb-4">
<div class="relative aspect-[16/9] overflow-hidden rounded-lg">
<div class="absolute left-2 top-2 z-10 flex gap-1.5"></div>
<img class="object-cover" />
</div>
</div>
<div class="space-y-2.5 p-6 pt-0">
<h3 class="line-clamp-2 font-semibold"></h3>
<div class="text-muted-foreground flex flex-col gap-2 text-sm">
<div class="flex items-center gap-1"><svg class="size-3.5"></svg></div>
</div>
</div>
<div class="flex items-center p-6 pt-0">
<div class="flex w-full flex-col gap-2">
<a class="bg-brand text-brand-foreground inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium"></a>
<a class="border-input bg-background inline-flex h-10 w-full items-center justify-center rounded-md border px-4 py-2 text-sm font-medium"></a>
</div>
</div>
</div>
</article>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
<div class="bg-muted rounded-full p-3"><svg class="size-6"></svg></div>
<h3 class="font-semibold tracking-tight"></h3>
</div>
</main>
</div>
<section class="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-300 bg-white text-zinc-900 shadow-[0_-6px_20px_rgba(28,25,22,0.16)]">
<div class="mx-auto flex w-full max-w-6xl flex-col gap-2 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-2.5">
<div class="min-w-0 flex-1 text-xs leading-4 text-zinc-800 sm:text-sm sm:leading-5">
<h2 class="inline text-sm font-semibold leading-5 text-zinc-900"></h2>
<p class="inline"></p>
<a class="inline-block min-h-6 font-medium underline underline-offset-2"></a>
<details class="inline">
<summary class="inline-block min-h-6 cursor-pointer font-medium text-zinc-900"></summary>
<p class="mt-1"></p>
</details>
</div>
<div class="grid w-full shrink-0 grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:gap-2">
<button class="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-md border border-zinc-900 bg-zinc-900 px-1.5 py-2 text-xs font-medium text-white sm:w-44 sm:px-3 sm:text-sm"></button>
</div>
</div>
</section>
`

/** Static className attributes these files must keep represented in the markup. */
export const racesCriticalClassSources = [
  "components/races/HeroSection.tsx",
  "app/races/layout.tsx"
] as const
