# @lourd/react-google-api [![npm package badge][npm badge]][npm] [![Build status][travis badge]][travis]

[npm badge]: https://img.shields.io/npm/v/@lourd/react-google-api.svg?style=flat-square
[npm]: https://www.npmjs.com/package/@lourd/react-google-api
[travis badge]: https://travis-ci.org/lourd/react-google-api.svg?branch=master
[travis]: https://travis-ci.org/lourd/react-google-api
[client docs]: https://developers.google.com/api-client-library/javascript/
[sheets module]: https://github.com/lourd/react-google-sheet
[unpkg]: https://unpkg.com/@lourd/react-google-api

Integrate your React application with one of Google's many APIs with the `GoogleApi` component.

This component handles setting up [Google's JavaScript API client library][client docs] and making its state available to the rest of the React component tree through context and a render prop.

See [`@lourd/react-google-sheet`][sheets module] for an example of using the component.

## Installation

```sh
yarn add @lourd/react-google-api
```

### Browser

Available as a simple [`<script>` through unpkg.com][unpkg]. The package will be available as the global variable `ReactGoogleApi`.

## Reference

```js
import { GoogleApi, GoogleApiConsumer } from '@lourd/react-google-api'
```

### `ApiState` interface

```js
interface ApiState {
  loading: boolean;
  signedIn: boolean;
  client?: gapi.client; // https://developers.google.com/api-client-library/javascript/reference/referencedocs#client-setup,
  error?: Error;
  authorize: Function;
  signout: Function;
}
```

### [`<GoogleApi/>`](./modules/GoogleApi.js)

| Property      | Type                                                          | Required |
| :------------ | :------------------------------------------------------------ | :------- |
| clientId      | `string`                                                      | yes      |
| apiKey        | `string`                                                      | yes      |
| discoveryDocs | `[string]`                                                    | yes      |
| scopes        | `[string]`                                                    | yes      |
| children      | `Function(api: ApiState): PropTypes.node` or `PropTypes.node` | yes      |

Get an API key and client ID from the [Google APIs console](https://console.developers.google.com/apis/credentials). Learn more about the discovery docs and scopes concepts from [Google's reference material][client docs].

### [`<GoogleApiConsumer/>`](./modules/GoogleApi.js)

This component gives access to the Google API state passed down by a [`GoogleApi`](#googleapi) component. It uses its children prop as a function to pass the arguments along. There must be an ancestor `GoogleApi` rendered in the component tree for this component to work.

| Property | Type                 | Required |
| :------- | :------------------- | :------- |
| children | `Function<ApiState>` | yes      |
