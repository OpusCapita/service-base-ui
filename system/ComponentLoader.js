import React, { Component } from 'react';
import ScriptLoader from './ScriptLoader';

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
            vendorUrl : `/${serviceName}/static/components/vendor-bundle.js`,
            serviceName,
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
    getLoadedComponent(moduleName)
    {
        return (window[moduleName] && window[moduleName].default) || null;
    }

    /**
     * Returns external component's wrapper which will display actual component after it loads.
     * @param {string} url Script URL
     * @param {string} moduleName Name of module being exported to window object
     * @param {Component?} placeholderComponent Component displayed while external is being loaded
     * @param {function?} onLoaded Called once component was loaded
     * @returns {function}
     */
    getWrapperComponent({ url, vendorUrl, serviceName, moduleName, placeholderComponent, onLoaded })
    {
        const componentLoader = this;

        return class extends Component
        {
            state = {
                component: null
            };

            componentDidMount()
            {
                const component = componentLoader.getLoadedComponent(moduleName);

                if(component)
                    this.setState({ component });
                else
                    componentLoader.fetchScript({ url, vendorUrl, serviceName }).then(() => this.setState({ component : componentLoader.getLoadedComponent(moduleName) }));
            }

            render()
            {
                const { component } = this.state;

                if(component)
                {
                    const properties = Object.getOwnPropertyNames(component.prototype);
                    const props = Object.assign({ }, this.props, { ref : (node) => onLoaded && onLoaded(node) });

                    return React.createElement(component, props);
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
    fetchScript({ url, vendorUrl, serviceName })
    {
        const existing = this.loading.get(url);

        if(existing)
            return existing;

        this.loading.size === 0 && this.onLoadingStarted();
        this.loading.set(url, true);

        if(!window[`webpackJsonp${serviceName}__name_`])
            await ScriptLoader.load(vendorUrl, false).catch(e => null);

        await ScriptLoader.load(url);

        this.loading.delete(url);
        this.loading.size === 0 && this.onLoadingFinished();
    }

}

export default ComponentLoader;
