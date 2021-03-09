import { ActorContext, ActorOutput } from "../../types/actor";

export function capitalize(str: string): string {
  return str.split(" ")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

export interface INationalityOptions {
  ctx: ActorContext;
  actor: ActorOutput;
}

export async function nationality({ ctx, actor }: INationalityOptions): Promise<string | undefined> {
  let { nationality } = ctx.actor;
  if (!nationality && actor.custom.birthPlace) {
    const { data } = await ctx.$axios.get("http://api.geonames.org/search", {
      params: {
        q: actor.custom.birthPlace.replace(/,/g, ""),
        username: "thijssesc",
        type: "json",
        maxRows: 1
      }
    });
    nationality = data.geonames[0]?.countryCode;
  }

  return nationality ?? undefined;
}

export interface IMapOptions {
  concurrency: number;
  stopOnError: boolean;
}

export async function whilst<T>(
  condition: (value: T | undefined) => boolean,
  action: () => T | PromiseLike<T>
): Promise<void> {
	const loop = async (actionResult?: T) => {
		if (condition(actionResult)) {
			return loop(await action());
		}
	}

	return loop();
}
