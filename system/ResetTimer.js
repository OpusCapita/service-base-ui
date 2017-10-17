class ResetTimer
{
    timer = null;
    timeout = 0;
    callback = null;

    start(callback, timeout)
    {
        this.stop();

        this.callback = callback;
        this.timeout = timeout;

        if(callback)
            this.timer = setTimeout(() => { this.stop(); callback(); }, timeout);
    }

    reset(callback, timeout)
    {
        this.start(callback || this.callback, timeout || this.timeout);
    }

    stop()
    {
        if(this.timer)
        {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    isRunning()
    {
        return this.timer != null;
    }
}

export default ResetTimer;
