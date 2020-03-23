import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import Slider from 'react-slick';
import PropTypes from 'prop-types';

import {
  getThumbImage,
  SampleNextArrow,
  SamplePrevArrow
} from '../../../common/commonFunctions';

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
};

class MediaModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMedia: true
    };
  }

  render() {
    return (
      <Modal
        bsSize="large"
        className="fullPageModal"
        show={this.state.showMedia}
        onHide={this.props.closeMedia}
      >
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">
            Media Gallery
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Slider {...photoGallery} className="slider full-page--slider">
            {this.props.asset && this.props.asset.length > 0
              ? this.props.asset.map((img, index) => (
                  <div className="slider-item" key={index}>
                    {img.type === 'video' ? (
                      <video controls autoPlay>
                        <source
                          src={getThumbImage('original', img.file)}
                          type="video/mp4"
                        />
                      </video>
                    ) : (
                      <img
                        className="img-responsive"
                        src={getThumbImage('original', img.file)}
                        alt=""
                      />
                    )}
                  </div>
                ))
              : null}
          </Slider>
        </Modal.Body>
      </Modal>
    );
  }
}

MediaModal.propTypes = {
  asset: PropTypes.array,
  closeMedia: PropTypes.func
};

export default MediaModal;
