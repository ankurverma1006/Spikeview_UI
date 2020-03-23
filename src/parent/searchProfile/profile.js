import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import moment from 'moment';
import { Link } from 'react-router-dom';

import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage } from '../../common/commonFunctions';
import ParentHeader from '../header/header';
import Header from '../../student/header/header';
import StudentDetail from './studentDetail';

class Profile extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      userId: '',
      profileImage: '',
      coverImage: '',
      firstName: '',
      lastName: '',
      loggedInUser: '',
      requested: false,
      accepted: false,
      studentList: [],
      disabled: false,
      connectId: ''
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('absoluteHeader');
  }

  componentDidMount() {
    let userId = this.props.match.params.id;
    let loggedInUser = this.props.parent
      ? this.props.parent.userId
      : this.props.user.userId;
    this.setState({ userId, loggedInUser });
    console.log(userId, loggedInUser);
    if (userId && loggedInUser) {
      this.getUserPersonalInfo(userId);
      this.checkConnectionRequestStatus(userId, loggedInUser);
    }
  }

  componentWillReceiveProps(nextProps) {
    let userId = nextProps.match.params.id;
    let loggedInUser = this.props.parent
      ? this.props.parent.userId
      : this.props.user.userId;
    this.setState({ userId, loggedInUser });
    console.log(userId, loggedInUser);
    if (userId && loggedInUser) {
      this.getUserPersonalInfo(userId);
      this.checkConnectionRequestStatus(userId, loggedInUser);
    }
  }

  getUserPersonalInfo = userId => {
    spikeViewApiService('getStudentPersonalInfo', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let userData = response.data.result;
          if (userData) {
            let profileImage = userData.profilePicture
              ? getThumbImage('medium', userData.profilePicture)
              : '';
            let coverImage = userData.coverImage
              ? getThumbImage('original', userData.coverImage)
              : '';
            let firstName = userData.firstName || '';
            let lastName = userData.lastName || '';
            let studentList = userData.students ? userData.students : [];
            this.setState({
              profileImage,
              coverImage,
              firstName,
              lastName,
              studentList
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

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
    let userId = this.state.loggedInUser;
    let partnerId = this.state.userId;
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
    let data = {
      userId: partnerId,
      connectionCount: 1,
      messagingCount: '',
      notificationCount: ''
    };
    // spikeViewApiService('updateHeaderCount', data);
  }

  render() {
    return (
      <div className="innerWrapper">
        {this.props.parent ? (
          <ParentHeader {...this.props} />
        ) : (
          <Header {...this.props} />
        )}
        <div className="profileBox">
          <div className="banner">
            {!this.state.coverImage ? (
              <img className="bannerImg" src="" alt="" />
            ) : (
              <img className="bannerImg" src={this.state.coverImage} alt="" />
            )}
            <div className="container">
              <div className="profile-pic--wrapper aboveBanner">
                <div className="profile-pic">
                  {!this.state.profileImage ? (
                    <div className="pp-default">
                      <span className="icon-user_default2" />
                    </div>
                  ) : (
                    <img src={this.state.profileImage} alt="" />
                  )}
                </div>
              </div>
              <div className="profile-info--wrapper">
                <p className="pName">
                  {this.state.firstName} {this.state.lastName}
                </p>

                {this.state.accepted === true ? (
                  <Link
                    to={{
                      pathname: this.props.parent
                        ? '/parent/messaging/'
                        : '/student/messages/',
                      state: {
                        messageUser: this.props.match.params.id
                      }
                    }}
                  >
                    <Button className="btn btn-white with-icon ">
                      <span class="icon-message2" />
                      Message
                    </Button>
                  </Link>
                ) : this.state.requested === false ? (
                  <Button
                    onClick={this.connectRequest}
                    className="btn white with-icon  btn-with-border"
                    disabled={this.state.disabled}
                  >
                    <span class="icon-connect" /> connect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="btn btn-white with-icon"
                    onClick={this.cancelConnectRequest}
                  >
                    <span class="icon-cross" />
                    Cancel Request
                  </Button>
                )}

                {/*<Button >Subscribe <span>10</span></Button>*/}
              </div>
            </div>
          </div>
          <br/>
          {this.state.studentList && this.state.studentList.length > 0 ? (
            <div className="container main">
              {/* <h3 className="text-center hero-head ">
                Select student to go to profile -
              </h3> */}
              {this.state.studentList.map((student, index) => (
                <StudentDetail studentData={student} {...this.props} />
              ))}
            </div>
          ) : (
            <div className="centeredBox no-dmsg">No data available</div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    parent: state.User.parentData
  };
};

export default connect(
  mapStateToProps,
  null
)(Profile);
