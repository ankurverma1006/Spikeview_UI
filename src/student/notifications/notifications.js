import React from 'react';
import { NavDropdown, MenuItem, Nav } from 'react-bootstrap';
import { connect } from 'react-redux';

import Header from '../header/header';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage, showErrorToast } from '../../common/commonFunctions';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router-dom';
import noFeedImage from '../../assets/img/no-feeds.png';

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recentNotification: [],
      earlierNotification: [],
      notificationList: [],
      startPage: 1,
      hasMoreData: true,
      hasMoreRecentData: true,
      checkInfiniteScroll: false
    };

    this.getNotificationList();
    this.loadFeeds = this.loadFeeds.bind(this);
    this.incremenetPageNo = this.incremenetPageNo.bind(this);
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('home');
    document.body.classList.add('fixedHeader');

    if (this.props.location) {
      this.setState({
        notificationCount:
          this.props.location &&
          this.props.location.state &&
          this.props.location.state.notificationBellCount
            ? this.props.location.state.notificationBellCount
            : ''
      });
    }
  }

  getNotificationList() {
    let userId = this.props.user.userId;
    let recentNotificationArr = [];
    const skip = 0;
    let earlierNotificationArr = [];
    spikeViewApiService('notificationList', { userId, skip })
      .then(response => {
        if (response.data.status === 'Success') {
          console.log(response.data.result);
          let notificationList = response.data.result;
          notificationList.forEach(function(data) {
            let  timestamp1= new Date();
            let  timestamp2= new Date(data.dateTime);           
            var difference = timestamp1.getTime() - timestamp2.getTime();
            var daysDifference = Math.floor(difference/86400000);
        
            if(daysDifference < 1 )
               recentNotificationArr.push(data);
            else  
               earlierNotificationArr.push(data);
          });          
          // this.setState({
          //   recentNotification: recentNotificationArr,
          //   earlierNotification: earlierNotificationArr
          // });
          this.setState({
            notificationListResult: notificationList,
            notificationList: notificationList,
            recentNotification: recentNotificationArr,
            earlierNotification: earlierNotificationArr,
            checkInfiniteScroll: true
          });

          if (notificationList.length === 0) {
            this.setState({
              hasMoreData: false
            });
          } else if (recentNotificationArr.length === 0) {
            this.setState({
              hasMoreRecentData: false
            });
          }else {
            this.incremenetPageNo();
          } 
          if (earlierNotificationArr.length === 0) {
            this.setState({
              hasMoreData: false
            });
          } else {
            this.incremenetPageNo();
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getNotificationRefreshList(notificationId) {
    let userId = this.props.user.userId;
    let recentNotificationArr = this.state.recentNotification;
   
    let earlierNotificationArr = this.state.earlierNotification;
    
    let notificationList = this.state.notificationList;

    let recentNotificationIndex= recentNotificationArr.findIndex(rec => rec.notificationId == notificationId);

    let earlierNotificationIndex= earlierNotificationArr.findIndex(ear => ear.notificationId == notificationId);

    let notificationIndex= earlierNotificationArr.findIndex(noti => noti.notificationId == notificationId);

    if(recentNotificationIndex !== -1){
      recentNotificationArr.splice(recentNotificationIndex,1);
    }else{
      earlierNotificationArr.splice(earlierNotificationIndex,1);
    }
    
    if(notificationIndex !== -1){
      notificationList.splice(notificationIndex,1);
    }
         
    this.setState({
      notificationListResult: notificationList,
      notificationList: notificationList,
      recentNotification: recentNotificationArr,
      earlierNotification: earlierNotificationArr,
      checkInfiniteScroll: true
    });
        
  }

  deleteNotification = notificationId => {
    if (notificationId) {
      let _this = this;
      let data = {
        notificationId
      };    
       
      spikeViewApiService('deleteNotification', data)
        .then(response => {
          if (response.data.status === 'Success') {
          _this.setState({
            hasMoreRecentData: true,
            hasMoreData: true
          })
          _this.getNotificationRefreshList(notificationId);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  deleteAllNotification = () => {
    let userId = this.props.user.userId;
    if (userId) {
      let _this = this;
      let data = {
        userId
      };
      spikeViewApiService('deleteAllNotification', data)
        .then(response => {
          if (response.data.status === 'Success') {
            _this.getNotificationList();
            _this.setState({
              hasMoreRecentData: true,
              hasMoreData: false,
              notificationCount: null
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  loadFeeds = () => {
    const pageNo = this.state.startPage - 1;
    let _this = this;
    let userId = this.props.user.userId;
    let recentNotificationArr = [];
    const skip = pageNo;
    let earlierNotificationArr = [];
    spikeViewApiService('notificationList', { userId, skip })
      .then(response => {
        if (response.data.status === 'Success') {
          console.log(response.data.result);
          let notificationListResult = response.data.result;
          let notificationList = this.state.notificationList;
          let recentNotificationArr = this.state.recentNotification;
          let earlierNotificationArr = this.state.earlierNotification;
          notificationListResult.forEach(function(data) {
            notificationList.push(data);
            let  timestamp1= new Date();
            let  timestamp2= new Date(data.dateTime);           
            var difference = timestamp1.getTime() - timestamp2.getTime();
            var daysDifference = Math.floor(difference/86400000);
        
            if(daysDifference < 1 )
               recentNotificationArr.push(data);
            else  
               earlierNotificationArr.push(data);
          });

          this.setState({
            notificationListResult: notificationListResult,
            notificationList: notificationList,
            recentNotification: recentNotificationArr,
            earlierNotification: earlierNotificationArr
          });

          if (notificationListResult.length === 0) {
            this.setState({
              hasMoreData: false,
              hasMoreRecentData: false
            });
          } else {
            this.incremenetPageNo();
          }
        }
      })
      .catch(err => {
        console.log(err);
      });

    // this.props.refreshFeeds(pageNo, feedLength => {
    //   if (feedLength === 0) {
    //     this.setState({
    //       hasMoreData: false
    //     });
    //   } else {
    //     this.incremenetPageNo();
    //   }
    // });
  };

  incremenetPageNo = () => {
    this.setState(
      (prevState, nextState) => {
        const startPage = prevState.startPage + 1;
        return { startPage };
      },
      () => {
        console.log('next page number ', this.state.startPage);
      }
    );
  };

  groupCheck = groupId => {
    spikeViewApiService('getGroupDetailByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let selectedGroup = response.data.result[0];
          if (selectedGroup) {
            this.props.history.push({
              pathname: '/student/groupFeed',
              state: {
                groupId: groupId
              }
            });
          } else {
            showErrorToast('Group has been deleted');
          }
        }
      }
    );
  };

  render() {
    let dots = <span className="icon-dots" />;
    //console.log(this.state.hasMoreData);
    //console.log(this.state.notificationCount);
    return (
      <div className="innerWrapper">
        <Header {...this.props} />

        <div className="container main home--innerWrapper">
          {/* <Aside /> */}
          <div className="profile-sidebar">
            <div className="fixed-sidebar">
              <div className="postWrapper pt-0">
                <div className="pw-postBody">
                  <div className="notification-icon--wrapper">
                    <div className="notification">
                      <span
                        className={
                          !this.state.notificationCount
                            ? 'icon-noti'
                            : 'icon-noti rang'
                        }
                      />
                      {!this.state.notificationCount ? null : (
                        <div>
                          <span className="notification--num">
                            {this.state.notificationCount}
                          </span>
                        </div>
                      )}{' '}
                    </div>
                    {!this.state.notificationCount
                      ? 'No New notifications'
                      : 'you have some notifications'}
                    <br />
                    <br />
                    {(this.state.recentNotification &&
                      this.state.recentNotification.length > 0) ||
                    (this.state.earlierNotification &&
                      this.state.earlierNotification.length > 0) ? (
                      <button
                        className="btn btn-red no-round"
                        onClick={this.deleteAllNotification.bind(this)}
                      >
                        CLEAR ALL
                      </button>
                    ) : (
                      ''
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {this.state.recentNotification.length === 0 &&
          this.state.earlierNotification.length === 0 ? (
            <div align="center" className="hi--main">
              <img src={noFeedImage} alt="feedImage" />
              <p className="alert-msg">No notification yet</p>
            </div>
          ) : (
            <div className="hi--main">
              <div className="postWrapper">
                <div className="pw-postHeader">
                  <div className="pw-pc--wrapper">
                    <div className="pw-pc--left">
                      <div className="section-main-title mb-0">
                        <strong>Recent</strong>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pw-postBody p-0">
                  <div className="notifications js-notifications empty">
                    <ul className="notifications-list">
                      {this.state.recentNotification &&
                      this.state.recentNotification.length === 0 ? (
                        <li className="item no-data">
                          You don't have notifications
                        </li>
                      ) : null}

                      <InfiniteScroll
                        //This is important field to render the next data
                        dataLength={this.state.notificationListResult}
                        next={this.loadFeeds}
                        hasMore={this.state.hasMoreRecentData}
                        loader={
                          <img
                            className="ml-1"
                            src="../assets/img/svg-loaders/three-dots.svg"
                            width="40"
                            alt="loader"
                          />
                        }
                        endMessage={
                          <p style={{ textAlign: 'center' }}>
                            <b />
                          </p>
                        }
                      >
                        {this.state.recentNotification &&
                          this.state.recentNotification.map((data, index) => {
                            return (
                              <li
                                className={`item js-item ${
                                  data.isRead === true ? 'read' : ''
                                }`}
                                data-id={index}
                              >
                                <a className="u--topDetails">
                                  {data.profilePicture ? (
                                    <div className="user-icon">
                                      <img
                                        className="object-fit-cover"
                                        src={getThumbImage(
                                          'small',
                                          data.profilePicture
                                        )}
                                        alt=""
                                      />
                                    </div>
                                  ) : (
                                    <div className="user-icon defaultUser">
                                    { data.text.search('group') !== -1 ?  <span className="icon-all_connections"></span> : <span className="icon-male">
                                        <span className="path1" />
                                        <span className="path2" />
                                      </span>
                                    }
                                    </div>
                                  )}
                                  <div className="ud--wrapper">
                                    <span className="nl--text">
                                      {data.text.search('groupId') !== -1 ? (
                                        <a
                                          onClick={this.groupCheck.bind(
                                            this,
                                            data.text.split('groupId=')[1]
                                          )}
                                        >
                                          {data.text.split('groupId=')[0]}
                                        </a>
                                      ) : (
                                        data.text
                                      )}
                                    </span>
                                    <div className="ud--right">
                                      <Nav>
                                        <NavDropdown
                                          eventKey="3"
                                          title={dots}
                                          id=""
                                        >
                                          <MenuItem
                                            eventKey="3.1"
                                            onSelect={this.deleteNotification.bind(
                                              this,
                                              data.notificationId
                                            )}
                                          >
                                            <span className="icon-delete icon" />
                                            Delete Notification
                                          </MenuItem>
                                        </NavDropdown>
                                      </Nav>
                                      <div className="c--time">
                                        <span>
                                          {moment(data.dateTime).fromNow()}
                                          {/* {moment(new Date()).diff(
                                      moment(new Date(data.dateTime)),
                                      'hours'
                                    )} */}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            );
                          })}
                      </InfiniteScroll>
                    </ul>
                  </div>
                </div>
              </div>

           {this.state.earlierNotification &&
                      this.state.earlierNotification.length > 0 ?  <div className="postWrapper">
                <div className="pw-postHeader flex justify-content-between">
                  <div className="pw-pc--wrapper">
                    <div className="pw-pc--left">
                      <div className="section-main-title mb-0">
                        <strong>Earlier</strong>
                      </div>
                    </div>
                  </div>
                  {/* <button
                  className="btn btn-red no-round"
                  onClick={this.deleteAllNotification.bind(this)}
                >
                  REMOVE ALL
                </button> */}
                </div>
                <div className="pw-postBody p-0">
                  <div className="notifications js-notifications">
                    <ul className="notifications-list">
                      {this.state.earlierNotification &&
                      this.state.earlierNotification.length === 0 ? (
                        <li className="item no-data">
                          You don't have notifications
                        </li>
                      ) : null}

                      <InfiniteScroll
                        //This is important field to render the next data
                        dataLength={this.state.notificationListResult}
                        next={this.loadFeeds}
                        hasMore={this.state.hasMoreData}
                        loader={
                          <img
                            className="ml-1"
                            src="../assets/img/svg-loaders/three-dots.svg"
                            width="40"
                            alt="loader"
                          />
                        }
                        endMessage={
                          <p style={{ textAlign: 'center' }}>
                            <b>Yay! You have seen it all</b>
                          </p>
                        }
                      >
                        {this.state.earlierNotification &&
                          this.state.earlierNotification.map((data, index) => {
                            return (
                              <li
                                className={`item js-item ${
                                  data.isRead === true ? 'read' : ''
                                }`}
                                data-id={index}
                              >
                                <a className="u--topDetails">
                                  {data.profilePicture ? (
                                    <div className="user-icon">
                                      <img
                                        className="object-fit-cover"
                                        src={getThumbImage(
                                          'small',
                                          data.profilePicture
                                        )}
                                        alt=""
                                      />
                                    </div>
                                  ) : (
                                    <div className="user-icon defaultUser">
                                      { data.text.search('group') !== -1 ?  <span className="icon-all_connections"></span> : <span className="icon-male">
                                        <span className="path1" />
                                        <span className="path2" />
                                      </span>
                                     }
                                    </div>
                                  )}
                                  <div className="ud--wrapper">
                                    <span className="nl--text">
                                      {data.text.search('groupId') !== -1 ? (
                                        <a
                                          onClick={this.groupCheck.bind(
                                            this,
                                            data.text.split('groupId=')[1]
                                          )}
                                        >
                                          {data.text.split('groupId=')[0]}
                                        </a>
                                      ) : (
                                        data.text
                                      )}{' '}
                                    </span>
                                    <div className="ud--right">
                                      <Nav>
                                        <NavDropdown eventKey="3" title={dots}>
                                          <MenuItem
                                            eventKey="3.1"
                                            onSelect={this.deleteNotification.bind(
                                              this,
                                              data.notificationId
                                            )}
                                          >
                                            <span className="icon-private icon" />
                                            Delete
                                          </MenuItem>
                                        </NavDropdown>
                                      </Nav>
                                      <div className="c--time">
                                        <span>
                                          {moment(data.dateTime).fromNow()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </a>
                              </li>
                            );
                          })}
                      </InfiniteScroll>
                    </ul>
                  </div>
                </div>
              </div>:null}
            </div>
          )}

          {/* <RightSidebar /> */}
          <div className="hi--rightSidebar">
            <div className="fixed-sidebar">
              <div className="postWrapper">
                <div className="pw-postBody text-center">
                  <div className="p-2">
                    <a>SPIKEVIEW</a>
                    <p className="mt-1 mb-1">
                      Spikeview is for Middle and High Schoolers, or parents of
                      school-aged children, to build out a compelling online
                      profile to highlight their unique talents and skills.
                      Capture your unique life experiences, build your unique
                      story, own your online identity. See how you're building
                      out a well-rounded profile by easily adding your everyday
                      activities. To provide us feedback, please contact us at
                      the email below:
                    </p>

                    <a className="mt-2">product@spikeview.com</a>
                  </div>
                </div>
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
    user: state.User.userData,
    headerCount: state.User.headerCount
  };
};

export default connect(
  mapStateToProps,
  null
)(Notifications);
