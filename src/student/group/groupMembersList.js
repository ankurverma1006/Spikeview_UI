import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from '../header/header';
import CONSTANTS from '../../common/core/config/appConfig';
import spikeViewApiService from '../../common/core/api/apiService';
import { Button } from 'react-bootstrap';
import { getThumbImage } from '../../common/commonFunctions';
import { Link } from 'react-router-dom';
class GroupMembersList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      disabled: false
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('home');
    document.body.classList.add('fixedHeader');
  }

  componentDidMount() {
    if (this.props.location && this.props.location.state) {
      let groupInfo = this.props.location.state;
      this.setState({
        groupId: groupInfo.groupId,
        groupOwner: groupInfo.groupOwner
      });
      this.getGroupMemberListByGroupId(groupInfo.groupId);
    }
  }

  getGroupMemberListByGroupId(groupId) {
    spikeViewApiService('getGroupMemberListByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let result = response.data.result;
          let groupMemberList = result.members;
          this.setState({
            groupMemberList: groupMemberList
          });
        }
      }
    );
  }

  updateMemeberStatus = (data, action) => {
    let dataJson = {
      groupId: this.state.groupId,
      userId: data.userId,
      status: action
    };
    spikeViewApiService('updateMemberStatus', dataJson)
      .then(response => {
        if (response && response.data.status === 'Success') {
          let groupMemberList = this.state.groupMemberList;
          let index = groupMemberList.findIndex(
            todo => todo.userId === data.userId
          );
          if (index !== -1) {
            groupMemberList[index].status = action;
          }
          if (action === 'Rejected' && index !== -1) {
            groupMemberList.splice(index, 1);
          }
          this.setState({
            groupMemberList
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    let _this = this;
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        <div className="profileBox">
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                <div className="title--with--border rightSide">
                  <p>Your Groups Members</p>
                </div>
                {this.state.groupMemberList &&
                  this.state.groupMemberList.map(function(data, index) {
                    return _this.state.groupOwner === _this.props.user.userId ||
                      (_this.state.groupOwner !== _this.props.user.userId &&
                        data.status === CONSTANTS.groupStatus.ACCEPTED) ? (
                      <div
                        className="suggestion-usd border-light no-shadow"
                        key={index}
                      >
                        <div className="student-img h-120">
                          <div className="pp-default small">
                            {data.profilePicture ? (
                              <img
                                src={getThumbImage(
                                  'small',
                                  data.profilePicture
                                )}
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
                              {data.roleId === 1 ? (
                                <Link
                                  to={{
                                    pathname:
                                      _this.props.user.userId === data.userId
                                        ? '/student/profile/'
                                        : '/student/profile/' + data.userId
                                  }}
                                >
                                  <h3 className="primary-text group--title">
                                    {data.firstName} {data.lastName}
                                  </h3>
                                </Link>
                              ) : (
                                <Link
                                  to={{
                                    pathname:
                                      _this.props.user.userId === data.userId
                                        ? '/parent/dashboard/'
                                        : '/parent/profile/' + data.userId
                                  }}
                                >
                                  {data.firstName} {data.lastName}
                                </Link>
                              )}
                              {data.isAdmin ? (
                                <span className="admin">admin</span>
                              ) : null}

                              <p className="lead mb-0">
                                <strong>{data.tagline}</strong>
                              </p>
                              <p className="mute mb-0">{data.email}</p>
                            </div>
                            <div className="flex flex-dir-column">
                              {_this.state.groupOwner ===
                                _this.props.user.userId &&
                              data.status ===
                                CONSTANTS.groupStatus.REQUESTED ? (
                                <div>
                                  <Button
                                    onClick={_this.updateMemeberStatus.bind(
                                      _this,
                                      data,
                                      CONSTANTS.groupStatus.ACCEPTED
                                    )}
                                    className="btn primary with-icon btn-with-border"
                                  >
                                    <span class="icon-connect" /> Accept
                                  </Button>

                                  <Button
                                    onClick={_this.updateMemeberStatus.bind(
                                      _this,
                                      data,
                                      CONSTANTS.groupStatus.REJECTED
                                    )}
                                    className="btn primary with-icon btn-with-border"
                                  >
                                    <span class="icon-connect" /> Reject
                                  </Button>
                                </div>
                              ) : (
                                ''
                              )}

                              {_this.state.groupOwner ===
                                _this.props.user.userId &&
                              data.status === CONSTANTS.groupStatus.INVITED ? (
                                <div className="label label-success">
                                  Invited
                                </div>
                              ) : data.userId === _this.props.user.userId &&
                                data.status ===
                                  CONSTANTS.groupStatus.REQUESTED ? (
                                <div className="label label-success">
                                  Requested
                                </div>
                              ) : (
                                ''
                              )}
                            </div>
                            <div className="flex flex-dir-column" />
                          </div>
                        </div>
                      </div>
                    ) : null;
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
)(GroupMembersList);
