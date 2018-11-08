import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker } from '../components';

class Test extends ContextComponent
{
    state = {
        value : null,
        blupp : 0
    }

    constructor(props, context)
    {
        super(props);
    }

    componentDidUpdate()
    {
        console.log('blupp');
    }

    render()
    {
        return(
            <div>
                <DatePicker showIcon={false} value={new Date('2018-10-12T23:00:00.000Z')} />
                <a href="#" data-toggle="tooltip" title="Hooray!" onClick={() => this.setState({ blupp : 1 })}>Hover over me</a>
                {this.state.blupp && <a href="#" data-toggle="tooltip" title="Hooray!">Hover over me 2</a>}
            </div>
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
