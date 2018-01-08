import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker } from '../components';

class Test extends ContextComponent
{
    state = {
        value : new Date().toString()
    }

    constructor()
    {
        super();
        setTimeout(() =>
        {
            console.log('reset');
            this.setState({ disabled : true });
        }, 5000);
    }

    render()
    {
        return(
            <DatePicker ref={node => this.picker = node}
               showIcon={false}
               enabled={true}
               disabled={this.state.disabled}
            />);
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
