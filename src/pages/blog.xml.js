import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
    const posts = await getCollection("posts");
    return rss({
        title: "Krit's Blog",
        description: "A collection of my thoughts and writings.",
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            content: post.body,
            link: `/blog/${post.id}/`,
        })),
    });
}
