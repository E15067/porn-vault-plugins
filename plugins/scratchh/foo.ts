import * as scrapers from "./scrapers";


const findScraper = (scraper: string, type: string) => {
  const scraperName = Object.keys(scrapers)
    .find((name: string) => name.toLowerCase().includes(scraper) && name.toLowerCase().includes(type));
  console.log(typeof scraperName);
  return scrapers[scraperName!!];
}

const scraper = findScraper("project1", "actor");
console.log(scraper);
