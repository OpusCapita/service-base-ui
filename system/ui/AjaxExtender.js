import extend from 'extend';

class AjaxExtender
{
    static DefaultConfig = {
        onRequestStart : (requestId) => null,
        onProgress : (progress) => null,
        onRequestEnd : (err, requestId, request) => null
    }

    constructor(config)
    {
        this.config = extend(true, { }, AjaxExtender.DefaultConfig, config);
        this.running = false;
        this.openRequests = { };
    }

    isRunning()
    {
        return this.running;
    }

    run()
    {
        if(this.isRunning())
            return false;

        const oldOpen = XMLHttpRequest.prototype.open;
        const self = this;

        const captureProgress = (e, requestId) =>
        {
            if(e.lengthComputable)
            {
                this.openRequests[requestId].total = e.total;
                this.openRequests[requestId].loaded = e.loaded;
            }
        }

        XMLHttpRequest.prototype.open = function()
        {
            const requestId = Math.random().toString(36).substr(2, 10);
            self.openRequests[requestId] = { loaded : 0, total : 0 };
            self.config.onRequestStart(requestId);

            this.upload.addEventListener('progress', e => captureProgress(e, requestId));
            this.addEventListener('progress', e => captureProgress(e, requestId));

            this.addEventListener('readystatechange', e =>
            {
                const target = e.currentTarget;
                const requestDone = target.readyState === 4;

                if(requestDone)
                {
                    let err;

                    if(target.status >= 500)
                    {
                        let errorMessage = target.response;

                        if(!errorMessage || errorMessage.length === 0)
                            errorMessage = `${target.statusText} (${target.status})`;

                        err = new Error(errorMessage);
                        err.target = target;
                        err.requestId = requestId;

                        if(target.getResponseHeader('content-type').indexOf('application/json') !== -1)
                            err.json = JSON.parse(target.response);
                    }

                    setTimeout(() => delete self.openRequests[requestId], 500);
                    self.config.onRequestEnd(err, { target, requestId });
                }
            });

            return oldOpen.apply(this, arguments);
        };

        this.running = true;
        this._monitorProgress();

        return true;
    }

    _monitorProgress()
    {
        setInterval(() =>
        {
            let progressAvailable = false;
            let overallTotal = 0;
            let overallLoaded = 0;

            for(const id in this.openRequests)
            {
                overallTotal += this.openRequests[id].total;
                overallLoaded += this.openRequests[id].loaded;
                progressAvailable = true;
            }

            if(progressAvailable)
            {
                if(overallTotal === 0)
                    this.config.onProgress(0);
                else
                    this.config.onProgress(overallLoaded / overallTotal);
            }

        }, 500);
    }
}

export default AjaxExtender;
