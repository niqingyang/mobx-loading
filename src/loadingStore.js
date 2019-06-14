import {observable, action} from 'mobx';

export const NAMESPACE_SEP = '/';

const counter = {
    models: {},
    actions: {},
};

function modelCount(model, state) {
    if (state === true) {
        counter.models[model] = counter.models[model] ? counter.models[model] + 1 : 1;
    } else if (state === false) {
        counter.models[model] = Math.min(counter.models[model] ? counter.models[model] - 1 : 0, 0);
    }
    return counter.models[model] && counter.models[model] > 0;
}

function actionCount(action, state) {
    if (state === true) {
        counter.actions[action] = counter.actions[action] ? counter.actions[action] + 1 : 1;
    } else if (state === false) {
        counter.actions[action] = Math.min(counter.actions[action] ? counter.actions[action] - 1 : 0, 0);
    }
    return counter.actions[action] && counter.actions[action] > 0;
}

// reference https://github.com/mobxjs/mobx/blob/master/src/api/actiondecorator.ts
class LoadingStore {

    // global loading state
    @observable
    global = false

    // load status of each model
    @observable
    models = {}

    // load status of each action
    @observable
    actions = {}

    // change load status
    @action
    change = (model, action, state) => {

        if (action) {
            this.actions[action] = actionCount(action, state);
        }

        if (state === true) {

            this.models[model] = modelCount(model, state)
            this.global = true;

        } else {

            this.models[model] = Object.keys(this.actions).filter(key => {
                return key && key.startsWith(`${model}${NAMESPACE_SEP}`);
            }).some(key => {
                return actionCount(key);
            });

            this.global = Object.keys(this.models).some(key => {
                return modelCount(key);
            });
        }
    }
}

export default new LoadingStore();
