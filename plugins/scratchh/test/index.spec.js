const plugin = require("../main");
const { expect } = require("chai");
const { createPluginRunner } = require("../../../context");

const actorFixtures = require("./fixtures/actor");
const sceneFixtures = require("./fixtures/scene");

const runPlugin = createPluginRunner("scratchh", plugin);

describe("scratchh", () => {
  it("should skip with incorrect event", async () => {
    const result = await runPlugin({ event: "invalid" });
    expect(result).to.deep.equal({});
  });

  it("should return data from previous context", async () => {
    const data = { name: "name" }
    const result = await runPlugin({ data })
    expect(result).to.deep.equal(data)
  });

  describe("actor", () => {
    describe("actorEvent", () => {
      it("should skip with an invalid provider", async () => {
        const context = {
          event: "actorCreated",
          actorName: "Invalid",
          args: {
            scraper: "metadata",
            provider: "Invalid"
          }
        };
        const result = await runPlugin(context);
        expect(result).to.deep.equal({});
      });
    });

    describe("manyvids", () => {
      actorFixtures.manyvids.forEach(fixture => {
        it(`should fetch an actor from manyvids.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["aliases", "avatar", "bornOn", "custom", "description", "name", "nationality", "thumbnail"]);
          expect(result.custom).to.have.keys(["birthPlace", "thumbnailHref"]);
        });
      });
    });

    describe("metadataapi", () => {
      actorFixtures.metadataapi.forEach(fixture => {
        it(`should fetch an actor from metadataapi.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "aliases", "description", "bornOn", "custom", "nationality", "thumbnail", "avatar"]);
          expect(result.custom).to.have.keys(["id", "thumbnailHref"]);
        });
      });

      actorFixtures.metadataapiFail.forEach(fixture => {
        it(`should fail to fetch an actor from metadataapi.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.deep.equal({});
        });
      });
    });

    describe("project1", () => {
      actorFixtures.babes.forEach(fixture => {
        it(`should fetch an actor from babes.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["aliases", "avatar", "bornOn", "custom", "description", "name", "nationality", "thumbnail"]);
          expect(result.custom).to.have.keys(["birthPlace", "id", "thumbnailHref"]);
        });
      });

      actorFixtures.brazzers.forEach(fixture => {
        it(`should fetch an actor from brazzers.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["aliases", "avatar", "bornOn", "custom", "description", "name", "nationality", "thumbnail"]);
          expect(result.custom).to.have.keys(["birthPlace", "id", "thumbnailHref"]);
        });
      });

      actorFixtures.mofos.forEach(fixture => {
        it(`should fetch an actor from mofos.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["aliases", "avatar", "bornOn", "custom", "description", "name", "nationality", "thumbnail"]);
          expect(result.custom).to.have.keys(["birthPlace", "id", "thumbnailHref"]);
        });
      });

      actorFixtures.realitykings.forEach(fixture => {
        it(`should fetch an actor from realitykings.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["aliases", "avatar", "bornOn", "custom", "description", "name", "nationality", "thumbnail"]);
          expect(result.custom).to.have.keys(["birthPlace", "id", "thumbnailHref"]);
        });
      });
    });
  });

  describe("scene", () => {
    describe("sceneEvent", () => {
      it("should skip with an invalid provider", async () => {
        const context = {
          event: "sceneCreated",
          sceneName: "Invalid",
          scenePath: "/path/to/invalid",
          args: {
            scraper: "metadata",
            provider: "Invalid"
          }
        };
        const result = await runPlugin(context);
        expect(result).to.deep.equal({});
      });
    });

    describe("angelawhite", () => {
      sceneFixtures.angelawhite.forEach(fixture => {
        it(`should fetch a scene from angelawhite.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "thumbnail"]);
          expect(result.custom).to.have.keys(["link", "thumbnailHref"]);
        });
      });
    });

    describe("badoinkvr", () => {
      sceneFixtures.badoinkvr.forEach(fixture => {
        it(`should fetch a scene from badoinkvr.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });

      sceneFixtures.vrcosplayx.forEach(fixture => {
        it(`should fetch a scene from vrcosplayx.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });
    });

    describe("bangbros", () => {
      sceneFixtures.bangbros.forEach(fixture => {
        it(`should fetch a scene from bangbros.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });
    });

    describe("manyvids", () => {
      sceneFixtures.manyvids.forEach(fixture => {
        it(`should fetch a scene from manyvids.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "description", "custom", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        }).timeout(20000);
      });
    });

    describe("metadataapi", () => {
      sceneFixtures.metadataapi.forEach(fixture => {
        it(`should fetch a scene from metadataapi.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });

      actorFixtures.metadataapiFail.forEach(fixture => {
        it(`should fail to fetch a scene from metadataapi.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.deep.equal({});
        });
      });
    });

    describe("naughtyamerica", () => {
      sceneFixtures.naughtyamerica.forEach(fixture => {
        it(`should fetch a scene from naughtyamerica.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        }).timeout(20000);
      });
    });

    describe("naughtyamericavr", () => {
      sceneFixtures.naughtyamericavr.forEach(fixture => {
        it(`should fetch a scene from naughtyamericavr.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        }).timeout(20000);
      });
    });

    describe("tonightsgirlfriend", () => {
      sceneFixtures.tonightsgirlfriend.forEach(fixture => {
        it(`should fetch a scene from tonightsgirlfriend.com with ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom",  "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        }).timeout(20000);
      });
    });

    describe("project1", () => {
      sceneFixtures.babes.forEach(fixture => {
        it(`should fetch a scene from babes.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });

      sceneFixtures.brazzers.forEach(fixture => {
        it(`should fetch a scene from brazzers.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });

      sceneFixtures.mofos.forEach(fixture => {
        it(`should fetch a scene from mofos.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });

      sceneFixtures.realitykings.forEach(fixture => {
        it(`should fetch a scene from realitykings.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom", "studio", "thumbnail"]);
          expect(result.custom).to.have.keys(["thumbnailHref"]);
        });
      });
    });

    describe("wankzvr", () => {
      sceneFixtures.milfvr.forEach(fixture => {
        it(`should fetch a scene from milfvr.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom",  "thumbnail"]);
          expect(result.custom).to.have.keys(["link", "thumbnailHref"]);
        });
      });

      sceneFixtures.wankzvr.forEach(fixture => {
        it(`should fetch a scene from wankzvr.com with event ${fixture.event}`, async () => {
          const result = await runPlugin(fixture);
          expect(result).to.have.keys(["name", "actors", "releaseDate", "description", "custom",  "thumbnail"]);
          expect(result.custom).to.have.keys(["link", "thumbnailHref"]);
        });
      });
    });
  });
});
