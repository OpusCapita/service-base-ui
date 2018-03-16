import React, { Component } from 'react';
import scriptjs from 'scriptjs';

class ComponentLoader {

    constructor({ onLoadingStarted, onLoadingFinished }) {
        this.onLoadingStarted = onLoadingStarted;
        this.onLoadingFinished = onLoadingFinished;
        this.loading = new Set();
    }

    getLoadedModule(moduleName) {
        return window[moduleName] || null;
    }

    onModuleLoadingStarted(moduleName) {
        if (this.loading.size === 0) {
            this.onLoadingStarted && this.onLoadingStarted();
        }

        this.loading.add(moduleName);
    }

    onModuleLoadingFinished(moduleName) {
        this.loading.delete(moduleName);

        if (this.loading.size === 0) {
            this.onLoadingFinished && this.onLoadingFinished();
        }
    }

    /**
     *
     * @param moduleName
     * @param registryUrl
     * @param jsFileName
     * @param inProgressComponent
     * @param onLoaded
     * @returns {*}
     */
    load({ moduleName, registryUrl, jsFileName, inProgressComponent, onLoaded }) {
        const module = this.getLoadedModule(moduleName);

        if (module) {
            return this.getLoadedComponent(module);
        }

        this.onModuleLoadingStarted(moduleName);


        const url = `${registryUrl}/static/components/${jsFileName || moduleName}.js`;
        this.getLoaderComponent({
            moduleName,
            url,
            inProgressComponent,
            onLoaded: () => {
                this.onModuleLoadingFinished(moduleName);
                onLoaded && onLoaded();
            }
        });
    }


    getLoaderComponent({ moduleName, url, inProgressComponent, onLoaded }) {
        const componentLoader = this;

        return class extends Component {
            state = {
                component: null
            };

            componentDidMount() {
                scriptjs(
                    url,
                    () => this.setState(
                        { component: componentLoader.getLoadedModule(moduleName).default },
                        onLoaded
                    )
                );
            }

            render() {
                const { component } = this.state;

                if (component) {
                    return React.createElement(component, this.props);
                } else if (inProgressComponent) {
                    return React.createElement(inProgressComponent);
                } else {
                    return null;
                }
            }
        };
    }

    getLoadedComponent(module) {
        return class extends Component {
            render() {
                return React.createElement(
                    module.default,
                    this.props
                );
            }
        }
    }

}

export default ComponentLoader;
