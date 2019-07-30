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
        // 返回一个 Promise 对象
        return Promise;
    }
    
    @loading
    @action
    fetchList = () => {
        // ...do some things
        // 也可以不返回 Promise 对象
    }
    
    @loading('user')
    @action
    fetchA = () => {
        // ...do some things
        // 返回一个 Promise 对象
        return Promise;
    }
    
    @loading('user/a')
    @action
    fetchB = () => {
        // ...do some things
        // 返回一个 Promise 对象
        return Promise;
    }
    
    @loading(['user', 'c'])
    @action
    fetchC = () => {
        // ...do some things
        // 返回一个 Promise 对象
        return Promise;
    }
    
    // .... some things
}
```

### 2.放入 store 中


```js
import {loadingStore} from 'mobx-loading'

// ....

store.loading = loadingStore;

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
    featchListLoading: loading.actions['user/fetchList'],
    featchALoading: loading.actions['user/a'],
    featchBLoading: loading.actions['user/b'],
    featchCLoading: loading.actions['user/c'],
    userLoading: loading.models.user,
    globalLoading: loading.global
})
class XXX extends React.Component {
    // ....
}
```


## License

[Apache 2.0](https://opensource.org/licenses/Apache-2.0) Copyright (c) 2019
