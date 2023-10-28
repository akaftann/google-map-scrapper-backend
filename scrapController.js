import searchGoogleMaps from './scrapService.js'
import XLSX from 'xlsx'

class scrapController{
    async scrapGoogle(req, res){
        try{
            const reqString = req.body.reqString
            console.log('start search by: ', reqString)
            const data = await searchGoogleMaps(reqString)
            const ws = XLSX.utils.json_to_sheet(data);

            
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

            
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
            
            res.status(200)
            res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(excelBuffer); 
        }catch(e){
            res.status(500).json(e.message)
        }
    }
}

export default new scrapController()