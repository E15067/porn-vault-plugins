// import { Context } from "../../../types/plugin";
import { IItemOptions } from "./Scraper"
// import { MySceneContext } from "../main";
import { SceneScraper } from "./SceneScraper";
import { SceneOutput } from "../../../types/scene";

export class SceneTonightsGirlfriendApi extends SceneScraper {

  itemsSelector = ".panel-body";
  validProviders = ["NaughtyAmerica", "Tonights Girlfriend"];

  endpoint(_: string): string {
    const actorName = this.actorName
      .replace(/[^A-Za-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
    return `/pornstar/${actorName}`;
  }

  item({ $el, items }: IItemOptions<SceneOutput>): void {
    const link = $el.find(".hover-border").attr("href")!!;
    const thumbnailHref = `https:${$el.find(".scene-thumb").attr("src")}`;

    const paths = new URL(thumbnailHref).pathname.split("/");
    const name = `${paths[5]}${paths[6]}`;

    items.set(link, {
      name,
      actors: $el.find(".scene-actors").text().trim().split(","),
      releaseDate: new Date($el.find(".available-date").text().trim()).getTime(),
      custom: {
        link,
        thumbnailHref
      }
    });
  }

  find(sceneName: string): (scene: SceneOutput) => boolean {
    const alt =  sceneName.replace(/^tngf/, "natngf");
    return (scene: SceneOutput): boolean =>
       alt.includes(scene.name!!.trim()) || sceneName.includes(scene.name!!.trim());
  }

  async details(scene: SceneOutput): Promise<SceneOutput> {
    const $ = await this.get(scene.custom.link);

    return {
      ...scene,
      description: $(".scenepage-description").text().trim(),
      custom: {
        thumbnailHref: `https:${$(".scenepage-video > img").attr("src")}`
      }
    };
  }
}
