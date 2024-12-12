const sendResponse = (res, statusCode, info, result, status) => {
    const code = status ? "COD_OK" : "COD_ERROR";
    const response = {
        code,       
        result,     
        info,        
        status       
    };
    res.status(statusCode).json(response);
};

module.exports = { sendResponse };
