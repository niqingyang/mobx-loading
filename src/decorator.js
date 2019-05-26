import {instance} from './index';

// lowercase the first
function lowerCaseFirst(str) {
    if (str === null) {
        return '';
    }

    str = String(str);

    return str.charAt(0).toLowerCase() + str.substr(1);
}

/**
 * execute action
 * @param names [model, action]
 * @param func
 * @param scope
 * @returns {function(): *}
 */
function executeAction(names, func, scope) {

    return function () {

        const [model, action] = names;

        instance.change(model, action, true);

        const promise = func.apply(scope || this, arguments);

        // hope is a promise object
        if (typeof promise === 'object' && typeof promise.then === 'function') {
            promise.then((response) => {

                instance.change(model, action, false);

                return response;
            });
        } else {
            instance.change(model, action, false);
        }

        return promise;
    };
}

function actionDecorator(target, prop, descriptor, name) {

    let names;

    if (typeof name === 'undefined' && target.constructor && typeof target.constructor.name === 'string') {

        if (instance.config.lowerCaseFirst) {
            name = lowerCaseFirst(target.constructor.name);
            prop = lowerCaseFirst(prop);
        }

        names = [
            name,
            lowerCaseFirst(`${name}${instance.config.separator}${prop}`)
        ];
    } else {
        names = [
            name,
            `${name}${instance.config.separator}`
        ];
    }

    if (descriptor) {
        if (process.env.NODE_ENV !== "production" && descriptor.get !== undefined) {
            throw new Error("@loading cannot be used with getters");
        }
        // babel / typescript
        // @action method() { }
        if (descriptor.value) {
            // typescript
            return {
                value: executeAction(names, descriptor.value),
                enumerable: false,
                configurable: true, // See #1477
                writable: true // for typescript, this must be writable, otherwise it cannot inherit :/ (see inheritable actions test)
            }
        }

        // babel only: @action method = () => {}
        const {initializer} = descriptor;

        return {
            enumerable: false,
            configurable: true, // See #1477
            writable: true, // See #1398
            initializer() {
                // N.B: we can't immediately invoke initializer; this would be wrong
                return executeAction(names, initializer.call(this))
            }
        }
    }

    // bound instance methods
    return fieldActionDecorator(names).apply(this, arguments);
}

function fieldActionDecorator(name) {
    // Simple property that writes on first invocation to the current instance
    return function (target, prop, descriptor) {
        Object.defineProperty(target, prop, {
            configurable: true,
            enumerable: false,
            get() {
                return undefined
            },
            set(value) {
                // 待实现
            }
        })
    }
}

export default function loading(...args) {
    if (args.length === 1) {
        return function (target, prop, descriptor) {
            return actionDecorator(target, prop, descriptor, args[0]);
        }
    } else {
        return actionDecorator.apply(this, args);
    }
}
