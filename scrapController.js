import searchGoogleMaps from './scrapService.js'
import snovioService from "./snovioService.js";
import XLSX from 'xlsx'
import url from 'url'

class scrapController{
    async scrapGoogle(req, res){
        try{
            const reqString = req.body.reqString
            console.log('start search by: ', reqString)
            const data = await searchGoogleMaps(reqString)
            const domains = []
            if (data.length>0){
                for (const el of data){
                    if(el.site){
                        const parsedUrl = new URL(el.site);
                        let domain = parsedUrl.hostname;
                        domain = domain.replace(/^www\./, '');
                        domains.push(domain)
                    }
                }
            }
            const contacts = []
            const token = await snovioService.getAccessToken();
            if(domains.length>0){
                for(const domain of domains){
                    console.log('start search by ', domain)
                    const data = await snovioService.getDomainSearch(domain,token)
                    contacts.push(...data)
                }
            }

            const list = {}
            if(contacts.length>0){
                try{
                    const createdList = await snovioService.createNewList(reqString, token)
                    if(createdList){
                        list.id = createdList.id
                        list.name = reqString
                    }
                    
                }catch(e){
                    throw new Error(e)
                }
            }
            console.log('list: ', list)

            if(list.id){
                for(const contact of contacts){
                    await snovioService.addProspectToList(contact, list.id, token)
                }
            } 

            
            
            
            res.status(200).json(list)
            
        }catch(e){
            res.status(500).json(e.message)
        }
    }
}

export default new scrapController()