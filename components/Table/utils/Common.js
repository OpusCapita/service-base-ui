import React from 'react';

export default class Common
{
    /**
     * Sets table style according to styling in props.
     *
     * @function setTableStyle
     * @param {object} styling - Prop-object containing style options.
     * @returns {string}
     */
    static setTableStyle = styling => `table table-hover
        ${ styling.striped && ' table-striped' }
        ${ styling.condensed && ' table-condensed' }
        ${ styling.bordered && ' table-bordered' }`;

    /**
     * Calculates range.
     *
     * @function range
     * @param {int} start - Start of range.
     * @param {int} end - End of range.
     * @returns {array}
     */
    static range = (start, end) => Array.from({ length: end - start }, (i, idx) => idx + start);

    /**
     * Create random identifier.
     *
     * @function randomId
     * @returns {string}
     */
    static randomId = () => btoa(Math.random()).substring(0,12);

    /**
     * set identifier for each item in list.
     *
     * @function setListItemIdentifiers
     * @param {array} items - Array of items to recieve identifiers.
     * @returns {array}
     */
    static setListItemIdentifiers = items =>
    {
        const rows = [  ];

        for(const item of items)
        {
            rows.push({ ...item, _id: Common.randomId() });
        }

        return rows;
    };

    /**
     * ?
     *
     * @function getSelectedRowAmount
     * @param selectedItems
     * @returns {array}
     */
    static getSelectedRowAmount = (selectedItems) =>
    {
        return selectedItems.length;
    };

    /**
     * ?
     *
     * @function getEditedRowAmount
     * @param items
     * @returns {array}
     */
    static getEditedRowAmount = (items) =>
    {
        let editedAmount = 0;

        for(const item of items)
        {
            if(item.edited)
            {
                editedAmount++;
            }
        }

        return editedAmount;
    };

    /**
     * ?
     *
     * @function getFaultyRowAmount
     * @param columns
     * @param items
     * @returns {array}
     */
    static getFaultyRowAmount = (columns, items) =>
    {
        let faultyAmount = 0,
            tempArray = [  ];

        columns.forEach(column =>
        {
            items.forEach(item =>
            {
                if(column.required && item[ column.key ] === (null|| ''))
                {
                    faultyAmount++;
                }

                if(column.unique && item[ column.key ] !== (null|| ''))
                {
                    if(tempArray.length === 0)
                    {
                        tempArray.push(item[ column.key ]);
                    }
                    else
                    {
                        if(tempArray.includes(item[ column.key ]))
                        {
                            tempArray.push(item[ column.key ]);

                            let count = tempArray.filter(value => value === item[ column.key ]).length;

                            if(count > 1)
                            {
                                faultyAmount += count;
                            }
                        }
                        else
                        {
                            tempArray.push(item[ column.key ]);
                        }
                    }
                }
            });
        });

        return faultyAmount;
    };

    /**
     * Formats value of current column to either date or string.
     *
     * @function formatColumnValue
     * @param {string} input - Value if columnn.
     * @param {string} type
     * @param {object} translations - Derived i18n component object.
     * @returns {string}
     */
    static formatColumnValue = (input, type, translations) =>
    {
        switch(type)
        {
            case 'bool':
                return input.toString();
            case 'date':
                if(!(new Date(input) === 'Invalid Date') && !isNaN(new Date(input)))
                {
                    return translations.formatDateTime(input);
                }
                break;
            default:
                return input || '';
        }
    };
}
