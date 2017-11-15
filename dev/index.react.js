import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm } from '../components';

class Test extends ContextComponent
{
    render() { return(<div>Test 1<br />Test 2<br />Test 3<br />Test 4<br />Test 5<br />Test 6<br />Test 7<br />Test 8<br />Test 9<br />Test 10<br />Test 11<br />Test 12<br />Test 13<br />Test 14<br />Test 15<br />Test 16<br />Test 17<br />Test 18<br />Test 19<br />Test 20<br /></div>); }
}

class Inner extends ContextComponent
{
    render() { return(<div>{this.props.children}</div>) }
}

const layout =
<ServiceLayout serviceName="service-base-ui" component={Inner}>
    <Route path="/" component={LogInForm} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
