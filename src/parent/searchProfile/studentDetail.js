import React, { Component } from 'react';
import { connect } from 'react-redux';
import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage } from '../../common/commonFunctions';
import { Link } from 'react-router-dom';
class StudentDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      profileImage: '',
      coverImage: '',
      firstName: '',
      lastName: '',
      email: '',
      recommendation: 0,
      accomplishment: 0,
      endorsement: 0,
      isActive: false
    };
  }

  componentDidMount() {
    if (this.props.studentData) {
      let student = this.props.studentData;
      if (student) {
        this.setStudentData(student);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.studentData) {
      let student = nextProps.studentData;
      if (student) {
        this.setStudentData(student);
      }
    }
  }

  setStudentData = userData => {
    let profileImage = userData.profilePicture
      ? getThumbImage('medium', userData.profilePicture)
      : '';
    let coverImage = userData.coverImage
      ? getThumbImage('original', userData.coverImage)
      : '';
    let firstName = userData.firstName || '';
    let lastName = userData.lastName || '';
    let email = userData.email || '';
    let isActive = userData.isActive;
    let userId = userData.userId;
    this.setState({
      profileImage,
      coverImage,
      firstName,
      lastName,
      email,
      isActive,
      userId
    });
    this.getCount(userData.userId);
  };

  getCount = userId => {
    spikeViewApiService('getCount', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          console.log(response.data.result);
          let recommendation = response.data.result.recommendation;
          let accomplishment = response.data.result.achievement;
          let endorsement = response.data.result.endorsement;
          this.setState({
            recommendation,
            accomplishment,
            endorsement
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  goToProfile = userId => {
    console.log(userId);
    if (userId) {
      this.props.history.push({
        pathname: '/student/profile/' + userId
      });
    }
  }; 

  render() {
    return (
      <div className="suggestion-usd">
        <div className="student-img deflt-icon centeredBox flex">
          {this.state.profileImage ? (
            <img
              src={this.state.profileImage}
              alt=""
              className="img-responsive"
            />
          ) : (
            <div className="pp-default">
              <span className="icon-user_default2" />
            </div>
          )}
        </div>
        <div className="student-info flex justify-content-space-between">
          <div className="flex align-center justify-content-space-bettween p-20-30">
            <div className="flex-1">
            <Link to={{
                    pathname:                
                         this.props.user.userId === this.state.userId
                           ? '/student/profile/'
                           : '/student/profile/' + this.state.userId
                  }}> 
              <h3>
                {this.state.firstName} {this.state.lastName}
              </h3>
              <p>{this.state.email}</p>
            </Link>
            </div>

            {/* <div className="btn-group flex align-center">
              <div className="toggleWrapper active">
                <label htmlFor="#">Active</label>
                <div className="item">
                  <input
                    type="checkbox"
                    id="toggle_today_summary"
                    checked={this.state.isActive}
                  />
                  <div className="toggle">
                    <label for="toggle_today_summary">
                      <i />
                    </label>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary no-round"
                onClick={this.goToProfile.bind(this, this.state.userId)}
              >
                Go to profile
              </button>
            </div> */}
          </div>

          <div className="flex align-center justify-content-space-bettween tag-wrap">
            <div className="promo-tag br-light">
              Accompolishments <span>{this.state.accomplishment}</span>
            </div>
            {/* <div className="promo-tag br-light">
              Endorsement <span>{this.state.endorsement}</span>
            </div> */}
            <div className="promo-tag">
              Recommendation <span>{this.state.recommendation}</span>
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
)(StudentDetail);

