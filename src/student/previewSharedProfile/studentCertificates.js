import React from 'react';
import { Col } from 'react-bootstrap';
import Slider from 'react-slick';
import _ from 'lodash';

import {
  limitCharacter,
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage
} from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';

var settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
        infinite: true,
        dots: true
      }
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        initialSlide: 2
      }
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};

const StudentCertificates = props => {
  let certificateArray = [];
  //let _achievementData = props.achievements;
  let shareConfig = props.shareConfig;
  let _achievementData;

  if (shareConfig) {
    _achievementData = _.filter(props.achievements, function(data) {
      if (
        data.importance >= shareConfig.importance &&
        data.competencyTypeId === shareConfig.competencyTypeId
      ) {
        return true;
      } else {
        return false;
      }
    });
  }

  if (_achievementData.length > 0) {
    _achievementData.map((item, index) => {
      if (item.asset.length > 0) {
        item.asset.map((certificate, index) => {
          certificate.tag === CONSTANTS.certificateAlbum
            ? certificateArray.push({
                certificate: certificate.file,
                title: item.title
              })
            : '';
        });
      }
    });
  }

  return (
    <div>
      {certificateArray.length > 0 ? (
        <Col sm={6}>
          <div className="card">
            <div className="section-main-title with-icon">
              <span className="icon-badges icon" />
              Certificates
            </div>
            <Slider {...settings} className="slider">
              {certificateArray.map((certificate, index) => (
                <div className="slider-item square" key={index}>
                  <a>
                    <span className="image-section">
                      <img
                        className="img-responsive"
                        src={getThumbImage('small', certificate.certificate)}
                        alt="certificate"
                      />
                    </span>
                    <span
                      className="image-section-title"
                      title={certificate.title}
                    >
                      {limitCharacter(certificate.title, 50)}
                    </span>
                  </a>
                </div>
              ))}
            </Slider>
          </div>
        </Col>
      ) : null}
    </div>
  );
};
export default StudentCertificates;
