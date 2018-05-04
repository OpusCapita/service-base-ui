import React, { Component } from 'react';
import scriptjs from 'scriptjs';

const NOOP = () => { }

class ComponentLoader
{
    /**
     * Constructor
     * @param {function} onLoadingStarted Called when loading of script(s) started
     * @param {function} onLoadingFinished Called once loading of script(s) finished
     */
    constructor({ onLoadingStarted = NOOP, onLoadingFinished = NOOP })
    {
        this.onLoadingStarted = onLoadingStarted;
        this.onLoadingFinished = onLoadingFinished;
        this.loading = new Map();
    }

    /**
     * Loads external component.
     * @param {string} moduleName Name of module being exported to window object
     * @param {string} serviceName Service name which determines base URL
     * @param {string?} jsFileName Bundle file name
     * @param {Component?} placeholderComponent Component displayed while external is being loaded
     * @param {function?} onLoaded Called once component was loaded
     * @returns {function}
     */
    load({ serviceName, moduleName, jsFileName, placeholderComponent, onLoaded = NOOP })
    {
        return this.getWrapperComponent(
        {
            url: `/${serviceName}/static/components/${jsFileName || moduleName}.js`,
            moduleName,
            placeholderComponent,
            onLoaded
        });
    }

    /**
     * Returns module by given module name.
     * @param {string} moduleName Name of module being exported to window object
     * @returns {function|null}
     */
    getLoadedComponent(moduleName, onLoaded)
    {
        let component = (window[moduleName] && window[moduleName].default) || null;

        if(component)
        {
            const properties = Object.getOwnPropertyNames(component.prototype);

            const props = Object.assign({ }, this.props, { ref : (node) =>
            {
                for(const prop of properties)
                    this[prop] = component.prototype[prop].bind(node);

                onLoaded && onLoaded(node);
            } });

            component = React.createElement(component, props);
        }

        return component;
    }

    /**
     * Returns external component's wrapper which will display actual component after it loads.
     * @param {string} url Script URL
     * @param {string} moduleName Name of module being exported to window object
     * @param {Component?} placeholderComponent Component displayed while external is being loaded
     * @param {function?} onLoaded Called once component was loaded
     * @returns {function}
     */
    getWrapperComponent({ url, moduleName, placeholderComponent, onLoaded })
    {
        const componentLoader = this;

        return class extends Component
        {
            state = {
                component: null
            };

            componentDidMount()
            {
                const component = componentLoader.getLoadedComponent(moduleName, onLoaded);

                if(component)
                    this.setState({ component });
                else
                    componentLoader.fetchScript(url).then(() => this.setState({ component : componentLoader.getLoadedComponent(moduleName, onLoaded) }));
            }

            render()
            {
                const { component } = this.state;

                if(component)
                {
                    return component;
                }
                else if(placeholderComponent)
                {
                    return placeholderComponent;
                }
                else
                {
                    return null;
                }
            }
        };
    }

    /**
     * Downloads script from given url. Deduplicates open transfers, sends notifications
     * on a transfer started or all transfers finished events.
     * @param {string} url Script url
     * @returns {Promise<void>}
     */
    fetchScript(url)
    {
        const existing = this.loading.get(url);

        if(existing)
            return existing;

        const promise = new Promise(resolve => scriptjs(url, resolve));

        this.loading.size === 0 && this.onLoadingStarted();
        this.loading.set(url, promise);

        promise.then(() =>
        {
            this.loading.delete(url);
            this.loading.size === 0 && this.onLoadingFinished();
        });

        return promise;
    }

}

export default ComponentLoader;
