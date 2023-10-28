import  express  from "express";
import cors from 'cors'
import scrapController from './scrapController.js'
const app = express()

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//here should be used check if it url middleware
app.post('/',scrapController.scrapGoogle)
app.get('/',(req,res)=>{
    res.status(200).json("hello from irpen v30")
})

app.listen(process.env.PORT || 5200,()=>{
    console.log(`Server started at port ${process.env.PORT || 5200}`)
})