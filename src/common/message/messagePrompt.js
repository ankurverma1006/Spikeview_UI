import React, { Component } from 'react';
class MessagePrompt extends Component {
  render() {
    return (
      <div className="messagePrompt--wrapper">
        <div className="messagePrompt">
          <div className="messagePrompt--content">
            <h1>Whooops!!</h1>
            <p>
              {' '}
              You do not have any connections yet, to get connected with
              someone, you need to send them connection request first.
            </p>
          </div>
        </div>
      </div>
    );
  }
}
export default MessagePrompt;
