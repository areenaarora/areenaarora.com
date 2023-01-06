# HOW I DID IT

This rendition of my website is the seventh or maybe eighth one, and I've learned a ton along the way! I've built this version with SvelteKit (process from the template elaborated below). I won't go into details on how to use SvelteKit — there are tutorials out there far more comprehensive than anything I'll be able to write. But, here are a couple tips I do have:

- Start with something simple.
- Right now, the only svelte components I have on the website are a header and a footer.
- Understand, really really UNDERSTAND, how SvelteKit's structure works— pages and layout files and where to place them.

Hope it helps!

### Notes from SvelteKit template below:

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
