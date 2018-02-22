'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var PropTypes = _interopDefault(require('prop-types'));
var reactBroadcast = require('react-broadcast');
var loadScript = _interopDefault(require('@lourd/load-script'));

var _createContext = reactBroadcast.createContext(null);

const GoogleApiProvider = _createContext.Provider;
const GoogleApiConsumer = _createContext.Consumer;

GoogleApiProvider.displayName = 'GoogleApiProvider';
GoogleApiConsumer.displayName = 'GoogleApiConsumer';

class GoogleApi extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this.authorize = () => {
      if (this.auth) {
        this.auth.signIn();
      }
    }, this.signout = () => {
      if (this.auth) {
        this.auth.signOut();
      }
    }, this.state = {
      signedIn: false,
      client: null,
      loading: true,
      error: null,
      authorize: this.authorize,
      signout: this.signout
    }, _temp;
  }

  componentDidMount() {
    this.setupApi();
  }

  async setupApi() {
    try {
      if (typeof window.gapi === 'undefined') {
        await loadScript('https://apis.google.com/js/api.js');
      }
      if (!gapi.client) {
        await new Promise((resolve, reject) => gapi.load('client:auth2', {
          callback: resolve,
          onerror: reject
        }));
      }
      await gapi.client.init({
        apiKey: this.props.apiKey,
        clientId: this.props.clientId,
        discoveryDocs: this.props.discoveryDocs,
        scope: this.props.scopes.join(',')
      });
    } catch (error) {
      this.setState({
        loading: false,
        error
      });
      return;
    }
    this.auth = gapi.auth2.getAuthInstance();
    this.setState({
      client: gapi.client,
      loading: false,
      signedIn: this.auth.isSignedIn.get()
    });
    this.auth.isSignedIn.listen(signedIn => this.setState({ signedIn }));
  }

  render() {
    return React.createElement(
      GoogleApiProvider,
      { value: this.state },
      typeof this.props.children === 'function' ? this.props.children(this.state) : this.props.children
    );
  }
}

GoogleApi.propTypes = {
  clientId: PropTypes.string.isRequired,
  apiKey: PropTypes.string.isRequired,
  discoveryDocs: PropTypes.arrayOf(PropTypes.string).isRequired,
  scopes: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node])
};

exports.GoogleApi = GoogleApi;
exports.GoogleApiConsumer = GoogleApiConsumer;
