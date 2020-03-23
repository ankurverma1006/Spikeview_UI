import React from 'react';
import Slider from 'react-slick';
import _ from 'lodash';

import {
  limitCharacter,
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage
} from '../../common/commonFunctions';
import achievementDefaultImage from '../../assets/img/default_achievement.jpg';

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
const StudentAchievment = props => {
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

  const renderMedia = mediaData => {
    var imgSource = '';

    if (mediaData.length === 0) {
      imgSource = achievementDefaultImage;
    } else {
      var assetData = _.filter(mediaData, {
        tag: 'media'
      });

      var certificatesData = _.filter(mediaData, {
        tag: 'certificates'
      });

      var badgesData = _.filter(mediaData, {
        tag: 'badges'
      });

      if (assetData.length > 0) {
        imgSource = getThumbImage('medium', assetData[0].file);
      } else if (certificatesData.length > 0) {
        imgSource = getThumbImage('medium', certificatesData[0].file);
      } else if (badgesData.length > 0) {
        imgSource = getThumbImage('medium', badgesData[0].file);
      } else {
        imgSource = achievementDefaultImage;
      }
    }
    return <img className="img-responsive" src={imgSource} alt="" />;
  };

  return (
    <Slider {...settings} className="slider">
      {_achievementData && _achievementData.length > 0
        ? _achievementData.map((achievement, index) => (
            <div className="slider-item" key={index}>
              <a>
                <span className="image-section">
                  {renderMedia(achievement.asset)}
                </span>
                <span className="image-section-title">
                  {limitCharacter(achievement.title, 95)}
                </span>
              </a>
            </div>
          ))
        : ''}
    </Slider>
  );
};

export default StudentAchievment;
