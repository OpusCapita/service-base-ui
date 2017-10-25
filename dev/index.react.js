import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';

class Test extends React.Component
{
    render() { return(<div>Test</div>); }
}

const layout =
<ServiceLayout serviceName="service-base-ui">
    <Route path="/" />
    <Route path="/test" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
