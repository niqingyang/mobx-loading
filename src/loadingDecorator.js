import loadingStore, {NAMESPACE_SEP} from './loadingStore';

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

        loadingStore.change(model, action, true);

        const promise = func.apply(scope || this, arguments);

        // hope is a promise object
        if (typeof promise === 'object' && typeof promise.finally === 'function') {
            promise.finally(()=>{
                loadingStore.change(model, action, false);
            });
        } else {
            loadingStore.change(model, action, false);
        }

        return promise;
    };
}

function actionDecorator(target, prop, descriptor, name) {

    let names;

    if (typeof name === 'undefined' && target.constructor && typeof target.constructor.name === 'string') {

        if (target.namespace) {
            name = target.namespace;
            prop = lowerCaseFirst(prop);
        } else {
            name = lowerCaseFirst(target.constructor.name);
            prop = lowerCaseFirst(prop);
        }

        names = [
            name,
            lowerCaseFirst(`${name}${NAMESPACE_SEP}${prop}`)
        ];
    } else if (Array.isArray(name)) {
        names = [
            name[0],
            name.length > 1 ? name.join(NAMESPACE_SEP) : null
        ];
    } else {

        name = String(name).split(NAMESPACE_SEP);

        names = [
            name[0],
            name.length > 1 ? name.join(NAMESPACE_SEP) : null
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

    // bound loadingStore methods
    return fieldActionDecorator(names).apply(this, arguments);
}

function fieldActionDecorator(name) {
    // Simple property that writes on first invocation to the current loadingStore
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
