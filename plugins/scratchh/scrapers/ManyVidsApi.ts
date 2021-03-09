import { ActorScraper } from "./ActorScraper";
import { SceneScraper } from "./SceneScraper";
import { whilst } from "../utils";

import { ActorOutput } from "../../../types/actor";
import { SceneOutput } from "../../../types/scene";
import { IItemOptions } from "./Scraper"

export const actors = {
  "Alexa Pearl":    { id: 1000945715, slug: "missalexapearl"  },
  "Angel Wicky":    { id: 1002218259, slug: "Angel-Wicky"     },
  "AthenaBlaze":    { id: 4043,       slug: "AthenaBlaze"     },
  "AuroraXoxo":     { id: 494106,     slug: "AuroraXoxo"      },
  "Bea York":       { id: 1000611142, slug: "bea-york"        },
  "Bettie Bondage": { id: 590705,     slug: "bettie-bondage"  },
  "Codi Vore":      { id: 574802,     slug: "codi-vore"       },
  "Jessie Minx":    { id: 147528,     slug: "JessieMinx"      },
  "Karma Rx":       { id: 1000692307, slug: "Karma_Rx"        },
  "Katie Cummings": { id: 1000489998, slug: "katie-cummings"  },
  "Kitty LeRoux":   { id: 379375,     slug: "Kitty_LeRoux"    },
  "korina Kova":    { id: 1000151926, slug: "korina-kova"     },
  "Larkin Love":    { id: 56229 ,     slug: "larkin-love"     },
  "Lena Paul":      { id: 541454,     slug: "lena-paul"       },
  "Lily Madison":   { id: 99,         slug: "Lily-madison"    },
  "Lovely Lilith":  { id: 10545,      slug: "lovely-lilith"   },
  "Mia Malkova":    { id: 1001371669, slug: "Mia-Malkova"     },
  "miki-blue":      { id: 1000650816, slug: "miki-blue"       },
  "nicolebun":      { id: 1003188552, slug: "nicolebun"       },
  "Noelle Easton":  { id: 1000058932, slug: "NoelleEastonxxx" },
  "Sarah Calanthe": { id: 1001061960, slug: "Sarah-Calanthe"  },
  "Siri Dahl":      { id: 1809,       slug: "Siri-Dahl"       },
  "Summer Hart":    { id: 106308,     slug: "ousweetheart"    },
  "Xev Bellringer": { id: 38331,      slug: "Xev-Bellringer"  },
};

export class ActorManyVidsApi extends ActorScraper {

  client = this.ctx.$axios.create({
    baseURL: "https://www.manyvids.com/",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  currentActor = actors[this.provider];
  itemsSelector = ".item-card";
  validProviders = Object.keys(actors);

  endpoint(_: string = ""): string {
    return `/Profile/${this.currentActor.id}/${this.currentActor.slug}/About`;
  }

  item({ $el, items, $ }: IItemOptions<ActorOutput>): void {
    const name = $el.find(".mv-about__banner-name").text().trim();
    const description = $el.find(".mv-about__container__description > p").text().trim();

    const details = new Map();
    $el.find(".mv-about__container__details__list > li").each((_: number, el: cheerio.Element) => {
      const $this = $!!(el);
      const key = $this.find(".mv-about__container__details__list-label").text().trim().toLowerCase();
      const value = $this.find(".mv-about__container__details__list-info").text().trim();

      details.set(key, value);
    })

    const [, thumbnailHref] = $!!(".mv-model-display__container")!!
      .attr("style")!!
      .match(/url\((.*)\)/)!!;

    items.set(name, {
      name,
      description,
      bornOn: new Date(details.get("age")).getTime(),
      aliases: [],
      custom: {
        birthPlace: details.get("nationality"),
        thumbnailHref
      }
    });
  }

  async items(_: string): Promise<ActorOutput[]> {
    const items = new Map();

    const endpoint = this.endpoint();
    const $ = await this.get(endpoint);

    const about = $(".mv-about");
    this.item({ $el: about, items, $ });

    return Array.from(items.values());
  }
}

export class SceneManyVidsApi extends SceneScraper {

  client = this.ctx.$axios.create({
    baseURL: "https://www.manyvids.com/",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest"
    }
  });
  currentActor = actors[this.provider];
  itemsSelector = ".item-card";
  validProviders = Object.keys(actors);

  endpoint(_: string = ""): string {
    return `/Profile/${this.currentActor.id}/${this.currentActor.slug}/About`;
  }

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    items.set($el.preview.path, {
      name: $el.title,
      custom: {
        link: $el.preview.path,
        thumbnailHref: $el.videoThumb
      }
    });
  }

  async items(_: string): Promise<SceneOutput[]> {
    const items = new Map();

    let total = 1;
    let offset = 0;

    const endpoint = this.endpoint();
    const initial = await this.client.get(endpoint);
    const $ = this.ctx.$cheerio.load(initial.data);

    const session = initial.headers["set-cookie"]
      .map((cookie: string) => cookie.split(";")[0])
      .find((cookie: string) => cookie.split("=")[0] === "PHPSESSID");
    const mvToken = $("html").attr("data-mvtoken");

    await whilst(() => offset < total, async () => {
      this.ctx.$logger.info(`Fetching scenes for "${this.provider}" with offset: "${offset}" of total: "${total}"`);
      const params = {
        category: "all",
        sort: 1,
        offset,
        mvtoken: mvToken
      };
      const { data } = await this.client.get(`/api/model/${this.currentActor.id}/videos`, {
        headers: {
          "x-requested-with": "XMLHttpRequest",
          "cookie": session
        },
        params
      });

      offset = data.result.content.newOffset;
      total = data.result.content.totalCount;

      data.result.content.items.forEach(($el: any) => this.item({ $el, items }));
    });

    const values = Array.from(items.values());
    await this.write(values);

    return values;
  }

  async details (item: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(item.custom.link);
    const $el = $(".video-details");

    return {
      actors: [this.provider],
      description: $el.find(".desc-text").text().trim(),
      custom: {
        thumbnailHref: $('.rmp-poster-img').attr('src')
      }
    };
  }
}
