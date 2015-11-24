import React, { Component } from 'react'
import createHelper from 'recompose/createHelper'

const initAction = { type: '@@redux/INIT' }

const realmRedux = (storeEnhancer, BaseComponent) => {
  let currentReducer

  class RealmRedux extends Component {
    constructor(props) {
      super(props)

      this.listeners = []

      const createStore = reducer => {
        currentReducer = reducer

        this.baseStore = {
          dispatch: action => {
            this.props.dispatch(action)
            this.listeners.slice().forEach(listener => listener())
            return action
          },

          getState: () => this.props.model,

          subscribe: listener => {
            this.listeners.push(listener)
            let isSubscribed = true

            return function unsubscribe() {
              if (!isSubscribed) {
                return
              }

              isSubscribed = false
              const index = this.listeners.indexOf(listener)
              this.listeners.splice(index, 1)
            }
          },

          replaceReducer: nextReducer => {
            currentReducer = nextReducer
            this.baseStore.dispatch(initAction)
          }
        }

        return this.baseStore
      }

      this.store = storeEnhancer
        ? storeEnhancer(createStore)(BaseComponent.update)
        : createStore(BaseComponent.update)
    }

    componentWillMount() {
      this.baseStore.dispatch(initAction)
    }

    render() {
      return (
        <BaseComponent
          {...this.props}
          store={this.store}
          dispatch={this.store.dispatch}
          model={this.store.getState()}
        />
      )
    }
  }

  RealmRedux.init = BaseComponent.init
  RealmRedux.update = (model, action) => currentReducer(model, action)
  RealmRedux.view = BaseComponent.view

  return RealmRedux
}

export default createHelper(realmRedux, 'realmRedux')
