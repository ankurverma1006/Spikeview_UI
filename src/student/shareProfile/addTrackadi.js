import React, { Component } from 'react';
import { Button, Modal, Nav, NavDropdown, MenuItem } from 'react-bootstrap';

class AddSoundTrackAdi extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      show: false
    };
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow() {
    this.setState({ show: true });
  }
  render() {
    let colorPalatte = <span className="icon-select_theme" />;
    let AddTrack = <span className="icon-add_sound" />;
    return (
      <div className="addTrack">
        <Nav>
          <NavDropdown eventKey="3" title={colorPalatte}>
            <MenuItem eventKey="3.1">Report</MenuItem>
            <MenuItem eventKey="3.1">Delete</MenuItem>
          </NavDropdown>

          <NavDropdown eventKey="3" title={AddTrack}>
            <MenuItem eventKey="3.1">Report</MenuItem>
            <MenuItem eventKey="3.1">Delete</MenuItem>
          </NavDropdown>
        </Nav>

        <Button variant="primary" onClick={this.handleShow}>
          Add sound track
        </Button>
        <Modal bsSize="medium" show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Add Sound Track
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="addTracks">
              <div className="custom-upload flex-column">
                <input type="file" accept="image/*" value="" />
                <span className="icon-upload_sound addTrack--icon">
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                  <span className="path6" />
                  <span className="path7" />
                </span>{' '}
                Upload Sound Track
              </div>

              <div className="flex-column">
                <span className="icon-record_sound addTrack--icon">
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                  <span className="path6" />
                </span>
                Record Sound Track
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="primary" className="btn btn-primary">
              Add
            </Button>

            <Button bsStyle="default" className="btn-default">
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
export default AddSoundTrackAdi;
