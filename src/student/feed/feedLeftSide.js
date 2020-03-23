import React, { Component } from 'react';
import { connect } from 'react-redux';

import spikeViewApiService from '../../common/core/api/apiService';
import SpiderChart from '../../common/spiderChart/spiderChart';
import { getThumbImage } from '../../common/commonFunctions';

class FeedLeftSide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openGroupModal: false
    };
  }

  componentDidMount() {
    this.setProfileData(this.props.user);
    this.getUserCount();
  }

  setProfileData = data => {
    if (data) {
      let userId = data.userId;
      let firstName = data.firstName;
      let lastName = data.lastName;
      let profileImage = data.profilePicture;
      if (profileImage) {
        profileImage = getThumbImage('medium', profileImage);
      }
      let coverImage = data.coverImage;
      if (coverImage) {
        coverImage = getThumbImage('original', coverImage);
      }

      this.setState({
        firstName,
        lastName,
        userId,
        profileImage,
        coverImage
      });
    }
  };

  getUserCount() {
    let userId = this.props.user.userId;
    let sharedId = 0;
    spikeViewApiService('getCount', { userId, sharedId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let accomplishments = response.data.result.achievement;
          let endorsements = response.data.result.endorsement;
          let recommendations = response.data.result.recommendation;
          this.setState({
            accomplishments,
            endorsements,
            recommendations
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <div className="profile-sidebar">
        <div className="fixed-sidebar">
          <div className="profile-pic--wrapper">
            <div className="profile-pic home-profile--pic">
              <div className="hpp--banner">
                {!this.state.coverImage ? (
                  <img className="bannerImg" src="" alt="" />
                ) : (
                  <img
                    className="object-fit-cover"
                    src={this.state.coverImage}
                    alt=""
                  />
                )}
              </div>
              {!this.state.profileImage ? (
                <div className="pp-default">
                  <span className="icon-user_default2" />
                </div>
              ) : (
                <img
                  src={this.state.profileImage}
                  alt=""
                  className="object-fit-cover"
                />
              )}
              <div className="user--details">
                <div
                  className="username wrap-long-words"
                  style={{ cursor: 'pointer' }}
                  onClick={() => this.props.history.push('/student/profile')}
                >
                  {this.state.firstName} {this.state.lastName}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-analytical--data profile-sidebar--box">
            <div className="table-responsive  profile-analytical-table--wrapper">
              <table className="table profile-analytical-table small mb-0">
                <tbody>
                  <tr>
                    <td>
                      <strong>Accomplishments</strong>
                    </td>
                    <td className="tableValue">
                      {' '}
                      {this.state.accomplishments}
                    </td>
                  </tr>
                  {/* <tr>
                    <td>
                      <strong>Endorsments</strong>
                    </td>
                    <td className="tableValue">{this.state.endorsements}</td>
                  </tr> */}
                  <tr>
                    <td>
                      <strong>Recommendations</strong>
                    </td>
                    <td className="tableValue">
                      {' '}
                      {this.state.recommendations}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SpiderChart userId={this.state.userId} sharedId="0" />
          </div>
        </div>
        {/* Add Education popup modal window */}
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
)(FeedLeftSide);
