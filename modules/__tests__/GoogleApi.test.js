import React from 'react'
import { mount as render } from 'enzyme'
import loadScript from '@lourd/load-script'
import Catcher from '@lourd/react-catcher'

// importing from the public API
import { GoogleApi, GoogleApiConsumer } from '../'
import { GoogleApiProvider } from '../GoogleApi'

jest.mock('@lourd/load-script')

const apiProps = {
  clientId: 'id',
  apiKey: 'apiKey',
  discoveryDocs: ['strings'],
  scopes: ['more strings', 'many strings'],
}

describe('GoogleApi component', () => {
  it(`has initial values for the api state, including the bound authorize and
  signout instance methods, and passes that state down through a context
  provider and the children prop if it is a function`, () => {
    // mock out side effect function
    const spy = jest.spyOn(GoogleApi.prototype, 'setupApi').mockImplementation()
    const mockChildrenFn = jest.fn(api => {
      expect(api).toMatchSnapshot()
      return 'foo'
    })
    const result = render(<GoogleApi {...apiProps}>{mockChildrenFn}</GoogleApi>)
    expect(result.is(GoogleApiProvider))
    const contextValue = result.children().prop('value')
    const state = result.state()
    expect(contextValue).toBe(state)
    const instance = result.instance()
    expect(instance.authorize).toBe(state.authorize)
    expect(instance.signout).toBe(state.signout)
    const childFunctionArg = mockChildrenFn.mock.calls[0][0]
    expect(contextValue).toBe(childFunctionArg)
    expect(GoogleApi.prototype.setupApi).toHaveBeenCalled()
    spy.mockRestore()
  })

  it(`handles authorize or signout being called when the Google API client has
  has not been setup yet`, () => {
    const spy = jest.spyOn(GoogleApi.prototype, 'setupApi').mockImplementation()
    const instance = render(
      <GoogleApi {...apiProps}>{null}</GoogleApi>,
    ).instance()
    expect(instance.auth).toBe(undefined)
    instance.authorize()
    instance.signout()
    spy.mockRestore()
  })

  it(`Throws a render error when no children are given`, async () => {
    const setup = () => {
      const spy = jest
        .spyOn(GoogleApi.prototype, 'setupApi')
        .mockImplementation()
      // suppress react's console warnings
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      return () => {
        spy.mockRestore()
        consoleSpy.mockRestore()
      }
    }
    const cleanup = setup()
    const fn = jest.fn()
    render(
      <Catcher onCatch={fn}>
        <GoogleApi {...apiProps} />
      </Catcher>,
    )
    expect(fn).toMatchSnapshot('no children render error')
    // being certain that it's only the two react errors being logged
    expect(console.error).toHaveBeenCalledTimes(2)
    cleanup()
  })

  describe('setupApi', () => {
    it(`loads the google api library, loads the client:auth2 extension, gets
    the auth instance, updates the component state, and subscribes to changes
    in the api client's internal auth state`, async () => {
      const mockAuth = {
        isSignedIn: { listen: jest.fn(), get: jest.fn(() => false) },
      }
      const mockSecondApiLoadStep = api => {
        api.client = { init: jest.fn() }
        api.auth2 = { getAuthInstance: jest.fn(() => mockAuth) }
      }
      const mockApi = () => {
        const gapi = {}
        gapi.load = jest.fn((string, opts) => {
          mockSecondApiLoadStep(gapi)
          opts.callback()
        })
        global.gapi = gapi
        return () => {
          delete global.gapi
        }
      }
      const setupMockEffects = () => {
        let cleanupApi
        loadScript.mockImplementation(() => {
          cleanupApi = mockApi()
        })
        return () => {
          loadScript.mockRestore()
          cleanupApi()
        }
      }
      const authSetter = jest.fn()
      const context = { setState: jest.fn(), props: apiProps }

      const cleanup = setupMockEffects()
      await GoogleApi.prototype.setupApi.call(context)
      expect(loadScript).toMatchSnapshot('loadScript call')
      expect(global.gapi.load).toMatchSnapshot('gapi.load call')
      expect(global.gapi.client.init).toMatchSnapshot('client init call')
      expect(context.setState).toMatchSnapshot('setState call')
      expect(context.auth).toBe(mockAuth)
      const authChangeSubscriber = mockAuth.isSignedIn.listen.mock.calls[0][0]
      authChangeSubscriber(true)
      expect(context.setState).toMatchSnapshot(
        'setState call from state change',
      )
      cleanup()
    })

    it(`catches errors from loading the api library and sets it in state`, async () => {
      const err = new Error('faiiiiiil')
      const setup = () => {
        loadScript.mockImplementation(() => Promise.reject(err))
        return () => {
          loadScript.mockRestore()
        }
      }
      const cleanup = setup()
      const context = { setState: jest.fn(), props: apiProps }
      await GoogleApi.prototype.setupApi.call(context)
      expect(context.setState).toMatchSnapshot(
        'library load error setState call',
      )
      cleanup()
    })

    it(`catches errors from loading the api auth extension and sets it in state`, async () => {
      const err = new Error('faiiiiiil')
      const mockApi = () => {
        const gapi = {}
        gapi.load = jest.fn((string, opts) => {
          opts.onerror(err)
        })
        global.gapi = gapi
        return () => {
          delete global.gapi
        }
      }
      const setupMockEffects = () => {
        let cleanupApi
        loadScript.mockImplementation(() => {
          cleanupApi = mockApi()
        })
        return () => {
          loadScript.mockRestore()
          cleanupApi()
        }
      }
      const cleanup = setupMockEffects()
      const context = { setState: jest.fn(), props: apiProps }
      await GoogleApi.prototype.setupApi.call(context)
      expect(context.setState).toMatchSnapshot('auth load error setState call')
      cleanup()
    })

    it(`catches errors from initializing the api client and sets it in state`, async () => {
      const err = new Error('faiiiiiil')
      const mockApi = () => {
        const mockClient = obj => {
          obj.client = {
            init: jest.fn(() => Promise.reject(err)),
          }
        }
        const gapi = {}
        gapi.load = jest.fn((string, opts) => {
          mockClient(gapi)
          opts.callback()
        })
        global.gapi = gapi
        return () => {
          delete global.gapi
        }
      }
      const setupMockEffects = () => {
        let cleanupApi
        loadScript.mockImplementation(() => {
          cleanupApi = mockApi()
        })
        return () => {
          loadScript.mockRestore()
          cleanupApi()
        }
      }
      const cleanup = setupMockEffects()
      const context = { setState: jest.fn(), props: apiProps }
      await GoogleApi.prototype.setupApi.call(context)
      expect(context.setState).toMatchSnapshot(
        'client init error setState call',
      )
      cleanup()
    })
  })
})

describe('GoogleApiConsumer component', () => {
  it(`gets the GoogleApi state as a render prop passed to the children
  function prop`, () => {
    // mock out side effect function
    const spy = jest.spyOn(GoogleApi.prototype, 'setupApi').mockImplementation()
    const mockContextFn = jest.fn(api => {
      expect(api).toMatchSnapshot()
      return 'foo'
    })
    const result = render(
      <GoogleApi {...apiProps}>
        <div>
          <GoogleApiConsumer>{mockContextFn}</GoogleApiConsumer>
        </div>
      </GoogleApi>,
    )
    const apiState = result.state()
    const contextRenderProp = mockContextFn.mock.calls[0][0]
    expect(contextRenderProp).toBe(apiState)
    spy.mockRestore()
  })
})
