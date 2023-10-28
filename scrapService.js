import * as cheerio from "cheerio";
import PuppeteerService from "./browserService.js";

export default async function searchGoogleMaps(query) {
  try {
    
    const start = Date.now()
    const queryFin = `https://www.google.com/maps/search/${query.split(" ").join("+")}`;
    const browser = PuppeteerService;
    
    const page = await browser.getPage(queryFin);
    console.log('start autoscroll')
    await browser.autoScroll();
    console.log('afrer scrolling')
    
    const buttons = await PuppeteerService.getLinks()

    const result = []
    const usedButtons =[]
    await PuppeteerService.surfLinks2(buttons, usedButtons,result)
    const pages = await browser.browser.pages()
    await Promise.all(pages.map((page) => page.close()));
    await browser.close();
    return result;
  } catch (error) {
    console.log("error at googleMaps", error);
  }
}
