import snovioService from "./snovioService.js";

async function startService(){
    const token = await snovioService.getAccessToken();
    const data = await snovioService.addProspectToList(
        {
            email: 'info@pizza-bucha.com.ua',
            "firstName":"test 5",
            "lastName":"test 4",
            "country":"UA",
          },20096223, token


    )
    console.log(data)
}

startService()