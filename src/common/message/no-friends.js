import React, { Component } from 'react';

import MessagePrompt from './messagePrompt';
class NoFriends extends Component {
  constructor(props) {
    super(props);
    this.state = {
      strangerPopup: false
    };
    //  document.body.classList.add('light-theme');
  }
  render() {
    return this.props.memberList ? <MessagePrompt /> : null;
  }
}
export default NoFriends;
