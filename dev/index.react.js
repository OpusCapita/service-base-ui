import React from 'react';
import ReactDOM from 'react-dom';
import { Route } from 'react-router';
import { ServiceLayout } from '../containers';

const layout =
<ServiceLayout serviceName="service-base-ui">
    <Route path="/" />
</ServiceLayout>

ReactDOM.render(layout, document.getElementById('root'));
