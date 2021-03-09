import { Scraper } from "./Scraper";

import { ActorOutput } from "../../../types/actor";
import { MyActorContext } from "../main";

export abstract class ActorScraper extends Scraper<ActorOutput, MyActorContext> {

  provider = this.ctx.args.provider || this.ctx.actorName;
  actorName = this.ctx.actorName;

  find(actorName: string): (actor: ActorOutput) => boolean {
    return (actor: ActorOutput): boolean =>
       (actor.aliases as string[]).includes(actorName) || actor.name === actorName
  }
}
