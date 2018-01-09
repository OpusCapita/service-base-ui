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

    setValue(value)
    {
        this.setState({ value : value.dateString });
    }

    constructor()
    {
        super();
    }

    render()
    {
        console.log(this.state);
        return(
            <DatePicker ref={node => this.picker = node}
               showIcon={false}
               enabled={true}
               value={this.state.value}
               onChange={this.setValue.bind(this)}
            />);
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
