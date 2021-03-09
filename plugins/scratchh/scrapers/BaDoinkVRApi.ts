import { SceneScraper } from "./SceneScraper"

import { IItemOptions } from "./Scraper"
import { SceneOutput } from "../../../types/scene"

export class BaDoinkVRApi extends SceneScraper {

  itemsSelector = ".tile-grid-item";
  client = this.ctx.$axios.create({
    baseURL: `http://${this.provider.toLowerCase()}.com/`
  });
  validProviders = ["BaDoinkVR", "VRCosplayX"];

  endpoint(query: string): string {
    switch (this.provider) {
      case "BaDoinkVR":
        return `/vrpornvideos/search/${query}`;
      case "VRCosplayX":
      default:
        return `/cosplaypornvideos/search/${query}`;
    }
  }

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    const link = $el.find(".video-card-title").attr("href")!!;
    items.set(link, {
      name: $el.find(".video-card-title").text().trim(),
      custom: {
        link,
        thumbnailHref: $el.find(".video-card-image").attr("data-src"),
      }
    });
  }

  unslugify(slug: string): string {
    if (slug.includes("Supergirl")) {
      return "Supergirl";
    }

    return slug.replace(`${this.provider}_`, "")
      .replace("_samsung_180_180x180_3dh_LR", "")
      .replace("_samsung_180_180x180_3dh", "")
      .replace(/_/g, " ");
  }

  slugify(name: string): string {
    const slug = name
      .replace(/"/g, " ")
      .replace(/[^0-9A-Za-z-\s]/g, "")
      .replace(/\s/g, "_")
      .replace(/__/g, "_");
    return `${this.provider}_${slug}_samsung_180_180x180_3dh`;
  }

  async details(scene: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(scene.custom.link);
    const $el = $(".video-preview");

    const data = {
      name: $el.find(".video-title").text().trim(),
      actors: $el.find(".video-actors > a").map((_: number, el: cheerio.Element) => $(el).text().trim()).get(),
      releaseDate: new Date($el.find(".video-upload-date").attr("content")!!).getTime(),
      description: $el.find(".video-description").text().trim(),
    };

    return {
      ...scene,
      ...data,
      custom: {
        thumbnailHref: $el.find(".video-image").attr("src")
      }
    };
  }

  find(sceneName: string): (scene: SceneOutput) => boolean {
    return (scene: SceneOutput): boolean => {
      if (sceneName.includes("VRCosplayX_Supergirl_A_XXX_Parod_samsung_180_180x180_3dh")) {
        return scene.custom.link.includes("325250");
      } else if (sceneName.includes("VRCosplayX_Supergirl_XXX_Parody_samsung_180_180x180_3dh")) {
        return scene.custom.link.includes("323611");
      }

      return super.find(sceneName)(scene)
    }
  }
}
