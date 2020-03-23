import React, { Component } from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { Modal, ResponsiveEmbed, ButtonToolbar,
  OverlayTrigger,
  Tooltip } from 'react-bootstrap';
import Slider from 'react-slick';
import moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import achievementDefaultImage from '../../../../assets/img/default_achievement.jpg';
import CONSTANTS from '../../../../common/core/config/appConfig';
import {
  getThumbImage,
  SampleNextArrow,
  SamplePrevArrow
} from '../../../../common/commonFunctions';
import spikeViewApiService from '../../../../common/core/api/apiService';
import Achievement from '../achievements/addAchievement';
import MediaModal from '../mediaModal';

const settings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1
};

const mediaSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1
};

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
};

class ViewAchievement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAchievementComponent: false,
      viewAchievementModal: true,
      data: [],
      userId: '',
      mediaModal: false,
      assetFile: ''
    };
  }

  componentDidMount() {
    this.getAchievementDetail(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.getAchievementDetail(nextProps);
  }

  handleClose = () => {
    this.setState({
      viewAchievementModal: !this.state.viewAchievementModal
    });
    this.props.closeViewAchievement(this.props.achievementDetail.achievementId);
  };

  getAchievementDetail = (data, action) => {
    let level1Competency = data.level1Competency;
    let achievementRow = data.achievementDetail;
    let achievementData = [];
    if (data.type == 'Search') {
      achievementData = data.achievementData;
    } else {
      achievementData = data.student.achievementData;
    }

    // get achievement detail
    var level1Data = _.filter(achievementData, {
      level1: level1Competency
    });

    var level2Data = _.filter(level1Data, {
      _id: achievementRow.competencyTypeId
    });

    var level3Data = _.filter(level2Data[0].achievement, {
      achievementId: achievementRow.achievementId
    });

    var level1CompetnecyData = _.filter(this.props.student.competencyData, {
      level1: level1Competency
    });

    var level2CompetnecyData = _.filter(level1CompetnecyData[0].level2, {
      competencyTypeId: achievementRow.competencyTypeId
    });

    var level3CompetnecyData = _.filter(level2CompetnecyData[0].level3, {
      key: achievementRow.level3Competency
    });

    if (level3CompetnecyData) {
      level3Data[0]['level3CompetencyName'] = level3CompetnecyData[0] && level3CompetnecyData[0].name ? 
                                                              level3CompetnecyData[0] && level3CompetnecyData[0].name : null;
    }

    this.setState({
      data: level3Data[0],
      levelThreeCompetency: level2CompetnecyData[0].level3
    });
  };

  renderBadges = asset => {
    if (asset && asset.length > 0) {
      var badgesData = _.filter(asset, function(o) {
        if (o.tag === CONSTANTS.badgeAlbum)
          return o;
      });
    } 
    return badgesData && badgesData.length > 0 ? (
      <div className="history-slider sm-slider">
        <h5 className="h-gray">Badges</h5>
        <Slider {...settings}>
          {badgesData.map((badge, index) => (
            <div className="slider-items" key={index}>
              <img
                src={getThumbImage('small', badge.file)}
                alt="Badge"
                onClick={this.showMedia.bind(this, badgesData)}
              />
            </div>
          ))}
        </Slider>
      </div>
    ) : null;
  };

  renderCertificates = asset => {
    if (asset && asset.length > 0) {
      var certificatesData = _.filter(asset, {
        tag: 'certificates'
      });
    }

    return certificatesData && certificatesData.length > 0 ? (
      <div className="history-slider sm-slider">
        <h5 className="h-gray">Certificates</h5>

        <Slider {...settings}>
          {certificatesData.map((certificate, index) => (
            <div className="slider-items" key={index}>
              <img
                src={getThumbImage('small', certificate.file)}
                alt="Certificate"
                onClick={this.showMedia.bind(this, certificatesData)}
              />
            </div>
          ))}
        </Slider>
      </div>
    ) : null;
  };

  renderTrophies = asset => {
    if (asset && asset.length > 0) {
      var trophiesData = _.filter(asset, function(o) {
        if (o.tag === CONSTANTS.trophieAlbum)
          return o;
      });
    } 
    return trophiesData && trophiesData.length > 0 ? (
      <div className="history-slider sm-slider">
        <h5 className="h-gray">Trophies</h5>
        <Slider {...settings}>
          {trophiesData.map((trophy, index) => (
            <div className="slider-items" key={index}>
              <img
                src={getThumbImage('small', trophy.file)}
                alt="Trophy"
                onClick={this.showMedia.bind(this, trophiesData)}
              />
            </div>
          ))}
        </Slider>
      </div>
    ) : null;
  };

  renderMedia = asset => {
    if (asset && asset.length > 0) {
      var assetData = _.filter(asset, {
        tag: 'media'
      });
    }

    return assetData && assetData.length > 0 ? (
      <div className="history-slider">
        <h5 className="h-gray">Media</h5>

        <Slider {...mediaSettings}>
          {assetData.map((asset, index) => (
            <div className="slider-items" key={index}>
              {asset.type === 'video' ? (
                <img
                  src={achievementDefaultImage}
                  alt="Media"
                  onClick={this.showMedia.bind(this, assetData)}
                />
              ) : (
                <img
                  src={getThumbImage('small', asset.file)}
                  alt="Media"
                  onClick={this.showMedia.bind(this, assetData)}
                />
              )}
            </div>
          ))}
        </Slider>
      </div>
    ) : null;
  };

  showMedia = asset => {
    this.setState({ mediaModal: !this.state.mediaModal, asset });
  };

  editAchievement = () => {
    this.setState({
      showAchievementComponent: !this.state.showAchievementComponent
    });
  };

  deleteAchievement = achievementId => {
    let self = this;
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <p>Are you sure you want to delete this achievement?</p>
            <button onClick={onClose}>No</button>
            <button
              onClick={() => {
                let data = {
                  achievementId
                };

                if (achievementId) {
                  spikeViewApiService('deleteAchievement', data)
                    .then(response => {
                      if (response && response.data.status === 'Success') {
                        onClose();
                        self.props.getAchievementsByUser();
                        self.handleClose();
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }
              }}
            >
              Yes, Delete it!
            </button>
          </div>
        );
      }
    });
  };

  render() {
    let { data } = this.state;

    return (
      <div>
        <Modal
          show={this.state.viewAchievementModal}
          onHide={this.handleClose} 
          className="skill-modal"
        >
          <Modal.Header
            closeButton
            className="flex justify-content-space-between"
          >         
            <Modal.Title className="lnt-fix flex-1"
            >
             <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip id="bottom">
                      {data.title}
                    </Tooltip>
                  }
                >
                  <span className="" variant="primary"> {data.title || ''}</span>
                </OverlayTrigger>
              
            </Modal.Title>
            {this.props.type == 'Search' ? (
              ''
            ) : (
              <div className="u-options text-right">
                <span
                  className="icon-edit_pencil"
                  onClick={this.editAchievement.bind(this)}
                />
                <span
                  className="icon-delete"
                  onClick={this.deleteAchievement.bind(
                    this,
                    data.achievementId
                  )}
                />
              </div>
            )}

            {this.state.showAchievementComponent ? (
              <Achievement
                levelThreeCompetency={this.state.levelThreeCompetency}
                competencyTypeId={data.competencyTypeId}
                level2Competency={data.level2Competency}
                userId={this.props.user.userId}
                achievementRow={data}
                getAchievementsByUser={this.props.getAchievementsByUser}
              />
            ) : null}
          </Modal.Header>

          <Modal.Body>
            <div className="">
              {this.renderBadges(data.asset)}
              {this.renderCertificates(data.asset)}
              {this.renderTrophies(data.asset)}
              {this.renderMedia(data.asset)}

              <h5 className="h-gray">Description</h5>

              <p className="mb-30">{data.description || ''}</p>

              <h5 className="h-gray">Competency</h5>
              <p className="mb-30">{data.level3CompetencyName || ''}</p>

              <h5 className="h-gray">Skills</h5>
              <p className="mb-30">
                {data.skills && data.skills.length > 0
                  ? data.skills.map(function(skill, index) {
                      return (
                        <span key={index}>
                          {skill.label}{' '}
                          {data.skills.length - 1 === index ? '' : ', '}
                        </span>
                      );
                    })
                  : ''}
              </p>

              <h5 className="h-gray">Achievements Level</h5>
              <p className="mb-30">{data.importanceName || ''}</p>

              <h5 className="h-gray">Date</h5>
              <p className="mb-30">
                {moment(data.fromDate).format('LL')} -
                {data.toDate ? moment(data.toDate).format('LL') : 'Present'}
              </p>

              {data.guide && data.guide.email && data.guide.firstName ? (
                <div className="light-area">
                  <h5 className="h-gray">TEACHER/COACH</h5>
                  <p className="mb-30" />

                  <h5 className="h-gray">Name</h5>
                  <p className="mb-30">
                    {data.guide.firstName || ''} {data.guide.lastName || ''}
                  </p>

                  <h5 className="h-gray">Email</h5>
                  <p className="">{data.guide.email}</p>
                </div>
              ) : (
                ''
              )}
            </div>
          </Modal.Body>
        </Modal>

        {this.state.mediaModal ? (
          <MediaModal asset={this.state.asset} closeMedia={this.showMedia} />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    parent: state.User.parentData,
    student: state.Student
  };
};

export default connect(
  mapStateToProps,
  null
)(ViewAchievement);
