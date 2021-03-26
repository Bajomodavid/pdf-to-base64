
class Convert {
     
    constructor(url) {
        this.response = url;
    }
    async toBase64() {
        const pdf2base64 = require('pdf-to-base64');
        
        try {
            const response = await pdf2base64(this.response);
            return response;
        } catch (error) {
            throw error;
        }
    }
}