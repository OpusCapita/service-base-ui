import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker, Table } from '../components';

class Test extends ContextComponent
{
    state = {
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
        return(
            <div>
                <DatePicker showIcon={false} />
                <Table
                    columns={
                        [
                            {
                                key: 'name',
                                name: 'Name',
                            },
                            {
                                key: 'type',
                                name: 'Type',
                            }
                        ]
                    }
                    items={
                        [
                            {
                                name: 'Scott Tiger',
                                type: 'Supplier',
                            },
                            {
                                name: 'John Doe',
                                type: 'Customer',
                            },
                            {
                                name: 'Andy Approver',
                                type: 'Customer',
                            },
                            {
                                name: 'Mark Matcher',
                                type: 'Customer',
                            }
                        ]
                    }
                    groupBy={({type}) => type}
                />
            </div>
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
