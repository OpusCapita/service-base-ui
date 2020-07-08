import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';
import { ContextComponent, LogInForm, DatePicker, ModalDialog } from '../components';

class Test extends ContextComponent
{
    state = {
    }

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
        const startDate = "+3d";
        // const startDate = new Date();
        // const startDate = undefined;

        return(
            <div>
                <DatePicker
                    showIcon={false}
                    startDate={startDate}
                />
                <br/>
                <ModalDialog
                    onClose={() => this.setState()}
                    ref={ref => this.modal = ref}
                />
                <button onClick={() => this.modal.show()}>Open modal</button>
            </div>
        );
    }
}


const layout =
<ServiceLayout serviceName="service-base-ui" component={Test}>
    <Route path="/" component={Test} />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
