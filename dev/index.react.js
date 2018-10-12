import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker } from '../components';

class Test extends ContextComponent
{
    state = {
        value : null
    }

    constructor(props, context)
    {
        super(props);
    }

    render()
    {
        return(
            <div>
                <DatePicker showIcon={false} value={new Date('2018-10-12T23:00:00.000Z')} />
            </div>
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
