import React from 'react';
import { ContextComponent, MainMenu } from '../components';

class InnerLayout extends ContextComponent
{
    render()
    {
        return(
            <div>
                <MainMenu onLanguageChange={locale => this.context.setLocale(locale)} />
                {this.props.children}
            </div>
        )
    }
}

export default InnerLayout;
