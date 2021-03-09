import slugs from "./slugs.json";
import { Scraper } from "./Scraper";

import { MySceneContext } from "../main";
import { SceneOutput } from "../../../types/scene";

export abstract class SceneScraper extends Scraper<SceneOutput, MySceneContext> {

  provider = this.ctx.args.provider || this.ctx.scenePath.split(this.ctx.$path.sep)[2];
  actorName = this.ctx.scenePath.split(this.ctx.$path.sep)[3];

  find(sceneName: string): (scene: SceneOutput) => boolean {
    console.log(sceneName);
    return (scene: SceneOutput): boolean => {
      let slug = this.slugify(scene.name!!);
      if (slugs[this.provider]) {
        slug = slug in slugs[this.provider] ? slugs[this.provider][slug] : slug;
      }

      return sceneName.includes(slug) || scene.name!!.trim() === sceneName;
    }
  }
}
