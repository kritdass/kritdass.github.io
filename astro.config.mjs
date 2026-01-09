import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import { remarkReadingTime } from "./remark-reading-time.mjs";

import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import astroExpressiveCode from "astro-expressive-code";
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
    site: "https://kritdass.github.io",
    vite: {
        plugins: [tailwindcss()],
    },
    integrations: [
        icon(),
        sitemap(),
        astroExpressiveCode({
            themes: ["one-dark-pro", "one-light"],
            themeCssSelector: (theme) =>
                `[data-theme="${theme.name == "one-dark-pro" ? "dark" : "light"}"]`,
        }),
    ],
    prefetch: { prefetchAll: true },
    image: {
        domains: ["goodreads.com"],
    },
    markdown: {
        remarkPlugins: [remarkReadingTime],
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap" }],
            [
                rehypeExternalLinks,
                { target: "_blank", rel: "noopener noreferrer" },
            ],
        ],
    },
});
