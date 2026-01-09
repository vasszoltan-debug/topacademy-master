import {
  useStoryblokState,
  getStoryblokApi,
  StoryblokComponent,
} from "@storyblok/react";

import HeadComponent from "../components/technicalComponents/HeadComponent/HeadComponent";
import { getTags } from "../functions/services/metaTagService";

const RESOLVE_RELATIONS = [
  "hero.colorcode",
  "leftrightblock.colorcode",
  "course.colorcode",
  "artist.colorcode",
  "song.colorcode",
  "person.colorcode",
  "product.colorcode",
  "location.colorcode",
  "artist.songs",
  "song.artist",
  "course.teachers",
  "course.products",
  "list.elements",
];

export default function Page({ story, preview, socialtags, menu }) {
  // Connect page to Storyblok Visual Editor (bridge)
  story = useStoryblokState(
    story,
    { resolveRelations: RESOLVE_RELATIONS },
    preview
  );

  if (!story?.content) return null;

  return (
    <>
      <HeadComponent socialTags={socialtags} />
      <StoryblokComponent menu={menu} blok={story.content} />
    </>
  );
}

export async function getStaticProps({ params, preview = false }) {
  const slug = params?.slug ? params.slug.join("/") : "home";

  const storyblokApi = getStoryblokApi();

  const sbParams = {
    version: preview ? "draft" : "preview",
    token: process.env.STORYBLOK_API_KEY,
    resolve_relations: RESOLVE_RELATIONS,
  };

  // 1) Get current page story
  let storyRes;
  try {
    storyRes = await storyblokApi.get(`cdn/stories/${slug}`, sbParams);
  } catch (e) {
    return { notFound: true };
  }

  const story = storyRes?.data?.story;
  if (!story) return { notFound: true };

  // 2) Get menu story
  let menuRes;
  try {
    menuRes = await storyblokApi.get(
      "cdn/stories/reusable/headermenu",
      sbParams
    );
  } catch (e) {
    menuRes = null;
  }
  const menu = menuRes?.data?.story || null;

  // 3) Social tags
  const title = story.name || "Page";
  const description = story.content?.tagline ? story.content.tagline : title;

  const baseUrl = process.env.NEXT_PUBLIC_DEPLOY_URL
    ? process.env.NEXT_PUBLIC_DEPLOY_URL.replace(/\/$/, "")
    : "";

  const socialtags = getTags({
    storyblokSocialTag: story.content?.socialtag,
    pageDefaults: {
      "og:title": title,
      "og:description": description,
      "og:url": baseUrl ? `${baseUrl}/${slug}` : `/${slug}`,
    },
  });

  return {
    props: {
      story,
      key: story.id,
      preview,
      socialtags,
      menu,
    },
    revalidate: 10,
  };
}

export async function getStaticPaths() {
  const storyblokApi = getStoryblokApi();

  // IMPORTANT: cdn/links needs token too
  const { data } = await storyblokApi.get("cdn/links/", {
    version: "published",
    token: process.env.STORYBLOK_API_KEY,
  });

  const paths = [];
  Object.keys(data?.links || {}).forEach((linkKey) => {
    const link = data.links[linkKey];
    if (!link || link.is_folder) return;

    // Skip Storyblok's default startpage if you don't want it as a route
    const slug = link.slug;
    if (!slug) return;

    paths.push({ params: { slug: slug.split("/") } });
  });

  return {
    paths,
    fallback: "blocking",
  };
}
