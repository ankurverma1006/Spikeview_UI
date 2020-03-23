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

const StudentBadges = props => {
  let bagesArray = [];
  let _achievementData;
  let shareConfig = props.shareConfig;

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
        item.asset.map((badge, index) => {
          badge.tag === CONSTANTS.badgeAlbum
            ? bagesArray.push({ badge: badge.file, title: item.title })
            : '';
        });
      }
    });
  }

  return (
    <div>
      {bagesArray.length > 0 ? (
        <Col sm={6}>
          <div className="card">
            <div className="section-main-title with-icon">
              <span className="icon-badges icon" />
              Badges
            </div>
            <Slider {...settings} className="slider">
              {bagesArray.map((badge, index) => (
                <div className="slider-item square" key={index}>
                  <a>
                    <span className="image-section">
                      <img
                        className="img-responsive"
                        src={getThumbImage('small', badge.badge)}
                        alt="Badge"
                      />
                    </span>
                    <span className="image-section-title" title={badge.title}>
                      {limitCharacter(badge.title, 50)}
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
export default StudentBadges;
