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
     * @returns {object}
     */
    static addItem = async (items, user) =>
    {
        try
        {
            const keys = Object.keys(items[ 0 ]),
                  newItem = {  };

            keys.forEach(key => newItem[ key ] = '');

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
        try
        {
            const newItems = [  ];

            selectedItems.forEach(selected =>
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
            });

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
     * Creates button for editor menu.
     *
     * @function EditorButton
     * @param {string} text - text on button.
     * @param {string} icon - icon displayed.
     * @param {string} buttonState - button class to be displayed.
     * @param {function} callback - function called onClick.
     * @returns {object}
     */
    static EditorButton = (text, icon, buttonState, callback) =>
    {
        return (
            <button
                className={ `btn btn-${buttonState}` }
                onClick={ callback }
            >
                <span className={`glyphicon glyphicon-${ icon }`}/>
                {
                    text && ` ${text}`
                }
            </button>
        )
    };

    /**
     * Searches for matching items in table-list
     *
     * @function searchForMatches
     * @param {string} filterText
     * @param {array} items - Copy of list of current items in table-list.
     * @param {array} items - List of current items in table-list.
     * @returns {array}
     */
    static searchForMatches = (filterText, tempItems, items, defaultSearch) =>
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
                    if(item[ searchKey ].toLowerCase().indexOf(searchValue.toLowerCase()) >= 0)
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
}
