import puppeteer from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

class PuppeteerService{
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async getPage(queryString){

        //puppeteerExtra.use(stealthPlugin());
  
    
        this.browser = await puppeteer.launch({
           args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            '--disable-web-security',
            '--disable-features=IsolateOrigins',
            '--disable-site-isolation-trials',
          ], 
            headless: "new",
            executablePath: "/usr/bin/google-chrome",
        });
    
        this.page = await this.browser.newPage()
        this.page.setDefaultNavigationTimeout(500000);
        await this.page.setCacheEnabled(false)
        await this.page.reload({waitUntil: 'networkidle2'});
    
        try {
          const acceptButtonSelector = 'button[aria-label="Accept all"]';
            await this.page.goto(queryString);
            //await this.page.waitForSelector(acceptButtonSelector, { visible: true, timeout: 60000 }); // Очікування протягом 10 секунд.
            const acceptButtons = await this.page.$$('button[aria-label="Accept all"]')

            if (acceptButtons.length > 0) {
              console.log('button count: ',acceptButtons.length)
              /* for (let i = 1; i < acceptButtons.length; i++) {
                const buttonText = await acceptButtons[i].evaluate(button => button.innerText);
                console.log('Button text:', buttonText);
                
                const buttonAttributes = await acceptButtons[i].evaluate(button => {
                  const attributes = {};
                  for (const attr of button.attributes) {
                    attributes[attr.name] = attr.value;
                  }
                  return attributes;
                });
                console.log('Button attributes:', buttonAttributes);
                
                // Тут можна виконати подальші дії з кожною кнопкою.
                await acceptButtons[i].click();
                
                console.log('Clicked on "Accept all" button.', i + 1);
              } */
              await acceptButtons[0].click();
              console.log('Clicked on "Accept all" button.', 1);
              await this.page.waitForSelector(acceptButtonSelector, { visible: true, timeout: 2000 }); // Очікування протягом 10 секунд.
            } else {
              console.log('Buttons not found.');
            }
        } catch (error) {
            console.log("error going to page", error.message);
        }
        
        return this.page
    }

    async close(){
        
        await this.browser.close();
        
    }

    async getButtons(){
      const aTags = await this.page.$$('a');
      const buttons = [];
      for (const aTag of aTags) {
        const href = await this.page.evaluate(element => element.getAttribute('href'), aTag);
        if(href){
          if (href.includes('/maps/place/')) {
            buttons.push(aTag);
          }
        }
      }
      return buttons
    }


    async getLinks(){
      const aTags = await this.page.$$('a');
      const buttons = [];
      for (const aTag of aTags) {
        const href = await this.page.evaluate(element => element.getAttribute('href'), aTag);
        if(href){
          if (href.includes('/maps/place/')) {
            buttons.push(href);
          }
        }
      }
      return buttons
    }


    async surfLinks(buttons, usedButtons,result){
      if(buttons.length > 0){
        console.log('count of buttons',buttons.length)
        for(const button of buttons){
          const href = await this.page.evaluate(element => element.getAttribute('href'), button);
          console.log('href: ',href)
          if (usedButtons.includes(href)){
            continue
          }
          usedButtons.push(href)
          const busData = {}
          
          console.log('button click')
          await button.click()
          console.log('button click after')
          try{
            await this.page.waitForSelector('button[aria-label="Accept all"]', { visible: true, timeout: 4000 })
          }catch(e){
            console.log('delay 4 sec')
          }
          
          console.log('try to get role=main')
          const elementWithTabIndex = await this.page.$$('[role="main"]');
          console.log('role=main elements:', elementWithTabIndex.length)
          if (elementWithTabIndex[0]) {
           
            const elementAtIndex1 = elementWithTabIndex[0];
            /* console.log('returning html')
            const data =  await page.evaluate(element => element.outerHTML, elementWithTabIndex);
            return data */
            
            const busName = await elementAtIndex1.evaluate(element => element.getAttribute('aria-label'));
            console.log('Значення атрибуту aria-label: ', busName);
            busData.busName = busName
            const linkElement = await elementAtIndex1.$('a[data-item-id="authority"]');
            if(linkElement){
              const site = await linkElement.evaluate(element => element.getAttribute('href'));
              console.log('Значення атрибуту data-item-id: ', site.replace(/\?.*$/, ""));
              busData.site = site
            }
            const divPhone = await elementAtIndex1.$('button[data-item-id*="phone"]');
            if (divPhone) {
              const textContent = await divPhone.evaluate(element => element.getAttribute('data-item-id'));
              const phoneNumber = textContent.replace(/\D/g, '');
              console.log('Текст елемента phone: ', phoneNumber);
              busData.phoneNumber = phoneNumber
            }
            //const closeButton = await elementAtIndex1.$('button[aria-label="Close"]');
            await this.page.evaluate(() => {
              window.history.back(); // Викликаємо функцію перехіду назад через історію браузера
            });
            await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
            console.log('go back')
            try{
              await this.page.waitForSelector('button[aria-label="Accept all"]', { visible: true, timeout: 4000 })
            }catch(e){
              console.log('delay 2 sec, trying go back')
            } 
            
          } else{console.log('index not found')}
          result.push(busData)
          const refreshButtons = await this.getButtons()
          await this.surfLinks(refreshButtons, usedButtons,result)
        }
      }
    }



    async surfLinks2(buttons, usedButtons,result){
      if(buttons.length > 0){
        console.log('count of buttons',buttons.length)
        for(const button of buttons){
          console.log('button click')
          await this.page.goto(button)
          const busData = {}
          
          /* try{
            await this.page.waitForSelector('button[aria-label="Accept all"]', { visible: true, timeout: 1000 })
          }catch(e){
            console.log('delay 1 sec')
          } */
          console.log('button click after')
          
          
          console.log('try to get role=main')
          const elementWithTabIndex = await this.page.$$('[role="main"]');
          console.log('role=main elements:', elementWithTabIndex.length)
          if (elementWithTabIndex[0]) {
           
            const elementAtIndex1 = elementWithTabIndex[0];
            /* console.log('returning html')
            const data =  await page.evaluate(element => element.outerHTML, elementWithTabIndex);
            return data */
            
            const busName = await elementAtIndex1.evaluate(element => element.getAttribute('aria-label'));
            console.log('Значення атрибуту aria-label: ', busName);
            busData.busName = busName
            const linkElement = await elementAtIndex1.$('a[data-item-id="authority"]');
            if(linkElement){
              const site = await linkElement.evaluate(element => element.getAttribute('href'));
              console.log('Значення атрибуту data-item-id: ', site.replace(/\?.*$/, ""));
              busData.site = site
            }
            const divPhone = await elementAtIndex1.$('button[data-item-id*="phone"]');
            if (divPhone) {
              const textContent = await divPhone.evaluate(element => element.getAttribute('data-item-id'));
              const phoneNumber = textContent.replace(/\D/g, '');
              console.log('Текст елемента phone: ', phoneNumber);
              busData.phoneNumber = phoneNumber
            }
            //const closeButton = await elementAtIndex1.$('button[aria-label="Close"]');
            
            
          } else{console.log('index not found')}
          result.push(busData)
          await this.page.deleteCookie()
        }
      }
    }


    
    async autoScroll(maxScrolls) {
        await this.page.evaluate(async () => {
          const wrapper = document.querySelector('div[role="feed"]');
          
          await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let scrolls = 0
            const distance = 300;
            const scrollDelay = 300;//3000;
            const timer = setInterval(async () => {
              const scrollHeightBefore = wrapper.scrollHeight;
              wrapper.scrollBy(0, distance);
              totalHeight += distance;
              scrolls++
              if (totalHeight >= scrollHeightBefore) {
                totalHeight = 0;
                await new Promise((resolve) => setTimeout(resolve, scrollDelay));
                let scrollHeightAfter = wrapper.scrollHeight;
                if (scrollHeightAfter > scrollHeightBefore && scrolls < maxScrolls) {
                  return;
                } else {
                  // No more content loaded, stop scrolling
                  clearInterval(timer);
                  resolve();
                }
              }
            }, 100);
          });
        });
    }
    
}


export default  new PuppeteerService



