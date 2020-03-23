import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Form, Checkbox, Radio } from 'react-bootstrap';
import _ from 'lodash';
import achievementDefaultImage from '../../../assets/img/default_achievement.jpg';
import Slider from 'react-slick';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

import {
  SamplePrevArrow,
  SampleNextArrow,
  limitCharacter,
  getThumbImage
} from '../../../common/commonFunctions';
import spikeViewApiService from '../../../common/core/api/apiService';
import Recommendation from '../competency/recommendations/addRecommendation';
import Achievement from '../competency/achievements/addAchievement';

class addCompetency extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      isLoading: false,
      showAchievementComponent: false,
      showRecommendationComponent: false,
      competencyModal: true,
      level2CompetnecyData: [],
      level2CompetencyId: '',
      compentencyName: '',
      compentencyList: [],
      levelThreeCompetency: [],
      achievementData: [],
      achievementRow: '',
      enableButton: false,
      confirmSummary: false
    };
    this.returnDataModal = this.returnDataModal.bind(this);
  }

  showAchievementComponent = (
    competencyTypeId,
    achievementRow,
    levelThreeCompetency,
    level2Competency
  ) => {
    this.setState({
      showAchievementComponent: !this.state.showAchievementComponent,
      competencyTypeId,
      level2Competency,
      achievementRow,
      levelThreeCompetency
    });
  };

  saveAchievementComponent = (
    competencyTypeId,
    achievementRow,
    levelThreeCompetency,
    level2Competency
  ) => {
    this.setState({
      showAchievementComponent: !this.state.showAchievementComponent,
      competencyTypeId,
      level2Competency,
      achievementRow,
      levelThreeCompetency,
      enableButton: true
    });
  };

  showRecommendationComponent = (
    competencyTypeId,
    levelThreeCompetency,
    level2Competency
  ) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      competencyTypeId,
      levelThreeCompetency,
      level2Competency
    });
  };

  saveRecommendationComponent = (
    competencyTypeId,
    levelThreeCompetency,
    level2Competency
  ) => {
    this.setState({
      showRecommendationComponent: !this.state.showRecommendationComponent,
      competencyTypeId,
      levelThreeCompetency,
      level2Competency,
      enableButton: true
    });
  };

  closeCompetencyModal = action => {
    this.setState({
      competencyModal: !this.state.competencyModal
    });
    this.props.closeCompetencyComponent();
    if (action == 1) {
      this.closeCompetencyModalCross();
    }

    //  if (!this.state.enableButton) return false;

    // this.setState({
    //   showAchievementComponent: !this.state.showAchievementComponent
    // });
    // let _this = this;
    // setTimeout(function() {
    //   _this.closeCompetencyModalCross();
    // }, 500);

    //this.props.renderRecommendationsByCompetency(9, 'Social Studies');
  };

  handleClickDelete = () => {
    this.props.contentEditable();
  };

  closeCompetencyModalCross = () => {
    if (
      (this.props.student.onlyAchievement.length === 1 ||
        this.props.student.achievementData.length === 1) &&
      (this.props.user.summary === '' || this.props.user.summary === null) &&
      this.state.mode === 1
      //&&      this.state.enableButton === true
    ) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui">
              {/* <h1>Are you sure?</h1> */}
              <p>
                Great job! Would you like to add a summary statement for your
                profile now – something that describes who you are in a sentence
                or two?
              </p>
              <button
                onClick={() => {
                  this.handleClickDelete();
                  onClose();
                }}
              >
                Add Summary
              </button>

              <button
                onClick={() => {
                  onClose();
                }}
              >
                No Thanks
              </button>
            </div>
          );
        }
      });
    }
    this.setState({ competencyModal: false });
    // this.props.closeCompetencyComponent();
    // this.props.getAchievementsByUser();
    this.props.getRecommendationsByUser();
    //this.props.renderRecommendationsByCompetency(9, 'Social Studies');
  };

  componentDidMount() {
    this.setState({
      mode: this.props.mode
    });
    this.setAchievementData(this.props);
  }

  componentWillReceiveProps(res) {
    this.setAchievementData(res);
  }

  setAchievementData = data => {
    let userId = data.userId;
    let mode = data.mode;
    let competencyData = data.student.competencyData;
    let achievementData = [];
    let compArray = [];

    let level1Competency = data.level1Competency;
    let level2CompetencyId =
      mode === 1 ? this.state.competencyTypeId : data.level2CompetencyId;
    let level2CompetnecyData = _.filter(competencyData, {
      level1: level1Competency
    });

    if (level2CompetnecyData.length > 0) {
      // Code to add new competency data
      if (mode === 1) {
        level2CompetnecyData = level2CompetnecyData[0].level2;
        let studentAchievement = data.student.achievementData;
        if (studentAchievement.length > 0) {
          try {
            achievementData = _.filter(studentAchievement, {
              _id: level2CompetencyId
            });
            achievementData = achievementData[0].achievement;
          } catch (error) {}
        }

        this.setState((prevState, props) => {
          let _achievementData = { ...prevState.achievementData };
          if (!_achievementData[level2CompetencyId])
            _achievementData[level2CompetencyId] = [];
          _achievementData[level2CompetencyId] = achievementData;
          return {
            level2CompetnecyData: level2CompetnecyData,
            userId: userId,
            level2CompetencyId: level2CompetencyId,
            compentencyName: level1Competency,
            achievementData: _achievementData
          };
        });
      }

      // Code to edit competency data
      if (mode === 2) {
        this.setState({
          compentencyList: []
        });
        level2CompetnecyData = _.filter(
          level2CompetnecyData[0].level2,
          function(o) {
            return o.competencyTypeId === level2CompetencyId;
          }
        );
        let levelThreeCompetency = level2CompetnecyData[0].level3;

        compArray.push({
          name: level2CompetnecyData[0].name,
          id: level2CompetnecyData[0].competencyTypeId,
          levelThreeCompetency: levelThreeCompetency
        });

        if (level2CompetencyId !== '') {
          let studentAchievement = data.student.achievementData;
          if (studentAchievement.length > 0) {
            achievementData = _.filter(studentAchievement, {
              _id: level2CompetencyId
            });
            if (achievementData && achievementData.length > 0) {
              achievementData = achievementData[0].achievement;
            }
          }
        }

        this.setState({
          compentencyList: compArray,
          levelThreeCompetency: levelThreeCompetency,
          level2CompetnecyData: [],
          userId: userId,
          level2CompetencyId: level2CompetencyId,
          compentencyName: level1Competency,
          achievementData: achievementData
        });
      }
    }
  };

  handleChange = (name, id, levelThreeCompetency, event) => {
    let achievementData = this.props.student.achievementData;
    //let compArray = this.state.compentencyList || [];
    let compArray = [];
    achievementData = _.filter(achievementData, {
      _id: id
    });

    if (achievementData.length > 0) {
      if (event.target.checked) {
        document.getElementById('type_' + id).classList.add('checked');
        achievementData = achievementData[0].achievement;
        let counter = 0;
        for (var index = 0; index < compArray.length; index++) {
          var element = compArray[index];
          if (element.id === id) counter++;
        }
        if (!counter)
          compArray.push({
            name: name,
            id: id,
            levelThreeCompetency: levelThreeCompetency,
            totalRecord: achievementData.length
          });

        this.setState((prevState, props) => {
          let _achievementData = { ...prevState.achievementData };

          if (!_achievementData[id]) _achievementData[id] = [];
          _achievementData[id] = _.uniq([
            ..._achievementData[id],
            ...achievementData
          ]);

          return {
            achievementData: _achievementData,
            level2CompetencyId: id,
            compentencyList: compArray,
            levelThreeCompetency: levelThreeCompetency
          };
        });
      } else {
        document.getElementById('type_' + id).classList.remove('checked');
        _.findIndex(compArray, function(o, i) {
          if (o.id === id) {
            return compArray.splice(i, 1);
          }
        });
        this.setState({
          compentencyList: compArray
        });
      }
    } else {
      //compArray = this.state.compentencyList;
      compArray = [];
      if (event.target.checked) {
        var elems = document.querySelectorAll('.checked');
        if (elems) {
          [].forEach.call(elems, function(el) {
            el.classList.remove('checked');
          });
        }

        document.getElementById('type_' + id).classList.add('checked');
        compArray.push({
          name: name,
          id: id,
          levelThreeCompetency: levelThreeCompetency,
          totalRecord: 0
        });
      } else {
        //  document.getElementById('type_' + id).classList.remove('checked');
        _.findIndex(compArray, function(o, i) {
          if (o.id === id) {
            return compArray.splice(i, 1);
          }
        });
      }
      this.setState({
        level2CompetencyId: id,
        compentencyList: compArray,
        levelThreeCompetency: levelThreeCompetency
      });
    }
  };

  deleteAchievement = (achievementId, competencyTypeId) => {
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
                        this.setState(
                          { competencyTypeId: competencyTypeId },
                          () => self.props.getAchievementsByUser()
                        );
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

  returnDataModal(dataArray, key) {
    if (this.props.mode === 1) {
      if (dataArray[key]) return dataArray[key];
      return dataArray || [];
    } else {
      return dataArray || [];
    }
  }

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

  render() {
    var self = this,
      achievementSettings = {
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

    return (
      <Modal
        bsSize="large"
        show={this.state.competencyModal}
        onHide={this.closeCompetencyModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">Competency</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.state.mode === 1 ? (
            this.state.compentencyName === 'Life Experiences' ? (
              <p className="text-center mt-1 mb-0">
                Select from the list below to chronicle your &nbsp;
                <a style={{ cursor: 'pointer' }}>
                  {this.state.compentencyName || ''}{' '}
                </a>
              </p>
            ) : (
              <p className="text-center mt-1 mb-0">
                Select any from the list below to add your competencies in{' '}
                <a style={{ cursor: 'pointer' }}>
                  {this.state.compentencyName || ''}{' '}
                </a>
              </p>
            )
          ) : (
            ''
          )}
          <Form horizontal className="lightBgForm">
            {this.state.mode === 1 ? (
              <section className="customLabelCheckbox--wrapper">
                {this.state.level2CompetnecyData.length > 0
                  ? this.state.level2CompetnecyData.map((row, index) => (
                      <article
                        className="customLabelCheckbox"
                        key={index}
                        id={`type_${row.competencyTypeId}`}
                      >
                        <Radio
                          type="radio"
                          className="checkbox-primary"
                          name="aaa"
                          onChange={this.handleChange.bind(
                            this,
                            row.name,
                            row.competencyTypeId,
                            row.level3
                          )}
                          value={row.name}
                        >
                          {row.name}
                          <span className="check" />
                        </Radio>
                      </article>
                    ))
                  : ''}
              </section>
            ) : (
              ''
            )}

            {this.state.showAchievementComponent ? (
              <Achievement
                //closeAchievementComponent={this.showAchievementComponent}
                closeAchievementComponent={this.closeCompetencyModal}
                levelThreeCompetency={this.state.levelThreeCompetency}
                competencyTypeId={this.state.competencyTypeId}
                level2Competency={this.state.level2Competency}
                userId={this.state.userId}
                achievementRow={this.state.achievementRow}
                getAchievementsByUser={this.props.getAchievementsByUser}
                closeSaveAchievementComponent={this.saveAchievementComponent}
                addType="competencyModal"
              />
            ) : null}

            {this.state.showRecommendationComponent ? (
              <Recommendation
                // closeRecommendationComponent={this.showRecommendationComponent}
                closeRecommendationComponent={this.closeCompetencyModal}
                levelThreeCompetency={this.state.levelThreeCompetency}
                competencyTypeId={this.state.competencyTypeId}
                level2Competency={this.state.level2Competency}
                userId={this.state.userId}
                getAchievementsByUser={this.props.getAchievementsByUser}
                getRecommendationsByUser={this.props.getRecommendationsByUser}
                closeSaveRecommendationComponent={
                  this.saveRecommendationComponent
                }
              />
            ) : null}

            {this.state.compentencyList.length > 0
              ? this.state.compentencyList.map((data, i) => (
                  <section key={i}>
                    <div className="section-topbar">
                      <p className="section-title">{data.name}</p>
                      <div className="button-group">
                        {/* <a
                          onClick={this.showAchievementComponent.bind(
                            this,
                            data.id,
                            data.levelThreeCompetency,
                            data.name
                          )}
                          className="btn btn-with-border"
                          style={{ cursor: 'pointer' }}
                        >
                          {' '}
                          + Add Achievement
                        </a> */}

                        <a
                          onClick={this.showAchievementComponent.bind(
                            this,
                            data.id,
                            '',
                            data.levelThreeCompetency,
                            data.name
                          )}
                          className={
                            data.totalRecord === 0 && this.state.mode === 1
                              ? 'btn btn-primary with-icon smallBtn mr-1'
                              : 'btn btn-with-border with-icon smallBtn'
                          }
                          style={{ cursor: 'pointer' }}
                          title={data.totalRecord}
                        >
                          {' '}
                          <span className="icon-plus" /> Add Achievement
                        </a>

                        <a
                          className="btn btn-with-border with-icon smallBtn"
                          onClick={this.showRecommendationComponent.bind(
                            this,
                            data.id,
                            data.levelThreeCompetency,
                            data.name
                          )}
                        >
                          {' '}
                          <span className="icon-plus" /> Add Recommendation
                        </a>
                      </div>
                    </div>

                    {/*this.returnDataModal(this.state.achievementData, data.id)
                      .length > 0 ? (
                      <div className="section-main">
                        <div className="section-main-title">Achievements</div>
                        <Slider
                          {...achievementSettings}
                          className="slider withLongTitle--250"
                        >
                          {this.returnDataModal(
                            this.state.achievementData,
                            data.id
                          ).map((achievementRow, i) => (
                            <div className="slider-item" key={i}>
                              <a style={{ cursor: 'pointer' }}>
                                <span className="image-section">
                                  <span className="hover-content">
                                    <ul className="controls-links">
                                      <li>
                                        <span
                                          className="icon-edit_pencil"
                                          onClick={this.showAchievementComponent.bind(
                                            this,
                                            this.state.level2CompetencyId,
                                            achievementRow,
                                            data.levelThreeCompetency,
                                            data.name
                                          )}
                                        />
                                      </li>
                                      <li>
                                        <span
                                          className="icon-delete"
                                          onClick={this.deleteAchievement.bind(
                                            this,
                                            achievementRow.achievementId,
                                            data.id
                                          )}
                                        />
                                      </li>
                                    </ul>
                                  </span>
                                  {/* <span className="image-section-links">
                                  <div className="likes--count">
                                    <span className="icon-camera icon icon" />
                                    23
                                  </div>
                                  <span className="image-section--category">
                                    12th Grade
                                  </span>
                                </span> }
                                  {this.renderMedia(achievementRow.asset)}
                                  {/*achievementRow.asset &&
                                  achievementRow.asset.length === 0 ? (
                                    <img
                                      className="img-responsive"
                                      src={achievementDefaultImage}
                                      onClick={self.openAchievementPage.bind(
                                        self,
                                        achievementRow
                                      )}
                                      alt=""
                                    />
                                  ) : achievementRow.asset[0].type ===
                                  'image' ? (
                                    <img
                                      className="img-responsive"
                                      src={`${CONSTANTS.azureBlobURI}/${
                                        CONSTANTS.azureContainer
                                      }/${achievementRow.asset[0].file}`}
                                      onClick={self.openAchievementPage.bind(
                                        self,
                                        achievementRow
                                      )}
                                      alt=""
                                    />
                                  ) : (
                                    <img
                                      className="img-responsive"
                                      src={achievementDefaultImage}
                                      onClick={self.openAchievementPage.bind(
                                        self,
                                        achievementRow
                                      )}
                                      alt=""
                                    />
                                      )
                                </span>
                                <span className="image-section-title">
                                  {limitCharacter(achievementRow.title, 40)}
                                </span>
                              </a>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    ) : (
                      ''
                    )*/}

                    <article />
                  </section>
                ))
              : ''}
            <div className="flex align-center justify-content-between fullWidth" />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="text-center">
            {/* <Button
              bsStyle={this.state.enableButton ? 'primary' : 'default'}
              disabled={this.state.enableButton ? false : true}
              className="no-bold no-round"
              onClick={this.closeCompetencyModal}
            >
              Done
            </Button> */}
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    student: state.Student
  };
};

export default connect(
  mapStateToProps,
  null
)(addCompetency);
