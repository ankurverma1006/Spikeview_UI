import React, { Component } from 'react';
import { Row, Col, Modal } from 'react-bootstrap';
import moment from 'moment';
import Slider from 'react-slick/lib/index';
import { confirmAlert } from 'react-confirm-alert';

import Header from '../../../header/header';
import CONSTANTS from '../../../../common/core/config/appConfig';
import connect from 'react-redux/es/connect/connect';
import spikeViewApiService from '../../../../common/core/api/apiService';
import {
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage
} from '../../../../common/commonFunctions';

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
};
class RecommendationDetail extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      recommendationDetail: [],
      imagesPopup: false,
      sliderImages: []
    };
  }

  componentWillMount() {
    document.body.classList.add('white-theme');
    document.body.classList.remove('light-theme');
    document.body.classList.remove('absoluteHeader');
    if (
      this.props.location.state &&
      this.props.location.state.recommendationDetail !== ''
    ) {
      this.setState({
        recommendationDetail: this.props.location.state.recommendationDetail,
        profileType: this.props.location.state.type
          ? this.props.location.state.type
          : '',
        searchUserId:
          this.props.location.state && this.props.location.state.searchUserId
            ? this.props.location.state.searchUserId
            : ''
      });
    }
    this.setUserDetail(this.props.user);
  }

  imagesPopup = type => {
    this.setState({ imagesPopup: !this.state.imagesPopup });
    if (type === 'asset') {
      this.setState({
        sliderImages: this.state.recommendationDetail.asset
      });
    }
    // } else if (type === 'certificate') {
    //   this.setState({
    //     sliderImages: this.state.recommendationDetail.certificate
    //   });
    // } else if (type === 'badge') {
    //   this.setState({
    //     sliderImages: this.state.recommendationDetail.badge
    //   });
    // }
  };

  componentWillReceiveProps() {
    this.getUserPersonalInfo(this.props.user.userId);
  }

  setUserDetail = userData => {
    if (userData) {
      let profileImage = userData.profilePicture
        ? getThumbImage('medium', userData.profilePicture)
        : '';
      let firstName = userData.firstName || '';
      let lastName = userData.lastName || '';
      let summary = userData.summary || '';
      let email = userData.email || '';
      let userId = userData.userId;

      this.setState({
        profileImage,
        firstName,
        lastName,
        summary,
        email,
        userId
      });
    }
  };

  addToProfileRecommendation = recommendationId => {
    if (recommendationId) {
      let stage = 'Added';
      let data = {
        recommendationId,
        stage
      };
      spikeViewApiService('addToProfileRecommendation', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.getRecommendationsByUser();
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  getRecommendationsByUser = userId => {
    this.props.actionGetRecommendationsByUser(userId);
  };

  deleteRecommendation = (recommendationId, userId) => {
    if (recommendationId) {
      let self = this;
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui">
              <p>Are you sure you want to delete this recommendation?</p>
              <button onClick={onClose}>No</button>
              <button
                onClick={() => {
                  let data = {
                    recommendationId
                  };

                  spikeViewApiService('deleteRecommendation', data)
                    .then(response => {
                      if (response && response.data.status === 'Success') {
                        onClose();
                        setTimeout(
                          function() {
                            self.props.history.push({
                              pathname: '/student/recommendations',
                              state: {
                                loggedInUser: userId
                              }
                            });
                          },

                          2000
                        );
                      }
                    })
                    .catch(err => {
                      console.log(err);
                    });
                }}
              >
                Yes, Delete it!
              </button>
            </div>
          );
        }
      });
    }
  };

  render() {
    console.log(this.state.userId, this.props.user.userId);
    let recommendationDetail = this.state.recommendationDetail
      ? this.state.recommendationDetail
      : [];

    // let badgeLength =
    //   recommendationDetail.badge && recommendationDetail.badge.length > 0
    //     ? recommendationDetail.badge.length
    //     : 0;
    // let certificateLength =
    //   recommendationDetail.certificate &&
    //   recommendationDetail.certificate.length > 0
    //     ? recommendationDetail.certificate.length
    //     : 0;
    let assetLength =
      recommendationDetail.asset && recommendationDetail.asset.length > 0
        ? recommendationDetail.asset.length
        : 0;

    console.log(recommendationDetail);

    return (
      <div className="innerWrapper">
        <div className="container" />
        <Header {...this.props} />
        <div className="profileBox">
          <div className="container main">
            <div className="mt-1 fullWidth">
              <ul className="myProfileInfo--wrapper">
                <li>
                  <div className="">
                    <div className="flex align-center justify-content-between primary-text">
                      <div className="flex align-center">
                        {this.state.searchUserId ? (
                          <a
                            onClick={() =>
                              this.props.history.push({
                                pathname: '/student/recommendations',
                                state: {
                                  loggedInUser: this.state.searchUserId,
                                  searchUserId: this.state.searchUserId,
                                  type: this.state.profileType
                                }
                              })
                            }
                            className="backBtn"
                          >
                            <span className="icon-back_arrow2 icon" />
                          </a>
                        ) : (
                          <a
                            onClick={() =>
                              this.props.history.push({
                                pathname: '/student/recommendations',
                                state: {
                                  loggedInUser: this.state.userId,
                                  type: this.state.profileType
                                }
                              })
                            }
                            className="backBtn"
                          >
                            <span className="icon-back_arrow2 icon" />
                          </a>
                        )}

                        <div className="section-main-title with-icon primary-text mb-0">
                          Recommendation Detail
                        </div>
                      </div>
                      {this.state.profileType ? (
                        ''
                      ) : (
                        <div>
                          {recommendationDetail &&
                          recommendationDetail.stage === 'Replied' ? (
                            <button
                              type="button"
                              className="btn btn-with-border with-icon smallBtn"
                              onClick={this.addToProfileRecommendation.bind(
                                this,
                                recommendationDetail.recommendationId
                              )}
                            >
                              <span className="icon-plus" /> Add To Profile
                            </button>
                          ) : (
                            ''
                          )}

                          <buton
                            className="btn del-btn smallBtn"
                            onClick={this.deleteRecommendation.bind(
                              this,
                              recommendationDetail.recommendationId,
                              recommendationDetail.userId
                            )}
                          >
                            Delete
                          </buton>
                        </div>
                      )}
                    </div>

                    <div className="well mt-1">
                      <div className="flex">
                        <div className="pic--wrapper with--seperator">
                          {recommendationDetail.recommender.profilePicture ? (
                            <img
                              className="t--img"
                              src={getThumbImage(
                                'medium',
                                recommendationDetail.recommender.profilePicture
                              )}
                              alt=""
                            />
                          ) : (
                            <span className="icon-user_default2 default-icon centeredBox" />
                          )}

                          <div className="pw--details">
                            <div className="pw--name">
                              {recommendationDetail.recommender.firstName}{' '}
                              {recommendationDetail.recommender.lastName}
                            </div>
                            <div className="pw--email">
                              {recommendationDetail.recommender.email}
                            </div>
                          </div>
                          {/* <span className="icon-line" /> */}
                        </div>

                        <div className="content--box flex-1">
                          <p style={{ whiteSpace: 'pre-wrap' }}>
                            {recommendationDetail.request}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="section-main mb-mb-">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Title
                          <span />
                        </div>
                        {/* <span className="icon-edit_pencil icon" /> */}
                      </div>
                      <p>{recommendationDetail.title}</p>
                    </div>

                    {/* {recommendationDetail.stage &&
                    recommendationDetail.stage === 'Requested' ? (
                      <div className="section-main mb-3">
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Recommendations
                            <span />
                          </div>
                         
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                          {recommendationDetail.recommendation}
                        </p>
                      </div>
                    ) : (
                      ''
                    )} */}

                    <div className="section-main mb-3">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Competency
                          <span />
                        </div>
                        {/* <span className="icon-edit_pencil icon" /> */}
                      </div>
                      <p> {recommendationDetail.level2Competency}</p>
                    </div>

                    <div className="section-main mb-3">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Skills
                          <span />
                        </div>
                      </div>
                      <p>
                        {recommendationDetail.skills &&
                        recommendationDetail.skills.length > 0
                          ? recommendationDetail.skills.map(function(
                              skill,
                              index
                            ) {
                              return (
                                <span key={index}>
                                  {skill.label}{' '}
                                  {recommendationDetail.skills.length - 1 ===
                                  index
                                    ? ''
                                    : ','}
                                </span>
                              );
                            })
                          : ''}
                      </p>
                    </div>

                    {recommendationDetail.interactionStartDate ? (
                      <div className="section-main mb-3">
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Interaction Date
                            <span />
                          </div>
                        </div>
                        <p>
                          {moment(
                            recommendationDetail.interactionStartDate
                          ).format('LL')}{' '}
                          -&nbsp;
                          {recommendationDetail.interactionEndDate
                            ? moment(
                                recommendationDetail.interactionEndDate
                              ).format('LL')
                            : 'Present'}
                          {/* {recommendationDetail.interactionStartDate
                          ? moment(
                              recommendationDetail.interactionStartDate
                            ).format('YYYY')
                          : null}
                        &nbsp; - &nbsp;{' '}
                        {recommendationDetail.interactionEndDate
                          ? moment(
                              recommendationDetail.interactionEndDate
                            ).format('YYYY')
                          : 'Present'} */}
                        </p>
                      </div>
                    ) : (
                      ''
                    )}
                    {recommendationDetail.stage === 'Added' ||
                    recommendationDetail.stage === 'Replied' ? (
                      <div className="section-main mb-3">
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Recommendation
                            <span />
                          </div>
                          {/* <span className="icon-edit_pencil icon" /> */}
                        </div>
                        <p>{recommendationDetail.recommendation}</p>
                      </div>
                    ) : (
                      ''
                    )}

                    <hr />

                    <Row className="mt-1">
                      {/*recommendationDetail.badge &&
                      recommendationDetail.badge.length > 0 ? (
                        <Col sm={4}>
                          <div className="section-main-title with-icon light">
                            Badges
                          </div>
                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {recommendationDetail.badge
                                .slice(0, 6)
                                .map((badge, index) => (
                                  <div
                                    className={`amb-item--item ${
                                      index === 5 && badgeLength > 6
                                        ? 'img-count--wrapper'
                                        : ''
                                    }`}
                                  >
                                    <img
                                      className="img-responsive"
                                      src={`${azureURL}/${badge}`}
                                      alt={index}
                                      onClick={() => this.imagesPopup('badge')}
                                    />
                                    <a
                                      className="img-count--value"
                                      onClick={() => this.imagesPopup('badge')}
                                    >
                                      {index === 5 && badgeLength > 6
                                        ? `+ ${badgeLength - 6}`
                                        : ''}
                                    </a>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </Col>
                      ) : null*/}

                      {/*recommendationDetail.certificate &&
                      recommendationDetail.certificate.length > 0 ? (
                        <Col sm={4}>
                          <div className="section-main-title with-icon light">
                            Certificates
                          </div>
                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {recommendationDetail.certificate
                                .slice(0, 6)
                                .map((certificate, index) => (
                                  <div
                                    className={`amb-item--item ${
                                      index === 5 && certificateLength > 6
                                        ? 'img-count--wrapper'
                                        : ''
                                    }`}
                                  >
                                    <img
                                      className="img-responsive"
                                      src={`${azureURL}/${certificate}`}
                                      alt={index}
                                      onClick={() =>
                                        this.imagesPopup('certificate')
                                      }
                                    />
                                    <a
                                      className="img-count--value"
                                      onClick={() =>
                                        this.imagesPopup('certificate')
                                      }
                                    >
                                      {index === 5 && certificateLength > 6
                                        ? `+ ${certificateLength - 6}`
                                        : ''}
                                    </a>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </Col>
                      ) : null*/}

                      {recommendationDetail.asset &&
                      recommendationDetail.asset.length > 0 ? (
                        <Col sm={4}>
                          <div className="section-main-title with-icon light">
                            Media
                          </div>
                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {recommendationDetail.asset
                                .slice(0, 6)
                                .map((asset, index) => (
                                  <div
                                    className={`amb-item--item ${
                                      index === 5 && assetLength > 6
                                        ? 'img-count--wrapper'
                                        : ''
                                    }`}
                                  >
                                    {asset.type === 'image' ? (
                                      <img
                                        className="img-responsive"
                                        src={getThumbImage(
                                          'medium',
                                          asset.file
                                        )}
                                        alt={index}
                                        onClick={() =>
                                          this.imagesPopup('asset')
                                        }
                                      />
                                    ) : (
                                      <div
                                        onClick={() =>
                                          this.imagesPopup('asset')
                                        }
                                      >
                                        <span class="icon-video_tag icon lg-icon" />
                                      </div>
                                    )}

                                    <a
                                      className="img-count--value"
                                      onClick={() => this.imagesPopup('asset')}
                                    >
                                      {index === 5 && assetLength > 6
                                        ? `+ ${assetLength - 6}`
                                        : ''}
                                    </a>
                                    <div className="caption_img">
                                      {asset.tag === CONSTANTS.mediaAlbum
                                        ? 'General'
                                        : asset.tag}
                                      {asset.tag ===
                                        CONSTANTS.certificateAlbum &&
                                      asset.type === 'image' ? (
                                        <span className="icon-certificate" />
                                      ) : asset.tag === CONSTANTS.badgeAlbum &&
                                      asset.type === 'image' ? (
                                        <span className="icon-badges" />
                                      ) : (
                                        <span
                                          className={
                                            asset.type === 'image'
                                              ? 'icon-image_tag'
                                              : 'icon-video_tag'
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </Col>
                      ) : null}
                    </Row>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/*images popup */}
        <Modal
          bsSize="large fullPageModal"
          show={this.state.imagesPopup}
          onHide={this.imagesPopup}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Photos Gallery
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Slider {...photoGallery} className="slider full-page--slider">
              {this.state.sliderImages && this.state.sliderImages.length > 0
                ? this.state.sliderImages.map((img, index) => (
                    <div className="slider-item">
                      {img.type === 'image' ? (
                        <img
                          className="img-responsive"
                          src={getThumbImage('original', img.file)}
                          alt=""
                        />
                      ) : (
                        <video width="320" height="240" controls>
                          <source
                            src={getThumbImage('original', img.file)}
                            type="video/mp4"
                          />
                        </video>
                      )}
                    </div>
                  ))
                : null}
            </Slider>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData
  };
};

export default connect(
  mapStateToProps,
  null
)(RecommendationDetail);
