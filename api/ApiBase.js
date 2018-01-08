const request = require('superagent');

class ApiBase
{
    ajax = request;

    getErrorFromResponse(res)
    {
        if(res)
            throw new Error((res.body && res.body.message) || res.body || res.message);

        throw new Error('An unknown error occured.');
    }
}

export default ApiBase;
export { ApiBase };
