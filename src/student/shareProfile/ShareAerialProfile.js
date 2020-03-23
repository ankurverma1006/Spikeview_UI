import React, { Component } from 'react';
import {
  Media,
  Carousel,
  Nav,
  NavDropdown,
  MenuItem,
  Glyphicon
} from 'react-bootstrap';
import Slider from 'react-slick';
import _ from 'lodash';

import achievementDefaultImage from '../../assets/img/default_achievement.jpg';
import { getThumbImage } from '../../common/commonFunctions';
import SpiderChart from '../../common/spiderChart/spiderChart';
import CONSTANTS from '../../common/core/config/appConfig';
import AddSoundTrack from './addSoundTrack';

class ShareAerialProfile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      show: false,
      index: 0,
      direction: null,
      level1Competency: [],
      achievementList: [],
      recommandationData: [],
      slideIndex: 0,
      updateCount: 0,
      showSoundTrackComponent: false,
      sasToken: '',
      themes: [
        '1.jpg',
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg'
      ],
      selectedTheme: ''
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleFirstLevelSlideChange = this.handleFirstLevelSlideChange.bind(
      this
    );
  }

  showSoundTrackComponent = file => {
    this.setState({
      showSoundTrackComponent: !this.state.showSoundTrackComponent
    });
    if (file) {
      this.props.handleSoundTrack(file);
    }
  };

  handleSelect(selectedIndex, e) {
    this.setState({
      index: selectedIndex,
      direction: e.direction
    });
  }

  handleSlideChange = slideIndex => {
    this.setState({
      index: slideIndex,
      direction: slideIndex <= this.state.index ? 'prev' : 'next'
    });
  };

  componentWillMount() {
    if (this.props.achievementData.length > 0) {
      var achievementData = this.props.achievementData;
      var recommandationData = this.props.recommandationData;

      this.setState({
        recommandationData: recommandationData
      });

      this.setFilteredData(achievementData);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.achievementData.length > 0) {
      var achievementData = nextProps.achievementData;
      var recommandationData = nextProps.recommandationData;
      this.setState({
        recommandationData: recommandationData
      });

      this.setFilteredData(achievementData);
    }
  }

  setFilteredData = filteredAchievementData => {
    var achievemenList = [];
    var secondLevel = [];
    var _achievementData = [];
    var level1Competency = _.uniq(_.map(filteredAchievementData, 'level1'));

    for (let index = 0; index < filteredAchievementData.length; index++) {
      let data = filteredAchievementData[index];
      if (data.achievement.length > 0) {
        achievemenList.push({ level1: data.level1 });
      }
    }

    achievemenList = _.uniqBy(achievemenList, function(p) {
      return p.level1;
    });

    for (var index1 = 0; index1 < achievemenList.length; index1++) {
      var element1 = achievemenList[index1];
      secondLevel = [];
      _achievementData = [];
      for (var index2 = 0; index2 < filteredAchievementData.length; index2++) {
        var element2 = filteredAchievementData[index2];
        if (element1.level1 === element2.level1) {
          if (element2.achievement.length > 0) {
            secondLevel.push({ level2: element2.name, id: element2._id });
            for (
              var index3 = 0;
              index3 < element2.achievement.length;
              index3++
            ) {
              _achievementData.push(element2.achievement[index3]);
            }
            achievemenList[index1]['level2'] = secondLevel;
            achievemenList[index1]['achievement'] = _achievementData;
          }
        }
      }
    }

    this.setState({
      level1Competency,
      level2Competency: achievemenList
    });
  };

  handleFirstLevelSlideChange = (iterationIndex, level1) => {
    let wholeAchievementData = this.state.level2Competency;
    let achievementLength = 0;
    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 1,
        direction: 'next'
      });
    } else {
      for (var i = 0; i < iterationIndex; i++) {
        achievementLength =
          achievementLength + wholeAchievementData[i].achievement.length + 2;
      }

      this.setState({
        index: this.state.index + achievementLength + 1,
        direction: 'next'
      });
    }
  };

  handleSecondLevelSlideChange = (level1, iterationIndex, competencyName) => {
    let wholeAchievementData = this.state.level2Competency;
    let clickedCompetencyData = _.filter(wholeAchievementData, function(o) {
      return o.level1 === level1;
    });

    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 2,
        direction: 'next'
      });
    } else {
      let competencyIndex = _.findIndex(
        clickedCompetencyData[0].achievement,
        function(o) {
          return o.level2Competency === competencyName;
        }
      );

      this.setState({
        index: this.state.index + competencyIndex + 2,
        direction: 'next'
      });
    }
  };

  handleThirdLevelSlideChange = iterationIndex => {
    let totalIndex = 1;
    if (iterationIndex === 0) {
      this.setState({
        index: this.state.index + 1,
        direction: 'next'
      });
    } else {
      for (var i = 0; i < iterationIndex; i++) {
        totalIndex = totalIndex + i;
      }
      this.setState({
        index: this.state.index + totalIndex + 1,
        direction: 'next'
      });
    }
  };

  handleBackSlide = iterationIndex => {
    this.setState({
      index: this.state.index - (iterationIndex + 1),
      direction: 'prev'
    });
  };

  navigateToMedia = iterationIndex => {
    console.log(iterationIndex);
  };

  renderMedia = mediaData => {
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
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          assetData[0].file
        }`;
      } else if (certificatesData.length > 0) {
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          certificatesData[0].file
        }`;
      } else if (badgesData.length > 0) {
        imgSource = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/${
          badgesData[0].file
        }`;
      } else {
        imgSource = achievementDefaultImage;
      }
    }
    return <img className="img-responsive" src={imgSource} alt="" />;
  };

  selectTheme = theme => {
    if (theme) {
      this.props.selectedTheme(theme);
      document.getElementById('setTheme').style.backgroundImage =
        "url('../../assets/img/thumb/large/" + theme;
      this.setState({
        selectedTheme: theme
      });
    }
  };

  render() {
    const { index, direction, recommandationData } = this.state;
    let _this = this;
    var settings = {
      dots: false,
      infinite: true,
      speed: 700,
      slidesToShow: 1,
      swipeToSlide: true,
      nextArrow: false,
      prevArrow: false,
      centerMode: true,
      centerPadding: '70px',
      autoplay: true
    };

    const sliderWithThumbnails = {
      autoplay: true,
      dots: true,
      dotsClass: 'slick-dots slick-thumb',
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    const verticalSlider = {
      dots: false,
      autoplay: true,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      vertical: true,
      verticalSwiping: true,
      nextArrow: false,
      prevArrow: false
    };

    let colorPalatte = <span className="icon-select_theme" />;
    let AddTrack = <span className="icon-add_sound" />;

    return (
      <div className=" profile-achievement-ariel-view" id="setTheme">
        <Nav className="shareProfile--controls">
          <NavDropdown eventKey="3" title={AddTrack} id={3}>
            <MenuItem eventKey="3.1" onClick={this.showSoundTrackComponent}>
              Add sound for all slides
            </MenuItem>
            {/* <MenuItem eventKey="3.1" disabled>
              Advance
            </MenuItem> */}
          </NavDropdown>

          <NavDropdown eventKey="4" title={colorPalatte} id={4}>
            <div className="thumbnail-slide">
              {this.state.themes && this.state.themes.length > 0
                ? this.state.themes.map((theme, index) => (
                    <MenuItem eventKey="3.1" key={index}>
                      <div className="avBox" key={index}>
                        <input
                          type="radio"
                          name="themeBG"
                          id="av-thumb"
                          className="input-hidden"
                          checked={
                            this.state.selectedTheme === theme ? true : false
                          }
                          value={theme}
                        />
                        <label htmlFor="av-thumb">
                          <img
                            src={`../../assets/img/thumb/small/${theme}`}
                            alt="I'm av-thumb"
                            onClick={this.selectTheme.bind(this, theme)}
                          />
                        </label>
                        <span className="mask">
                          {' '}
                          <Glyphicon glyph="ok" />
                        </span>
                      </div>
                    </MenuItem>
                  ))
                : ''}
            </div>
          </NavDropdown>
        </Nav>
        {this.state.showSoundTrackComponent ? (
          <AddSoundTrack
            closeSoundTrackComponent={this.showSoundTrackComponent}
            sasToken={this.state.sasToken}
            userId={this.props.userData.userId}
            token={this.props.userData.token}
          />
        ) : null}
        <div id="myCarousel" className="carousel slide animatedSlider">
          <Carousel
            activeIndex={index}
            direction={direction}
            onSelect={this.handleSelect}
            interval={500000}
            slide={false}
            indicators={false}
            nextIcon={<span className="icon-right_carousel" />}
            prevIcon={<span className="icon-left_carousel" />}
            wrap={false}
          >
            <Carousel.Item>
              <div className="fill centered-box">
                <div className="fillBg">
                  <span className="randomBGlines" />
                </div>
                <div className="user-profile">
                  <Media className="school-info--wrapper">
                    <Media.Left className="animated rollIn">
                      {!this.props.userData.profilePicture ? (
                        <span className="icon-user_default2 pp-default" />
                      ) : (
                        <img
                          className="object-fit-cover"
                          src={getThumbImage(
                            'medium',
                            this.props.userData.profilePicture
                          )}
                          alt=""
                        />
                      )}
                    </Media.Left>
                    <Media.Body className="animated fadeInDown">
                      <Media.Heading className="s--name">
                        {this.props.userData.firstName
                          ? this.props.userData.firstName
                          : ''}{' '}
                        {this.props.userData.lastName
                          ? this.props.userData.lastName
                          : ''}
                      </Media.Heading>
                      <p className="s--duration">
                        {this.props.userData.email
                          ? this.props.userData.email
                          : ''}
                      </p>
                      <p className="s--summary">
                        {this.props.userData.summary
                          ? this.props.userData.summary
                          : ''}
                      </p>
                    </Media.Body>
                  </Media>
                </div>
              </div>
            </Carousel.Item>

            <Carousel.Item>
              <div className="fill centered-box">
                <div className="fillBg">
                  <span className="randomBGlines" />
                </div>
                <div className="second-fold--inner">
                  <ul className="up--links animated fadeInLeft">
                    <li>
                      <a onClick={this.handleSlideChange.bind(this, 0)}>
                        Summary
                      </a>
                    </li>
                    <li>
                      <a onClick={this.handleSlideChange.bind(this, 2)}>
                        Education
                      </a>
                    </li>
                    {this.state.level2Competency &&
                    this.state.level2Competency.length > 0 ? (
                      <li>
                        <a onClick={this.handleSlideChange.bind(this, 3)}>
                          Narrative
                        </a>
                      </li>
                    ) : (
                      ''
                    )}
                  </ul>

                  <div className="up--graph animated fadeInRight">
                    <SpiderChart
                      userId={this.props.userData.userId}
                      sharedId="0"
                      type="aerial"
                    />
                  </div>
                </div>
              </div>
            </Carousel.Item>

            <Carousel.Item>
              <div className="fill">
                <h2 className="animated fadeInRight text-center">Education</h2>
                <div className="educationSlider ">
                  <Slider {...settings} className="slider partial-view--slider">
                    {this.props.educationData &&
                    this.props.educationData.length > 0 ? (
                      this.props.educationData.map((data, educationIndex) => (
                        <div className="slider-item" key={educationIndex}>
                          <Media className="school-info--wrapper">
                            <Media.Left className="animated rollIn">
                              <div className="img">
                                {data.logo !== '' ? (
                                  <img
                                    src={getThumbImage('medium', data.logo)}
                                    alt=""
                                  />
                                ) : (
                                  <span className="icon-school icon lg-icon" />
                                )}
                              </div>
                            </Media.Left>
                            <Media.Body className="animated fadeInDown">
                              <Media.Heading className="s--name">
                                {data.institute}
                              </Media.Heading>
                              <p className="s--duration">
                                {data.fromGrade} to {data.toGrade}{' '}
                                <span className="s--year">
                                  {data.fromYear} to {data.toYear}{' '}
                                </span>
                              </p>
                              <p className="s--summary">{data.description}</p>
                            </Media.Body>
                          </Media>
                        </div>
                      ))
                    ) : (
                      <div className="slider-item">No Data Available</div>
                    )}
                  </Slider>
                </div>
              </div>
            </Carousel.Item>

            {this.state.level2Competency &&
            this.state.level2Competency.length > 0 ? (
              <Carousel.Item>
                <div className="fill">
                  <h2 className="animated fadeInRight text-center">
                    My Narrative
                  </h2>
                  <ul className="circular-links floatingCircle">
                    {this.state.level2Competency.map((item, indexLevel) => (
                      <li className="animated rollIn" key={indexLevel}>
                        {item.level1 === 'Academic Competency' ? (
                          <a
                            onClick={_this.handleFirstLevelSlideChange.bind(
                              _this,
                              indexLevel,
                              item.level1
                            )}
                          >
                            <span className="icon-academic c--icon" />
                            <span className="c--title">Academic</span>
                          </a>
                        ) : item.level1 === 'Sports Competency' ? (
                          <a
                            onClick={_this.handleFirstLevelSlideChange.bind(
                              _this,
                              indexLevel,
                              item.level1
                            )}
                          >
                            <span className="icon-sports c--icon" />
                            <span className="c--title">Sports</span>
                          </a>
                        ) : item.level1 === 'Arts Competency' ? (
                          <a
                            onClick={_this.handleFirstLevelSlideChange.bind(
                              _this,
                              indexLevel,
                              item.level1
                            )}
                          >
                            <span className="icon-arts c--icon" />
                            <span className="c--title">Arts</span>
                          </a>
                        ) : item.level1 === 'Vocational Competency' ? (
                          <a
                            onClick={_this.handleFirstLevelSlideChange.bind(
                              _this,
                              indexLevel,
                              item.level1
                            )}
                          >
                            <span className="icon-vocational c--icon" />
                            <span className="c--title">Vocational</span>
                          </a>
                        ) : (
                          ''
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Carousel.Item>
            ) : (
              ''
            )}

            {_this.state.level2Competency &&
            _this.state.level2Competency.length > 0
              ? _this.state.level2Competency.map(function(level2, index1) {
                  return [
                    level2.achievement.length > 0 ? (
                      <Carousel.Item>
                        <div className="fill">
                          <div className="fillBg">
                            <span className="icon-sports bgIcon" />
                          </div>

                          <ul className="fold--links">
                            <li>
                              <a>Narrative</a>
                            </li>

                            <li className="active">
                              <a>{level2.level1}</a>
                            </li>
                          </ul>

                          <ul className="circular-links">
                            {level2.level2.map((item, index2) => (
                              <li className="animated rollIn" key={item.id}>
                                <a
                                  onClick={_this.handleSecondLevelSlideChange.bind(
                                    _this,
                                    level2.level1,
                                    index2,
                                    item.level2
                                  )}
                                >
                                  <span
                                    className={`c--icon ${
                                      CONSTANTS.icons[item.id]
                                    }`}
                                  />
                                  <span className="c--title">
                                    {item.level2}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Carousel.Item>
                    ) : (
                      ''
                    ),
                    level2.achievement.length > 0 ? (
                      <Carousel.Item>
                        <div className="fill">
                          <h2 className="animated fadeInDown text-center absolute">
                            {' '}
                            Achievement
                          </h2>
                          <div className="acivementsWrapper flex-1">
                            <div className="aw--content animated fadeInLeft">
                              {recommandationData &&
                              recommandationData.length > 1 ? (
                                <Slider {...verticalSlider}>
                                  {recommandationData.map((user, index4) => (
                                    <div className="slider-item" key={index4}>
                                      <div className="aw--userDetails">
                                        <div className="aw--userIcon">
                                          {user.recommender.profilePicture ? (
                                            <img
                                              className="object-fit-cover"
                                              src={getThumbImage(
                                                'medium',
                                                user.recommender.profilePicture
                                              )}
                                              alt=""
                                            />
                                          ) : (
                                            <span className="icon-user_default2" />
                                          )}
                                        </div>
                                        <div className="aw--userName">
                                          {user.recommender.firstName} &nbsp;
                                          {user.recommender.lastName}
                                        </div>
                                        <div className="aw--userDesig">
                                          {user.recommender.title}
                                        </div>
                                        <div className="aw--userDesc">
                                          {user.recommendation}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </Slider>
                              ) : recommandationData &&
                                recommandationData.length === 1 ? (
                                recommandationData.map((user, index5) => (
                                  <div className="slider-item">
                                    <div className="aw--userDetails">
                                      <div className="aw--userIcon">
                                        {user.recommender.profilePicture ? (
                                          <img
                                            className="object-fit-cover"
                                            src={getThumbImage(
                                              'medium',
                                              user.recommender.profilePicture
                                            )}
                                            alt=""
                                          />
                                        ) : (
                                          <span className="icon-user_default2" />
                                        )}
                                      </div>
                                      <div className="aw--userName">
                                        {user.recommender.firstName} &nbsp;
                                        {user.recommender.lastName}
                                      </div>
                                      <div className="aw--userDesig">
                                        {user.recommender.title}
                                      </div>
                                      <div className="aw--userDesc">
                                        {user.recommendation}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                ''
                              )}
                            </div>

                            <div className="aw--carousel partial-view--slider achievement-slider animated fadeInRight">
                              <Slider {...settings}>
                                {level2.achievement.map((image, index5) => (
                                  <div
                                    className="slider-item"
                                    key={index5}
                                    onClick={_this.handleThirdLevelSlideChange.bind(
                                      _this,
                                      index5
                                    )}
                                  >
                                    <a>
                                      <span className="image-section">
                                        {_this.renderMedia(image.asset)}
                                      </span>
                                      <span className="image-section-title">
                                        {image.title}
                                      </span>
                                    </a>
                                  </div>
                                ))}
                              </Slider>
                            </div>
                          </div>
                        </div>
                      </Carousel.Item>
                    ) : (
                      ''
                    ),

                    level2.achievement && level2.achievement.length > 0
                      ? level2.achievement.map(function(data, index3) {
                          return [
                            <Carousel.Item>
                              <div
                                className="fill with-space pr-0"
                                id="certifiatesSlider"
                              >
                                <div className="halfGrid" />
                                <div className="withBackArrow">
                                  <a
                                    className="animated fadeInUp"
                                    onClick={_this.handleBackSlide.bind(
                                      _this,
                                      index3
                                    )}
                                  >
                                    <span className="icon-back_arrow2" />
                                  </a>
                                  <h2 className="animated fadeInDown text-center">
                                    {' '}
                                    {data.title}
                                  </h2>
                                </div>
                                <div className="acivementsWrapper flex-1">
                                  <div className="aw--carousel animated fadeInLeft">
                                    {data.asset && data.asset.length > 0 ? (
                                      <Slider {...sliderWithThumbnails}>
                                        {data.asset.map((asset, row) => (
                                          <div
                                            className="slider-item"
                                            key={row}
                                          >
                                            <img
                                              className="img-responsive"
                                              src={`${CONSTANTS.azureBlobURI}/${
                                                CONSTANTS.azureContainer
                                              }/${asset.file}`}
                                              alt="asset"
                                            />
                                          </div>
                                        ))}
                                      </Slider>
                                    ) : (
                                      <img
                                        className="img-responsive"
                                        src={achievementDefaultImage}
                                        alt=""
                                      />
                                    )}
                                  </div>
                                  <div className="aw--content pr-0 scrollableMedia animated fadeInRight">
                                    <div className="achievement-title">
                                      <span className="icon-business" />
                                      <div className="at--title">
                                        {data.level2Competency}
                                      </div>
                                    </div>
                                    <div className="at--desc">
                                      {data.description}
                                    </div>
                                    <h4>Media Gallery</h4>
                                    <ul className="mediaGallery 2-columns">
                                      {data.asset && data.asset.length > 0
                                        ? data.asset.map((asset, row) => (
                                            <li
                                              key={row}
                                              onClick={_this.navigateToMedia.bind(
                                                _this,
                                                row
                                              )}
                                            >
                                              <a>
                                                <img
                                                  className="object-fit-cover"
                                                  src={`${
                                                    CONSTANTS.azureBlobURI
                                                  }/${
                                                    CONSTANTS.azureContainer
                                                  }/${asset.file}`}
                                                  alt="asset"
                                                />
                                              </a>
                                            </li>
                                          ))
                                        : data.badge && data.badge.length > 0
                                        ? data.badge.map((badge, row1) => (
                                            <li key={row1}>
                                              <a>
                                                <img
                                                  className="object-fit-cover"
                                                  src={`${
                                                    CONSTANTS.azureBlobURI
                                                  }/${
                                                    CONSTANTS.azureContainer
                                                  }/${badge.file}`}
                                                  alt="badge"
                                                />
                                              </a>
                                            </li>
                                          ))
                                        : data.certificate &&
                                          data.certificate.length > 0
                                        ? data.certificate.map(
                                            (certificate, row2) => (
                                              <li key={row2}>
                                                <a>
                                                  <img
                                                    className="object-fit-cover"
                                                    src={`${
                                                      CONSTANTS.azureBlobURI
                                                    }/${
                                                      CONSTANTS.azureContainer
                                                    }/${certificate.file}`}
                                                    alt="certificate"
                                                  />
                                                </a>
                                              </li>
                                            )
                                          )
                                        : ''}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </Carousel.Item>
                          ];
                        })
                      : ''
                  ];
                })
              : ''}
          </Carousel>
        </div>
      </div>
    );
  }
}
export default ShareAerialProfile;
