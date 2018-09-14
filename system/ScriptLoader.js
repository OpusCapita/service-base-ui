class ScriptLoader
{
    static load(url, useAsync = true)
    {
        const heads = document && document.getElementsByTagName('head');
        const head = heads && heads[0];

        if(!head)
            throw new Error('Required HTML tag <head> was not found in document.');

        const script = document.createElement('script');
        script.async = useAsync;
        script.src = url;

        return new Promise((resolve, reject) =>
        {
            script.onload = resolve;
            script.onerror = reject;

            head.insertBefore(script, head.lastChild);
        });
    }
}

export default ScriptLoader;
