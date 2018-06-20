import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant'
import { renderDefaultButton } from '../'
import '../../styles.css'

class GoogleLogin extends Component {
  constructor(props, context) {
    super(props, context);
    this.signIn = this.signIn.bind(this);
  }

  componentWillMount() {
    invariant(
      this.context.reactGoogleApi,
      'A <GoogleLogin> can be used only as child or descendant of <GoogleApi> '
    )
    invariant(
      React.Children.count(this.props.children) === 0,
      'A <GoogleLogin> can\'t have child, use <CustomGoogleLogin> instead'
    )
  }

  signIn(e) {
    if (e) {
      e.preventDefault() // to prevent submit if used within form
    }

    const auth2 = window.gapi.auth2.getAuthInstance()
    const { onLoginSuccess, onLoginFailure, onRequest, offline, prompt } = this.props

    onRequest();

    if (offline) {
      auth2.grantOfflineAccess({ prompt })
      .then(
        res => onLoginSuccess(res),
        err => onLoginFailure(err)
      );
    } else {
      auth2.signIn()
      .then(
        res => onLoginSuccess(res),
        err => onLoginFailure(err)
      );
    }

  }

  getAuthorizeParams() {
    const { clientId, scope, responseType, prompt } = this.context;

    return {
      client_id: clientId,
      response_type: responseType,
      prompt,
      scope
    }
  }

  authorize() {
    const { onLoginSuccess, onLoginFailure } = this.props;

    const auth2 = window.gapi.auth2;
    const params = getAuthorizeParams();

    auth2.authorize(params, (response) => {
      if (response.error) {
        onLoginFailure(response);
      } else {
        onLoginSuccess(response);
      }
    });
  }

  render() {

    return renderDefaultButton({
      text: this.props.text,
      backgroundColor: this.props.backgroundColor,
      disabled: this.props.disabled,
      className: "react-google-oauth-button-login",
      onClickFunc: this.authorize,
      width: this.props.width
    })
  }
}

GoogleLogin.contextTypes = {
  reactGoogleApi: PropTypes.bool
}

GoogleLogin.propTypes = {
  onLoginSuccess: PropTypes.func,
  onLoginFailure: PropTypes.func,
  onRequest: PropTypes.func,
  text: PropTypes.string,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  width: PropTypes.string
};

GoogleLogin.defaultProps = {
  onLoginFailure: f => f,
  onLoginSuccess: f => f,
  onRequest: f => f,
  text: 'Sign in with Google'
};

export default GoogleLogin;
