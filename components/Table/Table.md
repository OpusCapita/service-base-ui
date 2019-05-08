# TABLE/CRUD EDITOR

## Table parameters
| Parameter  |               | Type     | Description                                                 |
|------------|---------------|----------|-------------------------------------------------------------|
| data       |               | string   | Url to table data.                                          |
| groupBy    |               | function |
| styling    |               | object   | An object containing table styling, derived from bootstrap. |
|            | bordered      | bool     | Show table bordered?                                        |
|            | striped       | bool     | Show table striped?                                         |
|            | condensed     | bool     | Show table condensed?                                       |
| options    |               | object   | An object containing table options.                         |
|            | pageSize      | int      | initial amount of rows shown.                               |
|            | showRowNumber | bool     | Show number for each row?                                   |
|            | showPageSize  | bool     | Show page size?                                             |
|            | showEditMenu  | bool     | Show editor menu?                                           |
|            | openEditMenu  | bool     | Open editor menu on start?                                  |
|            | fixed         | bool     | ?                                                           |
|            | required      | array    | A list of rows required to be not null.                     |
|            | unique        | array    | A list of rows required to be unique.                       |
|            |defaultSearch  | string   | The default column for searching without tag.               |
| columns    |               | object   | An object containing the tables columns                     |
| items      |               | object   | An object containing items to be shown in table.            |

## Table editor functions
When the Edit button is clicked, the following buttons are availible for either selected rows or the whole table.

| Button                         | Description                                      |
|-------------------------------|--------------------------------------------------|
| Add Row                        | Adds a new row at the top of the table.          |
| Duplicate                      | Duplicates the selected row(s).                  |
| Delete                         | Deletes the selected row(s).                     |
| Export Table / Export Selected | Exports the selected row(s) or the whole table). |
| Save                           | Saves the updated table data.                    |

## Table layouts
### Gruoped table
#### Closed group
|   | id                | createdBy        |
|---|-------------------|------------------|
| ▲ | max@mustermann.de | James Kirk       |
| ▲ | admin@world.com   | Montgomery Scott |

#### Open group
|   | id                | createdBy        |
|---|-------------------|------------------|
| ▼ | max@mustermann.de | James Kirk      |
|   | someone@else.com  | James Kirk       |
|   | spock@vulcan.com  | James Kirk       |
| ▲ | admin@world.com   | Montgomery Scott |

### default table
|   | id                | createdBy        |
|---|-------------------|------------------|
| 1 | max@mustermann.de | James Kirk       |
| 2 | someone@else.com  | James Kirk       |
| 3 | admin@world.com   | Montgomery Scott |
| 4 | spock@vulcan.com  | James Kirk       |

## Example setup

### Minimal setup
    <Table
        
    />
### Advanced setup
    <Table
        styling={{
            bordered: true,
            striped: true,
            condensed: false
        }}
        options={{
            pageSize: 25,
            showRowNumber: true,
            showPageSize: true,
            showEditMenu: true,
            openEditMenu: false,
            fixed: true,
            locked: [
                'createdBy',
            ],
            required: ['id'],
            unique: ['id'],
            defaultSearch: 'id'
        }}
        columns={[
            {
                key: 'id',
                name: 'id',
                width: 200
            },
            {
                key: 'name',
                name: 'name',
                width: 400
            },
            {
                key: 'birthday',
                name: 'birthday',
                width: 150
            }
        ]}
        items={[
            {
                id: '',
                name: '',
                birthday: ''
            },
            {
                id: '',
                name: '',
                birthday: ''
            },
            {
                id: '',
                name: '',
                birthday: ''
            }
        ]}
    />
