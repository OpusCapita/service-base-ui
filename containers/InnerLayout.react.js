import React from 'react';
import { ContextComponent, MainMenu } from '../components';

class InnerLayout extends ContextComponent
{
    render()
    {
        return(
            <div>
                {
                    this.context.getLayoutSize() === 'full-screen' ? null :
                    <div>
                        <MainMenu onLanguageChange={locale => this.context.setLocale(locale)} />
                        <div id="menu-placeholder"></div>
                    </div>
                }
                <div id="main-content">
                    {this.props.children}
                </div>
            </div>
        )
    }
}

export default InnerLayout;
