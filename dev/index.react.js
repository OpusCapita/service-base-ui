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
                                name: 'name',
                                width: 250
                            },
                            {
                                key: 'federationName',
                                name: 'federationName',
                                width: 150
                            },
                            {
                                key: 'supplierId',
                                name: 'supplierId',
                                width: 150
                            },
                            {
                                key: 'customerId',
                                name: 'customerId',
                                width: 150
                            },
                            {
                                key: 'status',
                                name: 'status',
                                width: 100
                            },
                            {
                                key: 'createdBy',
                                name: 'createdBy'
                            },
                            {
                                key: 'changedBy',
                                name: 'changedBy'
                            },
                        ]
                    }
                    items={
                        [
                            {
                                name: 'Scott Tiger',
                                federationName: '',
                                supplierId: 'hard001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'John Doe',
                                federationName: '',
                                supplierId: '',
                                customerId: 'ncc',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Andy Approver',
                                federationName: '',
                                supplierId: 'OC001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Mark Matcher',
                                federationName: '',
                                supplierId: 'OC001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Oliver Operator',
                                federationName: '',
                                supplierId: 'acme_us',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Dave Developer',
                                federationName: '',
                                supplierId: 'acme_us',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Tommy Tester',
                                federationName: '',
                                supplierId: '',
                                customerId: 'acme_de',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                            },
                            {
                                name: 'Eileen Email',
                                federationName: '',
                                supplierId: '',
                                customerId: 'acme_de',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Ann Auditor',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Antonio Analyst',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                            },
                            {
                                name: 'Indy Inspector',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
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
