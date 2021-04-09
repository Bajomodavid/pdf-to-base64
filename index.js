require('dotenv').config();
const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
const router = express.Router();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.json())

router.post('/', async (req, res) => {
    try {
        if(!req.body.url) return res.json({
            status: false,
            message: 'file url is required',
        });
        const response = await toBase64(req.body.url);
        return res.json({
            status: true,
            fileExtension: 'pdf',
            fileBase64EncodedString: response
        }, 200);
    } catch (error) {
        return res.json({
            status: false,
            message: 'Make sure a valid Pdf is at the url sent'
        }, 422);
    }
});

router.post('/forward', async (req, res) => {
    try {
        if(!req.body.url) return res.json({
            status: false,
            message: 'file url is required',
        });
        const file = await toBase64(req.body.url);
        const axios = require('axios')
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': req.body.apikey,
            }
        };
        var base64Result = {};
        base64Result['fileExtension'] = 'pdf';
        base64Result['fileBase64EncodedString'] = file;
        
        const payload = JSON.parse(req.body.payload);
        payload['MandateRequests'][0]['mandateFile'] = base64Result;
        const body = JSON.stringify(payload);

        const response = await axios.post('https://payment-api.cyberpay.ng/api/v1/directdebit/mandate', body, options);

        return res.json({
            status: response.statusCode < 300 ? true : false,
        }, 200);
    } catch (error) {
        console.log(error);
        return res.json({
            status: false,
            message: 'Make sure a valid Pdf is at the url sent'
        }, 422);
    }
});

const toBase64 = async (url) => {
    const pdf2base64 = require('pdf-to-base64');
    
    try {
        const response = await pdf2base64(url);
        return response;
    } catch (error) {
        return error;
    }
}

router.get('/', (req, res) => {
    return res.json({
        status: false,
        message: "Please send a post body with url property pointing to a valid pdf file"
    })
})

app.use("/", router);

app.listen(process.env.PORT || 3000, function () {
    console.log("App is listening on port 3000!");
});