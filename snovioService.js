import dotenv from 'dotenv'
import fetch from 'node-fetch'
dotenv.config()

class SnovioService{

    async  getAccessToken() {
        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: '4bb1252a493854218ae66d7d554c9280',
            client_secret: 'f040ca0e6ca781a67508e53cad510e58'
        });

        const options = {
            method: 'POST',
            body: params,
        };

        try {
            const response = await fetch('https://api.snov.io/v1/oauth/access_token', options);
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error fetching access token:', error);
            return null;
        }
    }

    async getWithParams(domain, token){
        const params = new URLSearchParams(Object.entries({
            access_token: token,
            domain: domain,
            type: 'all',
            limit: 45,
            lastId: 0
        }))

        const positions =  ['CTO','CEO','Founder','Co-founder', 'Chief Executive Officer','Chief Technology Officer','Project Manager','PM','Business Analyst','BA']
        let query = params.toString()
        if(positions.length>0){
            for(let i=0;i<positions.length; i++){
                query = query + `&positions[${i}]=${encodeURIComponent(positions[i])}`
            }
        }

        const url = `https://api.snov.io/v2/domain-emails-with-info?${query}`;
        
        const options = {
            method: 'GET',
        };
        let result = []
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            if(data.data){
                for(const el of data.data){
                    result.push(el)
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            
        }
        return result
    }

    async getWithoutParams(domain, token){
        const params = new URLSearchParams(Object.entries({
            access_token: token,
            domain: domain,
            type: 'generic',
            limit: 5,
            lastId: 0
        }))

        let query = params.toString()

        const url = `https://api.snov.io/v2/domain-emails-with-info?${query}`;
        
        const options = {
            method: 'GET',
        };
        let result = []
        try {
            const response = await fetch(url, options);
            const data = await response.json();
            console.log(data.data)
            if(data.data){
                for(const el of data.data){
                    result.push(el)
                }
            }
            
        } catch (error) {
            console.error('Error:', error);
            
        }
        return result
    }

    async  createNewList(name, token) {
        console.log('start creating list with params: ', name)
        const params = {
            access_token: token,
            name: name
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        };
    
        try {
            const response = await fetch('https://api.snov.io/v1/lists', options);
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error:', error);
        }
    }


    async  getDomainSearch(domain, token) {

        const resultWithParams = await this.getWithParams(domain, token)

        const resultWithoutParams = await this.getWithoutParams(domain, token)

        const totalResult = Array.from(new Set([...resultWithParams, ...resultWithoutParams]))
        
        return totalResult
        
    }

    convertToCamelCase(str) {
        return str.replace(/_([a-z])/g, function (match) {
            return match[1].toUpperCase();
        }).replace(/^./, function(match) {
            return match.toLowerCase();
        });
    }

    getSocialNetworkFromLink(link) {
        if (link.includes('linkedin.com/')) {
            return 'linkedIn';
        } else if (link.includes('facebook.com')) {
            return 'facebook';
        } else if (link.includes('twitter.com')) {
            return 'twitter';
        } else {
            return 'Unknown'; // Если не удалось определить тип социальной сети
        }
    }

    async  addProspectToList(contact,listId, token) {
        console.log('adding contact: ', contact)
        if(contact.source_page){
            const socNetwork = this.getSocialNetworkFromLink(contact.source_page)
            if(socNetwork!=='Unknown'){
                
                contact[`socialLinks[${socNetwork}]`] = contact.source_page
                contact[`social[${socNetwork}]`] = contact.source_page
            }
             delete contact.source_page
        }
        const params = new URLSearchParams()
        params.append('access_token', token);

        for (const key in contact) {
            if (contact.hasOwnProperty(key)) {
            params.append(this.convertToCamelCase(key), contact[key]);
            }
        }
        params.append('listId', listId);
    
        const requestOptions = {
            method: 'POST',
            body: params,
        };

        console.log('options: ', params)
    
        try {
            const response = await fetch('https://api.snov.io/v1/add-prospect-to-list', requestOptions)
            const data = await response.json();
            console.log('responce: ', data)
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    

}

export default new SnovioService()
