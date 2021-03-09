import { nationality as fetchNationality } from "./utils";
import * as scrapers from "./scrapers";
import { Scraper } from "./scrapers/Scraper";

import { ActorContext, ActorOutput } from "../../types/actor";
import { SceneContext, SceneOutput } from "../../types/scene";
import { ActorScraper } from "./scrapers/ActorScraper";
import { SceneScraper } from "./scrapers/SceneScraper";

export interface MyActorContext extends ActorContext {
  args: {
    scraper: string;
    provider?: string;
    fetch?: boolean;
  }
}

export interface MySceneContext extends SceneContext {
  args: {
    scraper: string;
    provider?: string;
    fetch?: boolean;
  }
}

interface IActorEventOptions {
  ctx: MyActorContext;
  api: ActorScraper;
}

interface ISceneEventOptions {
  ctx: MySceneContext;
  api: SceneScraper;
}

async function actorEvent({ ctx, api }: IActorEventOptions): Promise<ActorOutput> {
  const actor = await api.fetch({ query: ctx.actorName });
  if (!actor) {
    return {};
  }

  const nationality = await fetchNationality({ ctx, actor });
  let { avatar, thumbnail } = ctx.actor
  if (!thumbnail) {
    thumbnail = await ctx.$createImage(actor.custom.thumbnailHref, `${actor.name} (thumbnail)`);
  }

  if (!avatar) {
    avatar = await ctx.$createImage(actor.custom.thumbnailHref, `${actor.name} (avatar)`);
    const path = `/config/library/images/${avatar}.jpg`;
    const image = await ctx.$jimp.read(path);
    const { width } = image.bitmap;

    image.crop(width, 0, width, width);
    await image.writeAsync(path);
  }

  return {
    ...actor,
    nationality,
    thumbnail,
    avatar
  };
}

async function sceneEvent ({ ctx, api }: ISceneEventOptions): Promise<SceneOutput> {
  const scene = await api.fetch({
    query: ctx.sceneName,
    fetch: ctx.args.fetch ?? true
  });
  if (!scene) {
    return {};
  }

  let thumbnail = ctx.scene.thumbnail || undefined;
  if (ctx.event === "sceneCustom" || (!thumbnail && scene)) {
    thumbnail = await ctx.$createImage(scene.custom.thumbnailHref, `${scene.name} (thumbnail)`);
  }

  return {
    ...scene,
    thumbnail: thumbnail
  };
}

function findScraper(scraper: string, type: string): Scraper {
  const scraperName = Object.keys(scrapers).find((name: string) =>
    name.toLowerCase().includes(scraper) && name.toLowerCase().includes(type));
  return scrapers[scraperName!!];
}


module.exports = async (ctx: MyActorContext | MySceneContext): Promise<ActorOutput | SceneOutput> => {
  if (Object.keys(ctx.data).length !== 0) {
    return ctx.data;
  }

  const { scraper } = ctx.args;

  switch (ctx.event) {
    case "actorCreated":
    case "actorCustom": {
      const Api = findScraper(scraper, "scene");
      const api = new Api(ctx);

      return actorEvent({ ctx: (ctx as MyActorContext), api });
    }
    case "sceneCreated":
    case "sceneCustom": {
      const Api = findScraper(scraper, "scene");
      const api = new Api(ctx);

      return sceneEvent({ ctx: (ctx as MySceneContext), api });
    }
    default:
      ctx.$logger.warn(`Event '${ctx.event}' is not supported for scratchh`);
      return {};
  }
}
