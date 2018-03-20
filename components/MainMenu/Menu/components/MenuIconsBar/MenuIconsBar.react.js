import React, { Component, Children } from 'react';
import './MenuIconsBar.less';

class MenuIconsBar extends Component
{
    render()
    {
        const { children } = this.props;

        return(
            <div className="oc-menu-icons-bar" data-test="oc-menu-icons-bar">
                {
                    Children.toArray(children).map((child, i) =>
                    {
                        return (
                            <div key={i} className="child" data-test="child">
                                {({ ...child, props: { ...child.props } })}
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

export default MenuIconsBar;
