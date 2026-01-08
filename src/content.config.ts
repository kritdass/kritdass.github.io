import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import xml2js from "xml2js";
import { getSecret } from "astro:env/server";
import { glob } from "astro/loaders";

const GOODREADS_URL =
    "https://www.goodreads.com/review/list_rss/180065380?order=d&shelf=read&sort=date_read";

const books = defineCollection({
    schema: z.object({
        title: z.string(),
        pages: z.coerce.number(),
        date: z.coerce.date().nullable(),
        rating: z.coerce.number(),
        author: z.string(),
        cover: z.string(),
    }),
    loader: async () => {
        const response = await fetch(GOODREADS_URL);
        const xml = await response.text();
        const json = await xml2js.parseStringPromise(xml);
        return json.rss.channel[0].item.map((item: any) => ({
            id: item.book_id[0],
            title: item.title[0],
            pages: item.book[0].num_pages[0],
            date: item.user_read_at[0] || null,
            rating: item.user_rating[0],
            author: item.author_name[0],
            cover: item.book_small_image_url[0],
        }));
    },
});

const projectsList = [
    "kritdass/kod",
    "kritdass/kritdass.github.io",
    "kritdass/pytch",
    "kritdass/aoc2025",
];

const headers = {
    "User-Agent": "kritdass.github.io",
    Accept: "application/vnd.github+json",
    Authorization: `token ${getSecret("GITHUB_TOKEN")}`,
};

const projects = defineCollection({
    schema: z.object({
        title: z.string(),
        description: z.string().nullable(),
        href: z.string().url(),
        languages: z.array(z.string()).max(3),
        stars: z.number().min(0),
    }),
    loader: async () =>
        Promise.all(
            projectsList.map(async (project) => {
                const projectResponse = await fetch(
                    `https://api.github.com/repos/${project}`,
                    { headers },
                );

                const json = await projectResponse.json();

                const languagesResponse = await fetch(
                    `https://api.github.com/repos/${project}/languages`,
                    { headers },
                );
                const languagesJson = await languagesResponse.json();

                return {
                    id: json.id.toString(),
                    title: json.name,
                    description: json.description,
                    href: json.html_url,
                    languages: Object.keys(languagesJson).slice(0, 3),
                    stars: json.stargazers_count,
                };
            }),
        ),
});

const CURRENTLY_READING_URL =
    "https://www.goodreads.com/review/list_rss/180065380?order=d&shelf=currently-reading&sort=date_read";

const reading = defineCollection({
    schema: z.object({
        title: z.string(),
    }),
    loader: async () => {
        const response = await fetch(CURRENTLY_READING_URL);
        const xml = await response.text();
        const json = await xml2js.parseStringPromise(xml);
        const items = json.rss.channel[0].item || [];
        return items.map((item: any) => ({
            id: item.book_id[0],
            title: item.title[0],
        }));
    },
});

const posts = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/blog" }),
    schema: z.object({
        title: z.string(),
        date: z.coerce.date(),
        description: z.string(),
    }),
});

export const collections = {
    books,
    projects,
    reading,
    posts,
};
