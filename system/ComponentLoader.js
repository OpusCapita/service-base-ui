import React, { Component } from 'react';
import scriptjs from 'scriptjs';

class ComponentLoader {

    /**
     * Constructor
     * @param {function} onLoadingStarted Called when loading of script(s) started
     * @param {function} onLoadingFinished Called once loading of script(s) finished
     */
    constructor({ onLoadingStarted, onLoadingFinished }) {
        this.onLoadingStarted = onLoadingStarted;
        this.onLoadingFinished = onLoadingFinished;
        this.loading = new Set();
    }

    /**
     * Returns module by given module name.
     * @param {string} moduleName Name of module being exported to window object
     * @returns {function|null}
     */
    getLoadedModule(moduleName) {
        return (window[moduleName] && window[moduleName].default) || null;
    }

    /**
     * Updates internal state of modules being currently loaded. Calls global loading started if appropriate.
     * @param {string} moduleName Name of module being exported to window object
     */
    onModuleLoadingStarted(moduleName) {
        if (this.loading.size === 0) {
            this.onLoadingStarted && this.onLoadingStarted();
        }

        this.loading.add(moduleName);
    }

    /**
     * Updates internal state of modules being currently loaded. Calls global loading finished if appropriate.
     * @param {string} moduleName Name of module being exported to window object
     */
    onModuleLoadingFinished(moduleName) {
        this.loading.delete(moduleName);

        if (this.loading.size === 0) {
            this.onLoadingFinished && this.onLoadingFinished();
        }
    }

    /**
     * Loads external component.
     * @param {string} moduleName Name of module being exported to window object
     * @param {string} registryUrl Base URL of components registry
     * @param {string?} jsFileName Bundle file name
     * @param {Component?} inProgressComponent Component displayed while external is being loaded
     * @param {function?} onLoaded Called once component was loaded
     * @returns {function}
     */
    load({ moduleName, registryUrl, jsFileName, inProgressComponent, onLoaded }) {
        const module = this.getLoadedModule(moduleName);

        if (module) {
            onLoaded && onLoaded();
            return module;
        }

        this.onModuleLoadingStarted(moduleName);

        const url = `${registryUrl}/static/components/${jsFileName || moduleName}.js`;

        return this.getLoaderComponent({
            moduleName,
            url,
            inProgressComponent,
            onLoaded: () => {
                this.onModuleLoadingFinished(moduleName);
                onLoaded && onLoaded();
            }
        });
    }

    /**
     * Returns instance of component being an external component loader.
     * @param {string} moduleName Name of module being exported to window object
     * @param {string} url Script URL
     * @param {Component?} inProgressComponent Component displayed while external is being loaded
     * @param {function?} onLoaded Called once component was loaded
     * @returns {function}
     */
    getLoaderComponent({ moduleName, url, inProgressComponent, onLoaded }) {
        const componentLoader = this;

        return class extends Component {
            state = { component: null };

            componentDidMount() {
                scriptjs(
                    url,
                    () => this.setState(
                        { component: componentLoader.getLoadedModule(moduleName) },
                        onLoaded
                    )
                );
            }

            render() {
                const { component } = this.state;

                if (component) {
                    return React.createElement(component, this.props);
                } else if (inProgressComponent) {
                    return inProgressComponent;
                } else {
                    return null;
                }
            }
        };
    }

}

export default ComponentLoader;
