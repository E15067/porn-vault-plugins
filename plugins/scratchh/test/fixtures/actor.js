const $jimp = {
  read: () => ({
    crop: () => {},
    writeAsync: async () => {},
    bitmap: {
      width: 480
    }
  })
};

const manyvids = [{
  $jimp,
  event: "actorCreated",
  actorName: "Xev Bellringer",
  actor: {},
  args: {
    scraper: "manyvids"
  }
}];

const metadataapi = [{
  $jimp,
  event: "actorCreated",
  actorName: "Angela White",
  actor: {},
  args: {
    scraper: "metadata",
    provider: "MetadataApi"
  }
}];

const metadataapiFail = [{
  $jimp,
  event: "actorCreated",
  actorName: "invalid",
  actor: {},
  args: {
    scraper: "metadata",
    provider: "MetadataApi"
  }
}];

const babes = [{
  $jimp,
  event: "actorCreated",
  actorName: "Angela White",
  actor: {},
  args: {
    scraper: "project1",
    provider: "Babes"
  }
}];

const brazzers = [{
  $jimp,
  event: "actorCreated",
  actorName: "Angela White",
  actor: {},
  args: {
    scraper: "project1",
    provider: "Brazzers"
  }
}, {
  $jimp,
  event: "actorCreated",
  actorName: "Sensual Jane",
  actor: {
    avatar: "avatar",
    thumbnail: "thumbnail"
  },
  args: {
    scraper: "project1",
    provider: "Brazzers"
  }
}];

const mofos = [{
  $jimp,
  event: "actorCreated",
  actorName: "Angela White",
  actor: {},
  args: {
    scraper: "project1",
    provider: "Mofos"
  }
}];

const realitykings = [{
  $jimp,
  event: "actorCreated",
  actorName: "Angela White",
  actor: {},
  args: {
    scraper: "project1",
    provider: "RealityKings"
  }
}];

module.exports = {
  manyvids,
  metadataapi,
  metadataapiFail,
  babes,
  brazzers,
  mofos,
  realitykings
};
