# Realm Redux

Enables the use of [Redux](https://github.com/rackt/redux) extensions with [Realm](https://github.com/acdlite/realm) components.

## How it works

Redux and Realm are extremely similar, both in conception and implementation. In fact, Realm `update()` functions are exactly like reducers in Redux — so Redux extensions that work solely by composing reducers, like [redux-undo](https://github.com/omnidan/redux-undo) and [redux-actions](https://github.com/acdlite/redux-actions), don't need this library. They're already compatible with Realm.

But many extensions in the Redux ecosystem are in the form of middleware and store enhancers. Realm Redux adds support for these by creating a "fake" Redux store and passing it to the base component as a prop. I've put "fake" in quotes because the store is, for the most part, identical in behavior to stores generated using Redux's `createStore()`.

This is a testament to one of Redux's greatest features — its interface is so simple that extensions written for it are useful even beyond the library itself.

## Usage

```js
realmRedux(
  storeEnhancer: (createStore: CreateStore) => CreateStore,
  BaseComponent: RealmComponent
)
```

A higher-order component that takes a store enhancer and a base Realm component and returns a new Realm component.

An example of a store enhancer is `applyMiddleware()`:

```js
const NewRealmComponent = realmRedux(applyMiddleware(thunk), BaseRealmComponent)
```

(If you wish to apply multiple enhancers, they can be composed together.)

`realmRedux()` is curried (like a [Recompose](https://github.com/acdlite/recompose) helper), so it can be composed easily with other functions.

The base component will receive a `store` prop that behaves like a Redux store. For example, the `store` prop can be passed to React Redux's `connect()`.
