import request from 'superagent';
import React from 'react';

import Common from './Common';

export default class Editor
{
    /**
     * Create/Add new item for table list.
     *
     * @async
     * @function addItem
     * @param {array} items - List of current items in table-list.
     * @param {string} user - Current logged in userId, derived from UserData object.
     * @param columns - list of columns in table.
     * @returns {object}
     */
    static addItem = async (items, user, columns) =>
    {
        try
        {
            const keys = Object.keys(items[ 0 ]),
                  newItem = {  };

            for(const key of keys)
            {
                newItem[ key ] = '';

                for(const column of columns)
                {
                    if(column.key === key && column.type === "bool")
                    {
                        newItem[ key ] = false;
                    }
                }
            }

            newItem[ '_id' ] = Common.randomId();
            newItem[ 'createdOn' ] = new Date().toISOString();
            newItem[ 'createdBy' ] = user;

            return newItem;
        }
        catch(e)
        {
            throw new Error(e);
        }
    };

    /**
     * Duplicates selected item(s) according to selectedItems-list.
     *
     * @async
     * @function duplicateItem
     * @param {array} items - List of current items in table-list.
     * @param {array} selectedItems - List of currently selected items.
     * @param user - Current logged in userId, derived from UserData object.
     * @returns {array}
     */
    static duplicateItem = async (items, selectedItems, user) =>
    {
        const newItems = [  ];

        try
        {
            for(const selected of selectedItems)
            {
                const oldItem = items.find(item => item._id === selected);

                let newItem = {  },
                    item = Object.assign(newItem, oldItem);

                item[ '_id' ] = Common.randomId();
                item[ 'createdOn' ] = new Date().toISOString();
                item[ 'createdBy' ] = user;
                item[ 'changedOn' ] = '';
                item[ 'changedBy' ] = '';

                newItems.push(item);
            }

            newItems.push(...items);

            return newItems;
        }
        catch(e)
        {
            throw new Error(e);
        }
    };

    /**
     * Deletes selected item(s) according to selectedItems-list.
     *
     * @async
     * @function deleteItem
     * @param {array} items - List of current items in table-list.
     * @param {array} selectedItems - List of currently selected items.
     * @returns {array}
     */
    static deleteItem = async (items, selectedItems) =>
    {
        try
        {
            return items.filter(item => selectedItems.indexOf(item._id) === -1);
        }
        catch(e)
        {
            throw new Error(e);
        }
    };

    /**
     * gives out the amount of selected and/or edited rows in the table-editor.
     *
     * @function getSelectedAndEditedAmountText
     * @param {int} selectedAmount - Amount of selected rows.
     * @param {int} editedAmount - Amount of edited rows.
     * @param {object} translations - Derived i18n component object.
     * @returns {string}
     */
    static getSelectedAndEditedAmountText = (selectedAmount, editedAmount, translations) =>
    {
        let selectedAmountText = '';
        let editedAmountText = '';
        let spacerText = '';

        let active = false;

        if(selectedAmount > 0)
        {
            selectedAmountText = selectedAmount + ` ${translations.getMessage('Table.pagination.selected')}`;
            active = true;
        }
        if(editedAmount > 0)
        {
            editedAmountText = editedAmount + ` ${translations.getMessage('Table.pagination.edited')}`;
            active = true;
        }

        if(selectedAmount > 0 && editedAmount > 0)
        {
            spacerText = ', ';
        }

        return `${active ? '(' : ''}${selectedAmountText}${spacerText}${editedAmountText}${active ? ')' : ''}`;
    };

    /**
     * Creates button for editor menu.
     *
     * @function editorButton
     * @param {string} text - text on button.
     * @param {string} icon - icon displayed.
     * @param {string} buttonState - button class to be displayed.
     * @param {function} callback - function called onClick.
     * @returns {object}
     */
    static editorButton = (text, icon, buttonState, callback) =>
    (
        <button
            className={`btn btn-${buttonState}`}
            onClick={callback}
        >
            <span className={`glyphicon glyphicon-${icon}`}/>
            {
                text && ` ${text}`
            }
        </button>
    );

    /**
     * Searches for matching items in table-list
     *
     * @function searchForMatches
     * @param {string} filterText
     * @param {array} tempItems - Copy of list of current items in table-list.
     * @param {array} defaultSearch - List of current keyy to search for
     * @returns {array}
     */
    static searchForMatches = (filterText, tempItems, defaultSearch) =>
    {
        try
        {
            const splitSearch = filterText.split(':');

            let newList = [  ],
                searchKey,
                searchValue;

            if(filterText.indexOf(':') >= 0)
            {
                searchKey = splitSearch[ 0 ].trim();
                searchValue = splitSearch[ 1 ].trim();
            }
            else
            {
                searchKey = defaultSearch;
                searchValue = filterText;
            }

            if(tempItems)
            {
                newList = tempItems.filter((item) =>
                {
                    if(item[ searchKey ] && item[ searchKey ].toString().includes(searchValue.toString()))
                    {
                        item[ '_id' ] = Common.randomId();
                        return item;
                    }
                });
            }

            return newList;
        }
        catch(e)
        {
            throw new Error(e);
        }
    };

    /**
     * Creates a list based on either all, or selected rows for export.
     *
     * @function createExportableItemList
     * @param {array} items
     * @param {array} columns
     * @param {array} selectedItems
     * @param {object} translations
     * @returns {array}
     */
    static createExportableItemList = async (items, columns, selectedItems, translations) =>
    {
        let exportableItems = [  ],
            itemList = [  ];

        try
        {
            if(selectedItems.length >= 1)
            {
                const tempItems = items.filter(data => selectedItems.indexOf(data._id) >= 0 && data);

                itemList = JSON.stringify(tempItems);
            }
            else
            {
                itemList = JSON.stringify(items);
            }

            const re = new RegExp(',', 'g');

            const array = typeof itemList == 'object' ? itemList : JSON.parse(itemList);

            for(const rows of array)
            {
                let line = '';

                for(let row in rows)
                {
                    if(rows[ row ])
                    {
                        if(typeof rows[ row ] === 'object' && rows[ row ].constructor === Object)
                        {
                            rows[ row ] = JSON.stringify(rows[ row ]);
                        }

                        rows[ row ] = rows[ row ].toString().replace(re, ',');
                    }

                    for(const column of columns)
                    {
                        if(column.key === row)
                        {
                            if(line !== '') line += ';';

                            if(column.type === 'date')
                            {
                                line += translations.formatDateTime(rows[ row ]);
                            }
                            else if(rows[ row ] === null || rows[ row ] === '')
                            {
                                line += '';
                            }
                            else
                            {
                                line += rows[ row ];
                            }
                        }
                    }
                }

                exportableItems += line + '\r\n';
            }

            return exportableItems;
        }
        catch(e)
        {
            throw new Error(e);
        }
    };
}
