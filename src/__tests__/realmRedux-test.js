import { expect } from 'chai'
import React from 'react'
import { realmRedux } from '../'
import { connect } from 'react-redux'
import { realm, start } from 'react-realm'
import { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { renderIntoDocument } from 'react-addons-test-utils'
import createSpy from 'recompose/createSpy'
import compose from 'recompose/compose'

const RESET = 'RESET'
const INCREMENT = 'INCREMENT'
const DECREMENT = 'DECREMENT'

const spy = createSpy()
const Spy = spy('div')
const getProp = key => spy.getProps()[key]

const BaseCounter = realm({
  init: (initial = 0) => initial,

  update: (count, action) => {
    switch (action.type) {
    case RESET:
      return 0
    case INCREMENT:
      return count + 1
    case DECREMENT:
      return count - 1
    default:
      return count
    }
  },

  view: Spy
})

const actionCreators = {
  increment: () => ({ type: INCREMENT }),

  decrementIfOdd: () => (dispatch2, getState) => {
    if (getState() % 2 !== 0) {
      dispatch2({ type: DECREMENT })
    }
  }
}

describe('realmRedux()', () => {
  describe('simulates a Redux store', () => {
    it('that works with store enhancers', () => {
      const Counter = compose(
        start,
        realmRedux(
          applyMiddleware(thunk)
        )
      )(BaseCounter)

      const testCounter = (getCount, dispatch) => {
        const increment = () => dispatch(actionCreators.increment())
        const decrementIfOdd = () => dispatch(actionCreators.decrementIfOdd())

        expect(getProp('model')).to.equal(0)
        increment()
        expect(getProp('model')).to.equal(1)
        decrementIfOdd()
        expect(getProp('model')).to.equal(0)
        increment()
        increment()
        expect(getProp('model')).to.equal(2)
        decrementIfOdd()
        expect(getProp('model')).to.equal(2)
      }

      renderIntoDocument(<Counter pass="through" />)

      const dispatch = getProp('dispatch')
      testCounter(
        () => getProp('model'),
        dispatch
      )

      dispatch({ type: RESET })

      const store = getProp('store')
      testCounter(
        store.getState,
        store.dispatch
      )
    })

    it('that also works without a store enhancer', () => {
      const Counter = compose(
        start,
        realmRedux(null) // Must pass null because function is curried
      )(BaseCounter)

      renderIntoDocument(<Counter pass="through" />)

      const dispatch = getProp('dispatch')

      expect(getProp('model')).to.equal(0)
      dispatch({ type: INCREMENT })
      expect(getProp('model')).to.equal(1)
    })

    it('that can be subscribed to', () => {
      const Counter = compose(
        start,
        realmRedux(null)
      )(BaseCounter)

      renderIntoDocument(<Counter pass="through" />)

      const store = getProp('store')

      let state = store.getState()

      store.subscribe(() => {
        state = store.getState()
      })

      expect(state).to.equal(0)
      store.dispatch({ type: INCREMENT })
      expect(state).to.equal(1)
    })

    it('whose reducer can be replaced', () => {
      const Counter = compose(
        start,
        realmRedux(null)
      )(BaseCounter)

      renderIntoDocument(<Counter pass="through" />)

      const store = getProp('store')

      expect(store.getState()).to.equal(0)
      store.dispatch({ type: INCREMENT })
      expect(store.getState()).to.equal(1)

      store.replaceReducer((count, action) => {
        switch (action.type) {
        case INCREMENT:
          return count + 10
        default:
          return count
        }
      })

      store.dispatch({ type: INCREMENT })
      expect(store.getState()).to.equal(11)
    })

    it.only('that works with connect() from React Redux', () => {
      const Counter = compose(
        start,
        realmRedux(
          applyMiddleware(thunk)
        )
      )(realm({
        init: BaseCounter.init,
        update: BaseCounter.update,
        view: connect(
          count => ({ count }),
          actionCreators
        )(BaseCounter.view)
      }))

      renderIntoDocument(<Counter pass="through" />)

      const increment = getProp('increment')
      const decrementIfOdd = getProp('decrementIfOdd')

      expect(getProp('count')).to.equal(0)
      increment()
      expect(getProp('count')).to.equal(1)
      decrementIfOdd()
      expect(getProp('count')).to.equal(0)
    })
  })
})
