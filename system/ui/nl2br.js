const React = require('react');
const crypto = require('crypto');

module.exports = function(input)
{
    if(!input || typeof input.toString !== 'function')
        return '';

    const stringVal = (typeof input === 'string' && input) || input.toString();

    return stringVal.replace('\r', '').split('\n').map((item, index) =>
    {
        const md5 = crypto.createHash('md5');

        if(!item || item.length === 0)
            return(<br key={md5.update((Math.random() + index).toString()).digest('hex')} />);
        else
            return(<span key={md5.update(item + index).digest('hex')}>{item}<br/></span>)
    });
}
