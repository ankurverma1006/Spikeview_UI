import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import CONSTANTS from '../../common/core/config/appConfig';
import Header from '../header/header';
import { confirmAlert } from 'react-confirm-alert';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage } from '../../common/commonFunctions';
import { Link } from 'react-router-dom';

class GroupListAll extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      disabled: false,
      groupList: [],
      connectionLoader: true
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('home');
    document.body.classList.add('fixedHeader');
  }

  componentDidMount() {
    console.log(this.props.location);
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.link === 'joingroup'
    ) {
      let dataJson = {
        groupId: this.props.location.state.groupId,
        userId: this.props.user.userId,
        status: CONSTANTS.groupStatus.ACCEPTED
      };
      this.updateMemeberStatusForGroup(dataJson);
    } else {
      this.getGroupList();
    }
    if (this.props.user) {
      this.setState({ userId: this.props.user.userId });
    }
  }

  updateMemeberStatusForGroup(data) {
    spikeViewApiService('updateMemberStatus', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          this.getGroupList();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getGroupList() {
    let userId = this.props.user.userId;
    spikeViewApiService('getGroupListByUser', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let groupList = response.data.result;
          console.log('groupList ',groupList);
          this.setState({
            groupList,
            connectionLoader: false
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  deleteGroup = groupId => {
    let self = this;
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="custom-ui">
            <p>Are you sure you want to delete this group?</p>
            <button onClick={onClose}>No</button>
            <button
              onClick={() => {
                let data = {
                  groupId: parseInt(groupId, 10)
                };
                if (groupId) {
                  spikeViewApiService('deleteGroupByGroupId', data)
                    .then(response => {
                      if (response && response.data.status === 'Success') {
                        onClose();
                        let groupList = this.state.groupList;
                        let index = groupList.findIndex(
                          todo => todo.groupId === groupId
                        );
                        groupList.splice(index, 1);
                        self.setState({ groupList: groupList });
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

  revokeGroup = data => {
    let userId = this.props.user.userId;
    let groupId = parseInt(data.groupId, 10);
    let collectData = {
      userId,
      groupId
    };
    spikeViewApiService('revokeGroupByGroupId', collectData)
      .then(response => {
        if (response && response.data.status === 'Success') {
          let groupList = this.state.groupList;
          let index = groupList.findIndex(
            todo => todo.groupId === parseInt(groupId, 10)
          );
          if (index !== -1) groupList.splice(index, 1);
          this.setState({ groupList: groupList });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateMemeberStatus = (data, action) => {
    console.log(data);
    let dataJson = {
      groupId: data.groupId,
      userId: this.state.userId,
      status: action
    };
    this.updateMemeberStatusForGroup(dataJson);
  };

  render() {
    let _this = this;
    let centeredLoader = {
      position: 'absolute',
      height: '100%'
    };
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        <div className="profileBox">
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                <div className="title--with--border rightSide">
                  <p>Your Groups</p>
                </div>
                {this.state.connectionLoader === true ? (
                  <div className="loading-wrapper" style={centeredLoader}>
                    <img
                      className="ml-1"
                      src="../assets/img/svg-loaders/three-dots.svg"
                      width="40"
                      alt="loader"
                    />
                  </div>
                ) : (
                  ''
                )}
                {this.state.groupList &&
                  this.state.groupList.map(function(data, index) {
                    console.log(data.status);
                    let memberNumber = 0,
                      groupStatus;
                    data.members &&
                      data.members.map(function(data) {
                        if (data.status == CONSTANTS.groupStatus.ACCEPTED) {
                          ++memberNumber;
                        }
                        if (data.userId == _this.state.userId) {
                          groupStatus = data.status;
                        }
                      });
                    return (
                      <div
                        className="suggestion-usd border-light no-shadow"
                        key={index}
                      >
                        <div className="student-img h-120">
                          <div className="pp-default small">
                            {data.groupImage ? (
                              <img
                                src={getThumbImage('medium', data.groupImage)}
                                className="object-fit-cover groupBanner--img"
                                alt=""
                              />
                            ) : (
                              <span className="icon-all_connections icon" />
                            )}
                          </div>
                        </div>
                        <div className="group-info">
                          <div className="flex align-center justify-content-between height--100">
                            <div className="flex-1">
                              <Link
                                to={{
                                  pathname: '/student/groupFeed',
                                  state: {
                                    groupId: data.groupId
                                  }
                                }}
                              >
                                <h3 className="primary-text group--title">
                                  {data.groupName}
                                </h3>
                              </Link>
                              {data.createdBy === _this.state.userId ? (
                                <span className="admin">admin</span>
                              ) : null}
                              <ul className="group-features">
                                <li>{data.type + ' group'}</li>
                                <li>
                                  {}
                                  {memberNumber + ' member'}
                                </li>
                                <li>
                                  created on:{' '}
                                  {moment(data.creationDate).format(
                                    'DD-MMM-YYYY'
                                  )}
                                </li>
                              </ul>
                            </div>
                            <div className="flex flex-dir-column">
                              {data.createdBy === _this.state.userId ? (
                                <Button
                                  onClick={_this.deleteGroup.bind(
                                    _this,
                                    data.groupId
                                  )}
                                  className="btn primary btn-with-border"
                                >
                                  Delete
                                </Button>
                              ) : groupStatus ==
                              CONSTANTS.groupStatus.INVITED ? (
                                <ul className="group-features">
                                  <Button
                                    onClick={_this.updateMemeberStatus.bind(
                                      _this,
                                      data,
                                      CONSTANTS.groupStatus.ACCEPTED
                                    )}
                                    className="btn primary with-icon btn-with-border"
                                  >
                                    <span className="icon-connect" /> Accept
                                  </Button>
                                  <Button
                                    onClick={_this.updateMemeberStatus.bind(
                                      _this,
                                      data,
                                      CONSTANTS.groupStatus.REJECTED
                                    )}
                                    className="btn primary with-icon btn-with-border"
                                  >
                                    <span className="icon-connect" /> Reject
                                  </Button>
                                </ul>
                              ) : groupStatus ===
                              CONSTANTS.groupStatus.REQUESTED ? (
                                <Button
                                  className="btn primary btn-with-border"
                                  disabled
                                >
                                  Pending for Approval
                                </Button>
                              ) : (
                                <Button
                                  className="btn primary btn-with-border"
                                  onClick={_this.revokeGroup.bind(_this, data)}
                                >
                                  Leave Group
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
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
)(GroupListAll);
