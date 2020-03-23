import React, { Component } from 'react';
import Header from '../../../header/header';
import { Row, Col, Media } from 'react-bootstrap';
import Slider from 'react-slick';
import _ from 'lodash';

import { connect } from 'react-redux';
import CONSTANTS from '../../../../common/core/config/appConfig';
import SpiderChart from '../../../../common/spiderChart/spiderChart';
import {
  limitCharacter,
  SamplePrevArrow,
  SampleNextArrow,
  getThumbImage
} from '../../../../common/commonFunctions';
import achievementDefaultImage from '../../../../assets/img/default_achievement.jpg';
import CompetencyRecommendations from '../recommendations/competencyWiseRecommendations';

var badgesSettings = {
  centerMode: false,
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 3,
  swipeToSlide: true,
  nextArrow: false,
  prevArrow: false
};
var achievementSettings = {
  dots: false,
  infinite: false,
  speed: 500,
  slidesToShow: 4,
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

class AchievementDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userRecommendations: [],
      showRecommendationComponent: false,
      achievements: []
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('absoluteHeader');

    if (this.props.location && this.props.location.state) {
      this.setState({
        achievementDetails: this.props.location.state.achievementDetails || {},
        userId: this.props.location.state.achievementDetails.userId || '',
        competencyName: this.props.location.state.name || '',
        competencyTypeId:
          this.props.location.state.achievementDetails.competencyTypeId || '',
        achievementTitle: this.props.location.state.achievementDetails.title,
        certificate:
          this.props.location.state.achievementDetails.certificate || [],
        description: this.props.location.state.achievementDetails.description,
        badge: this.props.location.state.achievementDetails.badge,
        asset: this.props.location.state.achievementDetails.asset,
        stories: this.props.location.state.achievementDetails.stories
      });
      this.renderRecommendationsByUserId(
        this.props.location.state.student,
        this.props.location.state.achievementDetails.competencyTypeId
      );
    }

    this.viewOtherAchievements(
      this.props.location.state.achievementData,
      this.props.location.state.achievementDetails.achievementId
    );
  }

  componentWillReceiveProps(res) {
    this.renderRecommendationsByUserId();
  }

  renderRecommendationsByUserId(student, competencyTypeId) {
    let recommandations = student.recommendationData;
    let _recommandations = _.filter(recommandations, {
      competencyTypeId: competencyTypeId
    });

    if (recommandations.length > 0) {
      this.setState({
        userRecommendations: _recommandations
      });
    } else {
      this.setState({
        userRecommendations: []
      });
    }
  }

  viewOtherAchievements(achievementData, achievementId) {
    let achievements = _.filter(achievementData, function(o) {
      return o.achievementId !== achievementId;
    });

    this.setState({
      achievements: achievements
    });
  }

  showRecommendationComponent = (recommandationData, competencyName) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      recommandationData,
      competencyName
    });
  };

  renderBadges(badge) {
    let bagesArray = [];
    if (badge.length > 0) {
      badge.map((badge, index) => {
        badge.tag === CONSTANTS.badgeAlbum
          ? bagesArray.push({ badge: badge.file, title: this.state.title })
          : '';
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
              <Slider {...badgesSettings} className="slider">
                {bagesArray.map((badge, index) => (
                  <div className="slider-item square s--120" key={index}>
                    <a>
                      <span className="image-section">
                        <img
                          className="img-responsive"
                          src={getThumbImage('small', badge.badge)}
                          alt="Badge"
                        />
                      </span>
                      <span className="image-section-title">{badge.title}</span>
                    </a>
                  </div>
                ))}
              </Slider>
            </div>
          </Col>
        ) : null}
      </div>
    );
  }

  renderCertificates(certificate) {
    console.log(certificate);
    let certificateArray = [];
    if (certificate.length > 0) {
      certificate.map((certificate, index) => {
        certificate.tag === CONSTANTS.certificateAlbum
          ? certificateArray.push({
              certificate: certificate.file,
              title: this.state.title
            })
          : '';
      });
    }
    console.log(certificateArray);
    return (
      <div>
        {certificateArray.length > 0 ? (
          <Col sm={6}>
            <div className="card">
              <div className="section-main-title with-icon">
                <span className="icon-badges icon" />
                Certificates
              </div>
              <Slider {...badgesSettings} className="slider">
                {certificateArray.map((certificate, index) => (
                  <div className="slider-item square s--120" key={index}>
                    <a>
                      <span className="image-section">
                        <img
                          className="img-responsive"
                          src={getThumbImage('small', certificate.certificate)}
                          alt="certificate"
                        />
                      </span>
                      <span className="image-section-title">
                        {certificate.title}
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
  }

  render() {
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        <div className="profileBox">
          <div className="banner small-banner">
            <img className="bannerImg" src="assets/img/sidebarBg.png" alt="" />
            <div className="qb-banner-content">
              <div className="container">
                <div className="w-100 flex justify-content-space-between align-center">
                  {/* <div className="qb-title">
                    <span>
                      <span className="icon-beaker icon" />{' '}
                      {this.state.competencyName}
                    </span>
                    <h2>{this.state.achievementTitle}</h2>
                  </div> */}

                  <div className="qb-content--wrapper">
                    <Media>
                      <Media.Left>
                        <span
                          className={`icon ${
                            CONSTANTS.icons[this.state.competencyTypeId]
                          }`}
                        />
                      </Media.Left>
                      <Media.Body>
                        <Media.Heading>
                          {this.state.competencyName}
                        </Media.Heading>
                        <p>{this.state.achievementTitle}</p>
                      </Media.Body>
                    </Media>
                  </div>

                  {/* <button className="btn btn-with-border with-icon white stackedContent">
                    <div className="pull-left">
                      <span className="icon-thumb" />
                    </div>
                    <div className="pull-right">
                      <strong>126</strong>
                      <strong>Appreciations</strong>
                    </div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
          <div className="container main">
            <div className="flex about-quiz">
              <div className="profileBox--mainContent box-switch innerContent--fullHeight">
                <ul className="myProfileInfo--wrapper">
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>About {this.state.achievementTitle}</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <div className="content-box p-2">
                        <p>{this.state.description}</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="hi--rightSidebar right-sidebar">
                <div class="postWrapper pt-0">
                  <div class="pw-postHeader big-space">
                    <h5 class="mt-0 mb-0">
                      {' '}
                      {this.state.achievementTitle} Achievement
                    </h5>
                  </div>
                  <div class="pw-postBody">
                    <SpiderChart userId={this.state.userId} sharedId="0" />
                  </div>
                </div>

                {/* <hr />
              <h4 className="text-center">Spikes</h4>

              <div className="chart-box">
                <img src="assets/img/charts.JPG" />
              </div> */}
              </div>
            </div>
            <div className="profileBox--mainContent box-switch m-r-0 fullWidth">
              <ul className="myProfileInfo--wrapper">
                {this.state.asset.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>My Photo at {this.state.achievementTitle}</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <div className="section-main">
                        <Slider {...achievementSettings} className="slider">
                          {this.state.asset.map(function(data) {
                            return (
                              <div className="slider-item">
                                <a>
                                  <span className="image-section">
                                    <img
                                      className="img-responsive"
                                      src={getThumbImage('medium', data.file)}
                                      alt=""
                                    />
                                  </span>
                                </a>
                              </div>
                            );
                          })}
                        </Slider>
                      </div>
                    </div>
                  </li>
                ) : (
                  ''
                )}

                {this.state.asset && this.state.asset.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>My Trophies and Certificates</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <div className="section-main">
                        <Row>
                          {this.renderBadges(this.state.asset)}
                          {this.renderCertificates(this.state.asset)}
                        </Row>
                      </div>
                    </div>
                  </li>
                ) : null}

                {/* <li className="myProfileInfo--item">
                  <div className="title--with--border">
                    <p>My video at Quiz Bowl</p>
                  </div>
                  <div className="myProfileInfo--item--box">
                    <div className="qb-video text-center">
                      <video controls>
                        <source src="mov_bbb.mp4" type="video/mp4" />
                        <source src="mov_bbb.ogg" type="video/ogg" />
                        Your browser does not support HTML5 video.
                      </video>
                    </div>
                  </div>
                </li> */}
                {this.state.userRecommendations &&
                this.state.userRecommendations.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>Recommendation</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <Row className="show-grid">
                        {this.state.userRecommendations.map((item, index) =>
                          index <= 2 ? (
                            <Col md={4}>
                              <div className="u-rec text-center">
                                {item.recommender.profilePicture ? (
                                  <img
                                    src={getThumbImage(
                                      'medium',
                                      item.recommender.profilePicture
                                    )}
                                    alt=""
                                  />
                                ) : (
                                  <span className="icon-user_default2 default-icon centeredBox ma" />
                                )}
                                <h5 className="m-t-15">
                                  {item.recommender.firstName} &nbsp;
                                  {item.recommender.lastName}
                                </h5>
                                <p className="m-t-15 u-summary">
                                  {item.stage === 'Requested'
                                    ? item.title
                                    : limitCharacter(item.recommendation, 200)}
                                </p>
                                <button
                                  className="btn-link m-t-15"
                                  onClick={this.showRecommendationComponent.bind(
                                    this,
                                    item,
                                    ''
                                  )}
                                >
                                  Read More
                                </button>
                                {/* <div className="helpful">
                                    <span>Helpful?</span>
                                    <span class="icon-badges icon" />
                                    <sapn>120</sapn>
                                  </div> */}
                              </div>
                            </Col>
                          ) : (
                            ''
                          )
                        )}
                        {this.state.showRecommendationComponent === true ? (
                          <CompetencyRecommendations
                            closeRecommendationComponent={
                              this.showRecommendationComponent
                            }
                            recommandationData={this.state.recommandationData}
                            competencyName={this.state.competencyName}
                          />
                        ) : (
                          ''
                        )}
                      </Row>
                      <div className="text-center">
                        <button
                          className="btn btn-primary md-btn"
                          onClick={() =>
                            this.props.history.push({
                              pathname: '/student/recommendations',
                              state: {
                                loggedInUser: this.state.userId
                              }
                            })
                          }
                        >
                          See All
                        </button>
                      </div>
                    </div>
                  </li>
                ) : (
                  ''
                )}

                {this.state.achievements &&
                this.state.achievements.length > 0 ? (
                  <li className="myProfileInfo--item">
                    <div className="title--with--border">
                      <p>Other {this.state.competencyName} Acomplishment</p>
                    </div>
                    <div className="myProfileInfo--item--box">
                      <div className="section-main">
                        <Slider {...achievementSettings} className="slider">
                          {this.state.achievements.map((achievement, index) => (
                            <div className="slider-item" key={index}>
                              <a style={{ cursor: 'default' }}>
                                <span className="image-section">
                                  {achievement.asset.length === 0 ? (
                                    <img
                                      className="img-responsive"
                                      src={achievementDefaultImage}
                                      alt=""
                                    />
                                  ) : achievement.asset[0].type === 'image' ? (
                                    <img
                                      className="img-responsive"
                                      src={getThumbImage(
                                        'medium',
                                        achievement.asset[0].file
                                      )}
                                      alt=""
                                    />
                                  ) : (
                                    <img
                                      className="img-responsive"
                                      src={achievementDefaultImage}
                                      alt=""
                                    />
                                  )}
                                </span>
                                <span className="image-section-title">
                                  {achievement.title}
                                </span>
                              </a>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    </div>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    parent: state.User.parentData,
    student: state.Student
  };
};

export default connect(
  mapStateToProps,
  null
)(AchievementDetail);
