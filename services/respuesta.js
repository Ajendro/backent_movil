const sendResponse = (res, statusCode, info, result = null, success = true) => {
    
    const code = success ? "COD_OK" : "COD_ERROR";  

    const response = {
        code,      
        result,      
        info         
    };

    res.status(statusCode).json(response);
};

module.exports = { sendResponse };
