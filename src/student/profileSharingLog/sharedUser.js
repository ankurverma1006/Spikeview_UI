import React, { Component } from 'react';
import moment from 'moment';

import { getThumbImage } from '../../common/commonFunctions';
import spikeViewApiService from '../../common/core/api/apiService';

class SharedUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shareDetail: ''
    };
  }

  componentDidMount() {
    if (this.props.sharedLog) {
      let shareDetail = this.props.sharedLog;
      this.setState({
        shareDetail: shareDetail,
        sendStudentId: this.props.sendStudentId,
        ['isActive_' + shareDetail.sharedId]: shareDetail.isActive
      });
    }
  }

  componentWillReceiveProps(res) {
    let shareDetail = res.sharedLog;
    this.setState({
      shareDetail: shareDetail,
      sendStudentId: res.sendStudentId,
      ['isActive_' + shareDetail.sharedId]: shareDetail.isActive
    });
  }

  handleChange = (sharedId, isActive, event) => {
    let self = this;
    const target = event.target;
    //const value = target.type === 'checkbox' ? target.checked : target.value;
    console.log(isActive);
    const value = isActive == true ? false : true;
    console.log(value);
    const name = target.name;
    console.log(name);

    if (sharedId) {
      let data = {
        isActive: value,
        sharedId
      };

      console.log(data);

      spikeViewApiService('revokeShareProfile', data)
        .then(response => {
          if (response && response.data.status === 'Success') {
            self.setState({
              ['isActive_' + sharedId]: value
              //isActive: !this.state['isActive' + sharedId]
            });
            self.props.updateSharingLogList(self.state.sendStudentId);
          }
        })
        .catch(error => {});
    }
  };

  render() {
    console.log();
    const { shareDetail } = this.state;
    return (
      <div className="suggestion-usd" key={shareDetail.userId}>
        <div className="student-img deflt-icon centeredBox flex">
          {shareDetail.shareToprofilePicture ? (
            <img
              src={getThumbImage('medium', shareDetail.shareToprofilePicture)}
              alt=""
              className="img-responsive"
            />
          ) : (
            <div className="pp-default">
              <span className="icon-user_default2" />
            </div>
          )}
          <div className="pp-default">
            <span className="icon-user_default2" />
          </div>
        </div>
        <div className="student-info flex justify-content-space-between">
          <div className="flex align-center justify-content-space-bettween p-20-30 stuBgWhite">
            <div className="flex-1">
              <h3>
                {shareDetail.shareToFirstName
                  ? shareDetail.shareToFirstName
                  : ''}{' '}
                {shareDetail.shareToLastName ? shareDetail.shareToLastName : ''}
              </h3>
              <p>{shareDetail.shareToEmail}</p>
            </div>

            <div className="btn-group flex align-center">
              <div
                className={
                  shareDetail.isActive
                    ? 'toggleWrapper active'
                    : 'toggleWrapper'
                }
              >
                <label htmlFor="#">REVOKE</label>
                <div className="item">
                  <input
                    title={shareDetail.sharedId}
                    type="checkbox"
                    name="revokeAccess"
                    onChange={this.handleChange.bind(
                      this,
                      shareDetail.sharedId,
                      shareDetail.isActive
                    )}
                    checked={
                      this.state['isActive_' + shareDetail.sharedId]
                        ? false
                        : true
                    }
                    id={`shared_${shareDetail.sharedId}`}
                  />
                  <div className="toggle">
                    <label htmlFor={`shared_${shareDetail.sharedId}`}>
                      <i />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex align-center justify-content-space-bettween tag-wrap">
            <div className="promo-tag br-light">
              Share Type <span>{shareDetail.sharedType}</span>
            </div>
            <div className="promo-tag br-light">
              Share Time{' '}
              <span>
                {moment(shareDetail.shareTime).format('DD-MMM-YYYY h:mm A')}
              </span>
            </div>
            <div className="promo-tag">
              Status{' '}
              <span>
                {shareDetail.isViewed
                  ? 'Viewed (' +
                    moment(shareDetail.lastViewedTime).format(
                      'DD-MMM-YYYY h:mm A'
                    ) +
                    ')'
                  : 'Unviewed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default SharedUser;
