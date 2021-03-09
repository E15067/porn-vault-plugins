import { ActorScraper } from "./ActorScraper";
import { SceneScraper } from "./SceneScraper";

import { ActorOutput } from "../../../types/actor";
import { SceneOutput } from "../../../types/scene";
import { IItemOptions } from "./Scraper"

export class ActorMetadataApi extends ActorScraper {

  client = this.ctx.$axios.create({
    baseURL: "https://metadataapi.net/api/"
  });
  validProviders = ["Babes", "Brazzers", "RealityKings", "MetadataApi"];

  endpoint(query: string): string {
    return `/performers/${query}`;
  }

  item({ $el, items }: IItemOptions<ActorOutput>): void {
    items.set($el.name, {
      name: $el.name,
      aliases: $el.aliases,
      description: $el.bio,
      bornOn: new Date($el.extras.birthday).getTime(),
      nationality: $el.extras.birthplace_code,
      custom: {
        id: $el._id,
        thumbnailHref: decodeURIComponent(`https${$el.image.split("https").pop()}`)
      }
    });
  }

  async items(query: string): Promise<ActorOutput[]> {
    try {
      this.ctx.$logger.info(`Trying to find actor: '${query}' with provider: '${this.provider}'`);

      const items = new Map();
      const slug = query.replace(/[^a-zA-Z]+/g, "-").toLowerCase();
      const endpoint = this.endpoint(slug);
      const res = await this.client.get(endpoint);
      const { data } = res.data;

      this.item({ $el: data, items });
      return Array.from(items.values());
    } catch (err) {
      this.ctx.$logger.error(err);
      return [];
    }
  }
}

export class SceneMetadataApi extends SceneScraper {

  client = this.ctx.$axios.create({
    baseURL: "https://metadataapi.net/api/"
  });
  validProviders = ["Babes", "Brazzers", "RealityKings"];

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    const actors = $el.performers.map((actor: any) => actor.name)
    items.set($el.title, {
      name: $el.title,
      description: $el.description,
      releaseDate: new Date($el.date).getTime(),
      actors,
      custom: {
        thumbnailHref: $el.image
      }
    });
  }

  endpoint(_: string = ""): string {
    return "/scenes";
  }

  async items(query: string): Promise<SceneOutput[]> {
    this.ctx.$logger.info(`Trying to find scene: '${query}' with provider: '${this.provider}'`)

    const items = new Map();
    const endpoint = this.endpoint();
    // const q = this.actorName !== "Together" ? `${this.actorName} ${query}` : query;
    const q = query;
    const res = await this.client.get(endpoint, {
      params: { q }
    })
    const { data } = res.data

    data.forEach(($el: any) => this.item({ $el, items }));
    return Array.from(items.values());
  }

  find(query: string): (item: SceneOutput) => boolean {
    return (item: SceneOutput): boolean =>
      item.name!!.trim().toLowerCase() === query.toLowerCase()
  }
}
