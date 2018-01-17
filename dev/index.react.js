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
        console.log(value);
        this.setState({ value : value.dateString });
    }

    onFocus()
    {
      console.log("DatePicker Focused!");
    }

    constructor()
    {
        super();
    }

    render()
    {
        return(
            <DatePicker ref={node => this.picker = node}
               showIcon={false}
               enabled={true}
               value={this.state.value}
               onChange={this.setValue.bind(this)}
               onFocus={this.onFocus}
            />
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
