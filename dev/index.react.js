import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker, Sortable } from '../components';

class Test extends ContextComponent
{
    state = {
        items: [
            {
                id: 1,
                label: '1',
                value: 'KirkJamesT'
            },
            {
                id: 2,
                label: '2',
                value: 'SpockLT'
            },
            {
                id: 3,
                label: '3',
                value: 'doctorBones'
            },
            {
                id: 4,
                label: '4',
                value: 'SwordMasterSulu'
            },
            {
                id: 5,
                label: '5',
                value: 'HelloWorld'
            },
            {
                id: 6,
                label: '6',
                value: 'PaneChekov'
            },
            {
                id: 7,
                label: '7',
                value: 'NotBeamingUpScotty'
            },
            {
                id: 8,
                label: '8',
                value: 'BeenThereDoneThat'
            },
            {
                id: 9,
                label: '9',
                value: 'Khaaaaaaaaaan'
            },
            {
                id: 10,
                label: '10',
                value: 'HarryMuddIII'
            }
        ],
        selectedItems: [
            {
                id: 1,
                label: '1',
                value: 'KirkJamesT'
            },
            {
                id: 5,
                label: '5',
                value: 'HelloWorld'
            },
            {
                id: 7,
                label: '7',
                value: 'NotBeamingUpScotty'
            },
        ]
    }

    constructor(props, context)
    {
        super(props);

        this.UserList = context.loadComponent({
            serviceName: 'user',
            moduleName: 'user-list',
            jsFileName: 'list-bundle'
        });
    }

    render()
    {
        const { items, selectedItems } = this.state;

        return(
            <div>
                {<Sortable items={ items } selectedItems={ selectedItems } onChange={ (items) => console.log(items) }/>}
            </div>
        );
    }
}

const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
