import ContextComponent from './ContextComponent.react';
import equals from 'deep-equal';

class ConditionalRenderComponent extends ContextComponent
{
    shouldComponentUpdate(nextProps, nextState, nextContext)
    {
        return !equals(this.props, nextProps)
            || !equals(this.state, nextState)
            || this.context !== nextContext
    }
}

export default ConditionalRenderComponent;
