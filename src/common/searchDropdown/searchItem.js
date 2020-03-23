import React, { Component } from 'react';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import CONSTANTS from '../../common/core/config/appConfig';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage } from '../../common/commonFunctions';

class searchItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResult: [],
      accepted: false,
      disabled: false,
      connectId: ''
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {
    // if (this.props.page === 'search') {
    if (this.props.searchData) {
      let searchUserId = this.props.searchData.value;
      let userId = this.props.userId;

      this.setState({
        roleId: this.props.searchData.roleId,
        name: this.props.searchData.label,
        summary: this.props.searchData.summary,
        searchUserId: this.props.searchData.value,
        userId: this.props.userId,
        profilePicture: this.props.searchData.picture
          ? getThumbImage('medium', this.props.searchData.picture)
          : '',
        groupDetail: this.props.searchData.groupDetail
          ? this.props.searchData.groupDetail
          : null
      });
      if (!this.props.searchData.groupDetail && this.props.searchData.roleId)
        this.checkConnectionRequestStatus(searchUserId, userId);
      else this.isUserExistAsMember(this.props.searchData.groupDetail);

      console.log(this.props.searchData.groupDetail);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.searchData) {
      let searchUserId = nextProps.searchData.value;
      let userId = nextProps.userId;

      this.setState({
        roleId: nextProps.searchData.roleId,
        name: nextProps.searchData.label,
        summary: nextProps.searchData.summary,
        searchUserId: nextProps.searchData.value,
        userId: nextProps.userId,
        profilePicture: nextProps.searchData.picture
          ? getThumbImage('medium', nextProps.searchData.picture)
          : '',
        groupDetail: this.props.searchData.groupDetail
          ? this.props.searchData.groupDetail
          : null
      });
      if (!nextProps.searchData.groupDetail && nextProps.searchData.roleId)
        this.checkConnectionRequestStatus(searchUserId, userId);
      else this.isUserExistAsMember(nextProps.searchData.groupDetail);
      console.log(nextProps.searchData.groupDetail);
    }
  }

  isUserExistAsMember(data) {
    let groupId = data.groupId;
    spikeViewApiService('getGroupDetailByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let selectedGroup = response.data.result[0];
          let index = selectedGroup.members.findIndex(
            todo => todo.userId === this.props.userId
          );
          if (index !== -1) {
            if (
              selectedGroup.members[index].status ===
              CONSTANTS.groupStatus.ACCEPTED
            )
              this.setState({ groupStatus: CONSTANTS.groupStatus.ACCEPTED });
            else {
              this.setState({
                groupStatus: selectedGroup.members[index].status
              });
            }
          }
        }
      }
    );
  }

  checkConnectionRequestStatus = (partnerId, userId) => {
    spikeViewApiService('getConnectionStatus', { userId, partnerId })
      .then(response => {
        if (response.data.status === 'Success') {
          if (response.data.result.length === 0) {
            this.setState({
              requested: false,
              accepted: false
            });
          } else if (response.data.result[0].status === 'Requested') {
            this.setState({
              requested: true,
              connectId: response.data.result[0].connectId
            });
          } else if (response.data.result[0].status === 'Accepted') {
            this.setState({
              accepted: true
            });
          } else if (response.data.result[0].status === 'Rejected') {
            this.setState({
              requested: false
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  cancelConnectRequest = () => {
    let connectId = this.state.connectId;
    if (connectId) {
      let data = {
        connectId
      };

      spikeViewApiService('deleteConnection', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.setState({
              requested: false,
              accepted: false
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  connectRequest = () => {
    this.setState({
      disabled: true
    });
    let userId = this.state.userId;
    let partnerId = this.state.searchUserId;
    let dateTime = moment().valueOf();
    let status = 'Requested';
    let isActive = true;

    let data = {
      userId,
      partnerId,
      dateTime,
      status,
      isActive
    };

    spikeViewApiService('addConnection', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({
            requested: true,
            disabled: false
          });
        }
      })
      .catch(err => {
        this.setState({
          disabled: false
        });
        console.log(err);
      });
    this.setHeaderCount(partnerId);
  };

  setHeaderCount(partnerId) {
    let userId = partnerId;
    spikeViewApiService('getHeaderCount', { userId }).then(response => {
      if (response.data.status === 'Success') {
        let headerCount = response.data.result[0];
        let connectionCount = headerCount.connectionCount;
        connectionCount = parseInt(connectionCount, 10) + 1;
        let data = {
          userId: userId,
          connectionCount: connectionCount,
          messagingCount: headerCount.messagingCount,
          notificationCount: headerCount.notificationCount
        };
        // spikeViewApiService('updateHeaderCount', data);
      } else {
        let data = {
          userId: userId,
          connectionCount: 0,
          messagingCount: 0,
          notificationCount: 0
        };
        spikeViewApiService('createHeaderCount', data);
      }
    });
  }

  joinMember = (groupDetail, status) => {
    let data = {
      groupId: groupDetail.groupId,
      userId: this.state.userId
    };
    spikeViewApiService('joinMemberInGroup', data)
      .then(response => {
        console.log(response);
        if (response && response.data.status === 'Success') {
          this.setNotification(groupDetail.createdBy, groupDetail.groupName);
          this.setState({ groupStatus: CONSTANTS.groupStatus.REQUESTED });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  setNotification(receiveId, groupName) {
    let displayData = [];
    displayData.push(
      <div id="display-data">
        <pre />
      </div>
    );
    let dateTime = new Date().valueOf();
    let text =
      this.props.user.firstName +
      ' ' +
      (this.props.user.lastName ? this.props.user.lastName : '') +
      ' requested to join ' +
      (groupName ? groupName : '') +
      '  group groupId=' +
      this.state.groupId;

    let feedId = '';
    let flag = false;
    let notificationData = {
      userId: receiveId,
      actedBy: this.props.user.userId,
      profilePicture: this.props.user.profilePicture,
      feedId,
      text,
      dateTime,
      flag
    };
    spikeViewApiService('postNotification', notificationData);
  }

  render() {
    return (
      <div className="suggestion-usd border-light no-shadow">
        <div className="student-img h-120">
          {this.state.profilePicture ? (
            <img
              src={this.state.profilePicture}
              alt=""
              className="img-responsive"
            />
          ) : (
            <div className="pp-default small">
              <span className="icon-user_default2" />
            </div>
          )}
        </div>
        <div className="student-info flex justify-content-space-between light-bg">
          <div className="flex align-center justify-content-space-bettween p-20-30">
            <div className="flex-1">
              {this.state.roleId === 1 ? (
                <Link
                  to={{
                    pathname:
                      this.state.userId === this.state.searchUserId
                        ? '/student/profile/'
                        : '/student/profile/' + this.state.searchUserId
                  }}
                >
                  <h3 className="primary-text wrap-long-words">
                    {this.state.name}
                  </h3>
                </Link>
              ) : this.state.groupDetail ? (
                <Link
                  to={{
                    pathname: '/student/groupFeed',
                    state: {
                      groupId: this.state.groupDetail.groupId
                    }
                  }}
                >
                  <h3 className="primary-text wrap-long-words">
                    {this.state.name}
                  </h3>
                </Link>
              ) : (
                <Link
                  to={{
                    pathname:
                      this.state.userId === this.state.searchUserId
                        ? '/parent/dashboard/'
                        : '/parent/profile/' + this.state.searchUserId
                  }}
                >
                  <h3 className="primary-text wrap-long-words">
                    {this.state.name}
                  </h3>
                </Link>
              )}
              <div className="text-ellipses w-700">{this.state.summary}</div>
            </div>

            <div className="flex flex-dir-column">
              {this.state.accepted === true ? (
                <Link
                  to={{
                    pathname: '/student/messages/',
                    state: {
                      messageUser: this.state.searchUserId
                    }
                  }}
                >
                  <Button className="btn btn-white with-icon btn-with-border">
                    <span className="icon-message2" />
                    Message
                  </Button>
                </Link>
              ) : this.state.requested === false && !this.state.groupDetail ? (
                <Button
                  onClick={this.connectRequest}
                  className="btn primary with-icon btn-with-border"
                  disabled={this.state.disabled}
                >
                  <span className="icon-connect" /> connect
                </Button>
              ) : this.state.groupDetail &&
              !this.state.roleId &&
              this.state.groupStatus ? (
                <Button
                  onClick={this.connectRequest}
                  className="btn primary with-icon btn-with-border"
                  disabled
                >
                  <span className="icon-connect" /> {this.state.groupStatus}
                </Button>
              ) : this.state.groupDetail &&
              !this.state.roleId &&
              !this.state.groupStatus ? (
                <Button
                  onClick={this.joinMember.bind(
                    this,
                    this.state.groupDetail,
                    CONSTANTS.groupStatus.REQUESTED
                  )}
                  className="btn primary with-icon btn-with-border"
                >
                  <span className="icon-connect" /> Join
                </Button>
              ) : (
                <Button
                  type="button"
                  className="btn with-icon btn-with-border "
                  onClick={this.cancelConnectRequest}
                >
                  <span className="icon-cross" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default searchItem;
