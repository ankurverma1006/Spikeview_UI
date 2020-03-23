import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import { Link } from 'react-router-dom';

import Header from '../header/header';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage } from '../../common/commonFunctions';

class MutualConnections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      loggedInUser: '',
      disabled: false
    };
  }

  componentWillMount() {
    document.body.classList.remove('light-theme');
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {
    let userId = this.props.match.params.id;
    this.setState({ loggedInUser: userId });
    this.getFriendList(userId);
  }

  componentWillReceiveProps(nextProps) {
    let userId = nextProps.match.params.id;
    this.setState({ loggedInUser: userId });
    this.getFriendList(userId);
  }

  getFriendList = userId => {
    if (userId) {
      spikeViewApiService('mutualFriendList', { userId })
        .then(response => {
          if (response.data.status === 'Success') {
            this.setState({ userList: response.data.result });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  connectRequest = partnerId => {
    this.setState({
      disabled: true
    });
    let userId = this.state.loggedInUser;
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
          this.getFriendList(userId);
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
      console.log(response.data);

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
        //spikeViewApiService('updateHeaderCount', data);
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

  render() {
    let userList = this.state.userList;

    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        <div className="profileBox">
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                <div className="title--with--border rightSide">
                  {/* <p>People you may know ({userList.length} Results)</p> */}
                  <p>People you may know</p>
                </div>
                {userList && userList.length > 0
                  ? userList.map((user, index) => (
                      <div
                        className="suggestion-usd border-light no-shadow"
                        key={index}
                        title={user.userId}
                      >
                        <div className="student-img h-120">
                          {user.profilePicture ? (
                            <img
                              src={getThumbImage('medium', user.profilePicture)}
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
                              {user.roleId === 1 ? (
                                <Link
                                  to={{
                                    pathname: '/student/profile/' + user.userId
                                  }}
                                >
                                  <h3 className="primary-text">
                                    {user.firstName || ''} {user.lastName || ''}
                                  </h3>
                                </Link>
                              ) : user.roleId === 2 ? (
                                <Link
                                  to={{
                                    pathname: '/parent/profile/' + user.userId
                                  }}
                                >
                                  <h3 className="primary-text">
                                    {user.firstName || ''} {user.lastName || ''}
                                  </h3>
                                </Link>
                              ) : (
                                ''
                              )}
                              <div className="text-ellipses w-700">
                                {user.summary || ''}
                              </div>
                              {/* <p>jennyfoster@gmail.com</p> */}
                            </div>
                            <div className="flex flex-dir-column">
                              <Button
                                className="btn primary with-icon btn-with-border"
                                onClick={this.connectRequest.bind(
                                  this,
                                  user.userId
                                )}
                                disabled={this.state.disabled}
                              >
                                <span className="icon-connect" />
                                Connect
                              </Button>
                              {/* <p className="mute mt-1 mb-0">
                                <strong>2 Mutual connections</strong>
                              </p> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default MutualConnections;
