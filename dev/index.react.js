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
        const url = '/user/api/users';

        return(
            <div>
                {/*<DatePicker showIcon={false} />*/}
                <Table
                    //groupBy={({createdBy}) => createdBy}
                    data={ url }
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
                            showRowNumber: true,
                            showPageSize: true,
                            showEditMenu: true,
                            openEditMenu: false,
                            fixed: true,
                            defaultSearch: 'id',
                        }
                    }
                    columns={
                        [
                            {
                                key: 'id',
                                name: 'id',
                                width: 200,
                                required: true,
                                unique: true
                            },
                            {
                                key: 'federationId',
                                name: 'federationId',
                                type: 'number',
                                width: 120
                            },
                            {
                                key: 'federationName',
                                name: 'federationName',
                                width: 150
                            },
                            {
                                key: 'supplierId',
                                name: 'supplierId',
                                width: 125
                            },
                            {
                                key: 'customerId',
                                name: 'customerId',
                                width: 125
                            },
                            {
                                key: 'status',
                                name: 'status',
                                width: 100,
                            },
                            {
                                key: 'enabled',
                                name: 'enabled',
                                type: 'bool',
                                width: 100
                            },
                            {
                                key: 'createdBy',
                                name: 'createdBy',
                                width: 120,
                                locked: true
                            },
                            {
                                key: 'changedBy',
                                name: 'changedBy',
                                width: 120,
                                locked: true
                            },
                            {
                                key: 'createdOn',
                                name: 'createdOn',
                                type: 'date',
                                width: 180
                            },
                            {
                                key: 'changedOn',
                                name: 'changedOn',
                                type: 'date',
                                width: 180,
                                locked: true
                            },
                        ]
                    }
                    items={
                        [
                            {
                                id: 'Scott Tiger',
                                federationName: '',
                                supplierId: 'hard001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'John Doe',
                                federationName: '',
                                supplierId: '',
                                customerId: 'ncc',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Andy Approver',
                                federationName: '',
                                supplierId: 'OC001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Mark Matcher',
                                federationName: '',
                                supplierId: 'OC001',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Oliver Operator',
                                federationName: '',
                                supplierId: 'acme_us',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Dave Developer',
                                federationName: '',
                                supplierId: 'acme_us',
                                customerId: '',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Tommy Tester',
                                federationName: '',
                                supplierId: '',
                                customerId: 'acme_de',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Eileen Email',
                                federationName: '',
                                supplierId: '',
                                customerId: 'acme_de',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Ann Auditor',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Antonio Analyst',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
                                createdBy: 'The Doctor',
                                changedBy: 'Opuscapita user',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
                            },
                            {
                                id: 'Indy Inspector',
                                federationName: '',
                                supplierId: '',
                                customerId: 'OC001',
                                status: 'firstLogin',
                                createdBy: 'demodata',
                                changedBy: 'demodata',
                                createdOn: '2019-04-09T18:30:00.000Z',
                                changedOn: '2019-04-09T18:30:00.000Z'
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
