import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker, Table } from '../components';

class Test extends ContextComponent
{
    state = {
    };

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
                {/*<DatePicker showIcon={false} />*/}
                <Table
                    //groupBy={({type}) => type}
                    styling={
                        {
                            bordered: true,
                            striped: true,
                            condensed: false
                        }
                    }
                    options={
                        {
                            pageSize: 20,
                            showPageSize: true,
                            showEditMenu: true,
                            openEditMenu: false,
                            fixed: true
                        }
                    }
                    columns={
                        [
                            {
                                key: 'name',
                                name: 'Name',
                            },
                            {
                                key: 'type',
                                name: 'Type',
                            },
                            {
                                key: 'createdBy',
                                name: 'createdBy',
                            },
                            {
                                key: 'changedBy',
                                name: 'changedBy',
                            },
                        ]
                    }
                    items={
                        [
                            {
                                name: 'Scott Tiger',
                                type: 'Supplier',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'John Doe',
                                type: 'Customer',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Andy Approver',
                                type: 'Customer',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Mark Matcher',
                                type: 'Customer',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Oliver Operator',
                                type: 'Supplier',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user ',
                            },
                            {
                                name: 'Dave Developer',
                                type: 'Supplier',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Tommy Tester',
                                type: 'Customer',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Eileen Email',
                                type: 'Supplier',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Ann Auditor',
                                type: 'Customer',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Antonio Analyst',
                                type: 'Supplier',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Indy Inspector',
                                type: 'Customer',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            }
                        ]
                    }
                />
            </div>
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>;

ReactDOM.render(layout, document.getElementById('root'));
