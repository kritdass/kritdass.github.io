import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
    site: "https://kritdass.github.io",
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [icon(), sitemap()],
    prefetch: { prefetchAll: true },
    image: {
        domains: ["goodreads.com"],
    },
    markdown: {
        shikiConfig: {
            themes: {
                light: "one-light",
                dark: "nord",
            },
        },
        remarkPlugins: [remarkReadingTime],
    },
});