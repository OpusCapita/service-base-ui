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
                label: 'James Tiberius Kirk',
                value: 'KirkJamesT'
            },
            {
                id: 2,
                label: "S'chn T'gai Spock",
                value: 'SpockLT'
            },
            {
                id: 3,
                label: 'Leonard McCoy',
                value: 'doctorBones'
            },
            {
                id: 4,
                label: 'Hikaru Sulu',
                value: 'SwordMasterSulu'
            },
            {
                id: 5,
                label: 'Nyota Uhura',
                value: 'HelloWorld'
            },
            {
                id: 6,
                label: 'Pavel Chekov',
                value: 'PaneChekov'
            },
            {
                id: 7,
                label: 'Montgomery Scott',
                value: 'NotBeamingUpScotty'
            },
            {
                id: 8,
                label: 'Christine Chapel',
                value: 'BeenThereDoneThat'
            },
            {
                id: 9,
                label: 'Carol Marcus',
                value: 'Khaaaaaaaaaan'
            },
            {
                id: 10,
                label: 'Harcourt Fenton Mudd III',
                value: 'HarryMuddIII'
            }
        ],
        selectedItems: [
            {
                id: 1,
                label: 'James Tiberius Kirk',
                value: 'KirkJamesT'
            },
            {
                id: 5,
                label: 'Nyota Uhura',
                value: 'HelloWorld'
            },
            {
                id: 7,
                label: 'Montgomery Scott',
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
