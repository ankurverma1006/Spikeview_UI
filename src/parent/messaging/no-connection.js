import React, { Component } from 'react';
class NoConnection extends Component {
  render() {
    return (
      <div className="centeredBox notFoundConnection">
        <div className="nfc--content--wrapper">
          <div className="nfc--icon">
            {/* <span className="icon-profile_sharing">
              <span className="path1" />
              <span className="path2" />
              <span className="path3" />
              <span className="path4" />
              <span className="path5" />
              <span className="path6" />
            </span> */}
            <img src="../../assets/img/Pfofile sharing icon.png" />
          </div>
          {/* <div className="nfc--content">
            <p>Not found in your connections </p>
            <a href="#" onClick={this.strangerPopup}>
              shared with email
            </a>
          </div> */}
        </div>
      </div>
    );
  }
}
export default NoConnection;
