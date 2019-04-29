


export default class Common
{
    /**
     * Sets table style according to styling in props.
     *
     * @function setTableStyle
     * @param {object} styling - Prop-object containing style options.
     * @returns {string}
     */
    static setTableStyle = (styling) =>
    {
        return `table table-hover
            ${styling.striped ? ' table-striped' : ''}
            ${styling.condensed ? ' table-condensed' : ''}
            ${styling.bordered ? ' table-bordered' : ''}
        `;
    };

    /**
     * Calculates range.
     *
     * @function range
     * @param {int} start - Start of range.
     * @param {int} end - End of range.
     * @returns {array}
     */
    static range = (start, end) => Array.from({length: end - start}, (i, idx) => idx + start);

    /**
     * Create random identifier.
     *
     * @function randomId
     * @returns {string}
     */
    static randomId =() => btoa(Math.random()).substring(0,12);

    /**
     * set identifier for each item in list.
     *
     * @function setListItemIdentifiers
     * @param {array} items - Array of items to recieve identifiers
     * @returns {array}
     */
    static setListItemIdentifiers = (items) =>
    {
        const rows = [  ];

        items.forEach((item) =>
        {
            rows.push({ ...item, _id: Common.randomId() });
        });

        return rows;
    };

    /**
     * Formats value of current column to either date or string.
     *
     * @function formatColumnValue
     * @param {string} input - Value if columnn.
     * @param {object} translations - Derived i18n component object.
     * @returns {string}
     */
    static formatColumnValue = (input, translations) =>
    {
        if(new Date(input) !== 'Invalid Date' && !isNaN(new Date(input)))
        {
            return translations.formatDateTime(input);
        }
        else
        {
            return input || '\xa0';
        }
    }
}
