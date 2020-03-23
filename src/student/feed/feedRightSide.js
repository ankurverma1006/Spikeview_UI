import React, { Component } from 'react';
import { Button, Media } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';

import spikeViewApiService from '../../common/core/api/apiService';
import GroupList from './groupList';
import { getThumbImage } from '../../common/commonFunctions';

class FeedRightSide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      disabled: false
    };
  }

  componentDidMount() {
    this.getFriendList();
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
  }
  groupImageUpload() {
    console.log('groupImage Upload -- ');
    this.groupListChild.groupImageUpload();
  }

  getFriendList = () => {
    let userId = this.props.userId;
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
    let userId = this.props.userId;
    let dateTime = moment().valueOf();
    let status = 'Requested';
    let isActive = true;
    let _this = this;

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
          _this.getFriendList();
        }
      })
      .catch(err => {
        this.setState({
          disabled: false
        });
        console.log(err);
      });
    _this.setHeaderCount(partnerId);
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

  getGroupInfo = data => {
    this.setState({
      groupName: data.groupName,
      aboutGroup: data.aboutGroup,
      groupImage: data.groupImage,
      groupMember: data.myGrp,
      selectedGroup: data
    });
    this.props.getGroupInfo(data);
  };

  render() {
    let userList = this.state.userList,
      _this = this;

    return (
      <div className="hi--rightSidebar">
        <div className="fixed-sidebar">
          <GroupList
            onRefGroupList={ref => (this.groupListChild = ref)}
            userId={this.props.userId || ''}
            getGroupInfo={this.getGroupInfo}
            groupId={this.props.groupId}
            {...this.props}
          />

          {/* <div className="postWrapper">
            <div className="pw-postHeader">
              <div className="pw-pc--wrapper">
                <div className="pw-pc--left">
                  <h5 className="mt-0 mb-0"> Recommended Internships</h5>
                </div>

                {/* <div className="pw-pc--right">
                  <Button bsStyle="link white">View All</Button>
                </div> */}
          {/* </div>
            </div>
            <div className="pw-postBody">
              <ul className="recommended-companies">
                <li>
                  <Media className="flex align-center">
                    <Media.Left>
                      <span className="thumbnail--img">
                        <img
                          className="object-fit-cover"
                          src="../../assets/img/adobe.png"
                          alt=""
                        />
                      </span>
                    </Media.Left>
                    <Media.Body>
                      <Media.Heading className="u--name">
                        <a>Adobe</a>
                      </Media.Heading>
                    </Media.Body>
                  </Media>
                </li>

                <li>
                  <Media className="flex align-center">
                    <Media.Left>
                      <span className="thumbnail--img">
                        <img
                          className="object-fit-cover"
                          src="../../assets/img/zillow.png"
                          alt=""
                        />
                      </span>
                    </Media.Left>
                    <Media.Body>
                      <Media.Heading className="u--name">
                        <a>Zillow</a>
                      </Media.Heading>
                    </Media.Body>
                  </Media>
                </li>
              </ul>
            </div> 
          </div> */}
          {this.props.feedName === 'feed' ? (
            userList && userList.length > 0 ? (
              <div className="postWrapper myGroups ">
                <div className="pw-postHeader">
                  <div className="pw-pc--wrapper">
                    <div className="pw-pc--left">
                      <h5 className="mt-0 mb-0">People you may know</h5>
                    </div>
                    <div className="pw-pc--right" />
                  </div>
                </div>
                <div className="pw-postBody">
                  <ul className="recommended-companies">
                    {userList && userList.length > 0
                      ? userList.slice(0, 3).map((user, index) => (
                          <li key={index}>
                            <Media>
                              <Media.Left>
                                <span className="thumbnail--img">
                                  {user.profilePicture ? (
                                    <img
                                      className="object-fit-cover"
                                      src={getThumbImage(
                                        'medium',
                                        user.profilePicture
                                      )}
                                      alt=""
                                    />
                                  ) : (
                                    <div className="pp-default small">
                                      <span className="icon-user_default2" />
                                    </div>
                                  )}
                                </span>
                              </Media.Left>
                              <Media.Body>
                                <Media.Heading className="u--name wrap-long-words">
                                  <Link
                                    to={{
                                      pathname:
                                        '/student/profile/' + user.userId
                                    }}
                                  >
                                    {user.firstName || ''} {user.lastName || ''}
                                  </Link>
                                </Media.Heading>
                                <p className="u--add">{user.title || ''}</p>
                                <Button
                                  bsStyle="primary"
                                  className="xsBtn"
                                  onClick={this.connectRequest.bind(
                                    this,
                                    user.userId
                                  )}
                                  disabled={this.state.disabled}
                                >
                                  connect
                                </Button>
                              </Media.Body>
                            </Media>
                          </li>
                        ))
                      : ''}
                  </ul>
                  {userList ? (
                    <Link
                      to={{
                        pathname:
                          '/student/mutualconnections/' + this.props.userId
                      }}
                    >
                      {' '}
                      <div className="centeredBox mt-1">
                        <Button className="btn btn-with-border light">
                          View All
                        </Button>
                      </div>
                    </Link>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ) : (
              ''
            )
          ) : null}
        </div>
      </div>
    );
  }
}
export default FeedRightSide;
