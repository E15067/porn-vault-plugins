import { ActorScraper } from "./ActorScraper";

import { ActorOutput } from "../../../types/actor";
import { Context } from "../../../types/plugin";
import { IItemOptions } from "./Scraper"
import { MyActorContext, MySceneContext } from "../main";
import { SceneScraper } from "./SceneScraper";
import { SceneOutput } from "../../../types/scene";

export const instance = async (ctx: Context, provider: string): Promise<string> => {
  const { headers } = await ctx.$axios.get(`https://site-ma.${provider}.com`);
  const cookies = headers["set-cookie"]
    .flatMap((cookies: string) => cookies.split(";"))
    .map((cookie: string) => cookie.split("="));

  return (new Map(cookies).get("instance_token") as string);
}

export class ActorProject1Api extends ActorScraper {

  validProviders = ["Babes", "Brazzers", "Mofos", "RealityKings", "Twistys"];

  constructor(ctx: MyActorContext, access_token: String = "") {
    super(ctx);
    this.client = ctx.$axios.create({
      baseURL: "https://site-api.project1service.com",
      headers: { Authorization: access_token }
    });
  }

  endpoint(_: string = ""): string {
    return "/v1/actors";
  }

  item({ $el, items }: IItemOptions<ActorOutput>): void {
    items.set($el.name, {
      name: $el.name,
      aliases: $el.aliases.filter((a: string) => a && !!a.trim()),
      description: $el.bio,
      bornOn: new Date($el.birthday).getTime(),
      custom: {
        id: $el.id,
        birthPlace: $el.birthPlace,
        thumbnailHref: $el.images.profile ? $el.images.profile[0].lg.url : ""
      }
    })
  }

  async items(query: string): Promise<ActorOutput[]> {
    this.ctx.$logger.info(`Trying to find actor: "${query}" with provider: "${this.provider}"`);

    const items = new Map();
    const Instance = await instance(this.ctx, this.provider);
    const endpoint = this.endpoint();
    const { data } = await this.client.get(endpoint, {
      headers: { Instance },
      params: { search: query }
    });

    data.result.forEach(($el: any) => this.item({ $el, items }));
    return Array.from(items.values());
  }
}

export class SceneProject1Api extends SceneScraper {

  validProviders = ["Babes", "Brazzers", "Mofos", "RealityKings", "Twistys"];

  constructor(ctx: MySceneContext, access_token: String = "") {
    super(ctx);
    this.client = ctx.$axios.create({
      baseURL: "https://site-api.project1service.com",
      headers: { Authorization: access_token }
    });
  }

  endpoint(_: string = ""): string {
    return "/v2/releases";
  }

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    const actors = $el.actors
      .filter((actor: any) => actor.gender === "female")
      .map((actor: any) => actor.name);

    items.set($el.title, {
      name: $el.title,
      description: $el.description,
      releaseDate: new Date($el.dateReleased).getTime(),
      actors,
      studio: $el.collections.map(({ name }) => name),
      custom: {
        thumbnailHref: $el.images.poster ? $el.images.poster[0].lg.url : ""
      }
    });
  }

  async items(query: string): Promise<SceneOutput[]> {
    this.ctx.$logger.info(`Trying to find scene: "${query}" with provider: "${this.provider}"`);

    const items = new Map();
    const Instance = await instance(this.ctx, this.provider);
    const endpoint = this.endpoint();
    const { data } = await this.client.get(endpoint, {
      headers: { Instance },
      params: {
        search: query,
        type: "scene"
      }
    });

    data.result.forEach(($el: any) => this.item({ $el, items }));
    return Array.from(items.values());
  }
}

