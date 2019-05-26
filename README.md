# mobx-loading


参考了 dva-loading 的思路，基于 mobx 实现了用于监控各个 mode 和 effect 加载状态的组件


## Installation

```js
npm install --save mobx-loading
```


## Usage

### 1.使用装饰器监控相关的 action

```js
import {action} from 'mobx'
import {loading} from 'mobx-loading'

class User {
    
    // .... some things
    
    @loading
    @action
    fetchUser = () => {
        // ...do some things
        // 返回 一个 Promise 对象
        return Promise;
    }
    
    // .... some things
}
```

### 2.放入 store 中


```js
import {instance} from 'mobx-loading'

// ....

store.loading = instance;

ReactDOM.render(
    <Provider {...store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);
```

### 3.React 组件中应用

```js
import {inject} from 'mobx-react';

@inject(({loading}) => {
    featchUserLoading: loading.actions['user/fetchUser'],
    userLoading: loading.models.user,
    globalLoading: loading.global
})
class XXX extends React.Component {
    // ....
}
```

## License

[MIT](http://opensource.org/licenses/MIT) Copyright (c) 2018 - forever Naufal Rabbani