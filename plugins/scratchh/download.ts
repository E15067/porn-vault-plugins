import { ActorProject1Api } from "./scrapers/Project1Api";
import { whilst } from "./utils";
import { instance } from "./scrapers/Project1Api";

import { MyActorContext } from "./main";

interface ISceneOptions {
  ctx: MyActorContext;
  provider: string;
  actorId: number;
}

interface IWalkOptions {
  ctx: MyActorContext;
  paths: string[];
}

interface IDownloadOptions {
  ctx: MyActorContext;
  actorPath: string;
  scene: any;
}

const scenes = async ({ ctx, provider, actorId }: ISceneOptions): Promise<any[]> => {
  const scenes = new Map();
  const limit = 100;

  let count = 1;
  let offset = 0;

  const Instance = await instance(ctx, provider);
  const endpoint = "https://site-api.project1service.com/v2/releases";
  await whilst(() => count !== 0, async () => {
    const { data } = await ctx.$axios.get(endpoint, {
      headers: { Instance },
      params: { offset, limit, actorId, type: "scene" }
    });

    count = data.meta.count;
    offset += limit;

    data.result.forEach((scene: any) => scenes.set(scene.id, scene));
  });

  return Array.from(scenes.values());
}

const walk = async ({ ctx, paths }: IWalkOptions): Promise<string[]> => {
  const names: Set<string> = new Set();

  const promises = paths.map(async (path: string) => {
    const files = await ctx.$fs.promises.readdir(path);
    files.forEach((file: string) => names.add(file));
  });
  await Promise.all(promises);

  return Array.from(names.values())
    .map((name: string) => name.replace(/\.[^/.]+$/, ""));
}

const download = async ({ ctx, actorPath, scene }: IDownloadOptions): Promise<void> => {
  ctx.$logger.info(`Downloading scene: ${scene.title}"`);
  const url = scene.videos.full.files["1080p"].urls.download;
  const path = ctx.$path.resolve(actorPath, `${scene.title}.mp4`);
  const writer = ctx.$fs.createWriteStream(path);

  const response = await ctx.$axios.get(url, { responseType: "stream" });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = async (ctx: MyActorContext) => {
  const endpoint = "http://localhost:8080/collection/custom_fields";
  const availableFields: object[] = await ctx.$axios.get(endpoint);

  const { customFields } = ctx.actor;
  const fields: any = Object.keys(customFields).reduce((acc, curr) => {
    const foundField: any = availableFields.find((field: any) => field._id === curr);
    if (!foundField) {
      ctx.$throw(`Could not find flied with id: '${curr}'`);
    }

    acc[foundField.name] = customFields[curr];
    return acc;
  }, {});

  if (!fields['Access Token'] || !fields.Provider) {
    return {};
  }

  (ctx.args as any).provider = fields.Provider;

  const api = new ActorProject1Api(ctx, fields['Access Token']);

  const actorPath = ctx.$path.resolve(`/videos/${fields.Provider}/${ctx.actorName}`);
  const togetherPath = ctx.$path.resolve(`/videos/${fields.Provider}/Together`);

  const paths = [actorPath, togetherPath];
  const files = await walk({ ctx, paths });

  const actor = await api.fetch({ query: ctx.actorName });

  if (!actor || !actor.custom.id) {
    ctx.$logger.info(`Could not find actor: '${ctx.actorName}' with provider: '${fields.Provider}'`);
    return {};
  }

  const s = await scenes({
    ctx,
    provider: fields.Provider,
    actorId: actor.custom.id
  });

  const missing = s.filter((scene: any) => !files.includes(scene.name));
  for (const scene of missing) {
    await download({ ctx, actorPath, scene });
  }
  ctx.$logger.info('Done');

  return {};
}
