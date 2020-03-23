import React, { Component } from 'react';
import { connect } from 'react-redux';

import Header from '../header/header';
import ParentHeader from '../../parent/header/header';
import spikeViewApiService from '../../common/core/api/apiService';
import SharedUserDetail from './sharedUser';

class ProfileLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sharingLog: []
    };
    this.updateSharingLogList1 = this.updateSharingLogList1.bind(this);
  }

  componentWillMount() {
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.profileOwner) {
      let studentId = this.props.location.state.profileOwner;
      if (studentId) {
        this.getProfileSharingLog(studentId);
        this.setState({ sendStudentId: studentId });
      }
    }
  }

  getProfileSharingLog = userId => {
    spikeViewApiService('getSharingProfileLog', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          let result = response.data.result;
          this.setState({
            sharingLog: result
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateSharingLogList1 = studentId => {
    if (studentId) {
      let userId = studentId;
      this.getProfileSharingLog(userId);
    }
  };

  render() {
    let _this = this;
    return (
      <div className="innerWrapper">
        {this.props.parent ? (
          <ParentHeader {...this.props} />
        ) : (
          <Header {...this.props} />
        )}
        <div className="profileBox">
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                <div className="title--with--border rightSide">
                  <p>Profile Sharing Log </p>
                </div>

                {this.state.sharingLog && this.state.sharingLog.length > 0
                  ? this.state.sharingLog.map((item, index) => (
                      <SharedUserDetail
                        sharedLog={item}
                        key={index}
                        sendStudentId={_this.state.sendStudentId}
                        updateSharingLogList={_this.updateSharingLogList1.bind(
                          _this
                        )}
                      />
                    ))
                  : 'No result found'}
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
    parent: state.User.parentData
  };
};

export default connect(
  mapStateToProps,
  null
)(ProfileLog);
