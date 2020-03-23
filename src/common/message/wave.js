import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
class Wave extends Component {
  onFirstMessage() {
    this.props.onFirstMessage();
  }

  render() {
    return (
      <div className="centeredBox absoluteBox">
        <div className="text-center">
          <p>
            <strong>
              Say Hello to <span>{this.props.partnerName}</span> with a smile
            </strong>
          </p>
          <div>
            <span class="icon-smile lg-icon primary" />
          </div>
          <Button
            bsStyle="primary mt-1"
            onClick={this.onFirstMessage.bind(this)}
          >
            hello
          </Button>
        </div>
      </div>
    );
  }
}
export default Wave;
