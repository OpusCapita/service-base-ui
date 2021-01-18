import React, { Component } from 'react'
import Types from 'prop-types';
import { MenuSelect } from '../../../Menu'
import supportedLanguages from '../../../data/supportedLanguages.json'

class MenuSelectLanguage extends Component {
    static propTypes = {
        userLanguageId: Types.string,
        onChange: Types.func
    }

    static defaultProps = {
        userLanguageId: 'en',
        onChange: () => {}
    }

    getDefaultLanguage(lang) {
        return Object.keys(supportedLanguages).indexOf(lang) > -1 ? lang : 'en';
    }

    renderLanguageOptions() {
        return Object.keys(supportedLanguages).map(lang => <option key={lang} value={lang}>{supportedLanguages[lang]}</option>);
    }

    render() 
    {
        const { userLanguageId, onChange } = this.props;
        return (
            <MenuSelect className="select-item-select"
                defaultValue={this.getDefaultLanguage(userLanguageId)}
                onChange={e => onChange(e)}
            >
                {this.renderLanguageOptions()}
            </MenuSelect>
        );
    }
}

export default MenuSelectLanguage;
