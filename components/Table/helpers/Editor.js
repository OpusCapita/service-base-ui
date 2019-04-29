import request from 'superagent';

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
            const keys = Object.keys(items[0]);
            const newItem = {  };

            for(let i = 0; i < keys.length; i++)
            {
                newItem[keys[i]] = '';
            }

            newItem["_id"] = Common.randomId();
            newItem["createdOn"] = new Date().toISOString();
            newItem["createdBy"] = user;

            return newItem;
        }
        catch(e)
        {
            throw new Error(e)
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
            let newItems = [  ];

            selectedItems.forEach((selected) =>
            {
                const oldItem = items.find(item => item._id === selected);

                let newItem = {};

                let item = Object.assign(newItem, oldItem);

                item["_id"] = Common.randomId();
                item["createdOn"] = new Date().toISOString();
                item["createdBy"] = user;
                item["changedOn"] = '';
                item["changedBy"] = '';

                newItems.push(item);
            });

            newItems.push(...items);

            return newItems;
        }
        catch(e)
        {
            console.log(e.message);
            throw new Error(e)
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
            let newItems;

            newItems = items.filter((item) =>
            {
                if(selectedItems.indexOf(item._id) === -1)
                {
                    return item;
                }
            });

            return newItems;
        }
        catch(e)
        {
            throw new Error(e)
        }
    };

    /**
     * Searches for matching items in table-list
     *
     * @function searchForMatches
     * @param {string} filtertext
     * @param {array} items - Copy of list of current items in table-list.
     * @param {array} items - List of current items in table-list.
     * @returns {array}
     */
    static searchForMatches = (filtertext, tempItems, items) =>
    {
        return new Promise((success, failure) =>
        {
            let foundItem = false;
            let newList = [  ];

            try
            {
                if(filtertext === '')
                {
                    foundItem = false;
                }

                if(tempItems)
                {
                    newList = tempItems.filter((item) =>
                    {
                        if(item['id'].toLowerCase().indexOf(filtertext.toLowerCase()) >= 0)
                        {
                            item['_id'] = Common.randomId();
                            return item;
                        }
                        else
                        {
                            foundItem = false;
                        }
                    });
                }

                if(foundItem === false)
                {
                    success(newList);
                }
                else if(foundItem === true)
                {
                    success(items);
                }
            }
            catch(e)
            {
                failure(e);
            }
        });
    };
}
