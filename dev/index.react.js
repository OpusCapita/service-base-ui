import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent } from '../components';

class Test extends ContextComponent
{
    render() { return(<div>Test</div>); }
}

class Inner extends ContextComponent
{
    render() { return(<div>{this.props.children}</div>) }
}

const layout =
<ServiceLayout serviceName="service-base-ui" component={Inner}>
    <Route path="/" />
    <Route path="/test" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
