import {observable, action, toJS} from 'mobx';

// reference https://github.com/mobxjs/mobx/blob/master/src/api/actiondecorator.ts
class Loading {

    config = {
        // when the loading name is not defined, the class name and method name are automatically identified,
        // and this configuration controls whether the first letter of the class name or method name is converted to lowercase.
        lowerCaseFirst: true,
        // Separator between model and effect
        separator: '/'
    }

    // global loading state
    @observable
    global = false

    // load status of each model
    @observable
    models = {}

    // load status of each effect
    @observable
    actions = {}

    // change load status
    @action
    change = (model, effect, state) => {

        if (state === true) {
            this.actions[effect] = true;
            this.models[model] = true;
            this.global = true;
        } else {
            this.actions[effect] = false;

            this.models[model] = Object.keys(this.actions).filter(key => {
                return key.startsWith(`${model}${this.config.separator}`);
            }).some(key => {
                return this.actions[key] === true;
            });

            this.global = Object.keys(this.models).some(key => {
                return this.models[key] === true;
            });
        }

        console.log('loading', toJS(this));
    }
}

export default new Loading();