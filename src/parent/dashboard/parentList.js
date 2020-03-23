import React, { Component } from 'react';
import Header from '../header/header';
import { Button, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import spikeViewApiService from '../../common/core/api/apiService';
import { getThumbImage, limitCharacter } from '../../common/commonFunctions';

class ParentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      parentData: []
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('absoluteHeader');
    document.body.classList.remove('home');
    document.body.classList.remove('fixedHeader');
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.studentData) {
      let studentData = this.props.location.state.studentData;
      let parentData = studentData.parents;
      let firstName = studentData.firstName ? studentData.firstName : '';
      let lastName = studentData.lastName ? studentData.lastName : '';
      let profilePicture = studentData.profilePicture;

      this.setState({
        parentData,
        firstName,
        lastName,
        profilePicture
      });
    }
  }

  render() {
    return (
      <div className="innerWrapper">
        <Header {...this.props} />

        <div className="profileBox">
          <div className="banner small-banner align-center">
            <img className="bannerImg" src="assets/img/sidebarBg.png" alt="" />
            <div className="bannerProfile--connections">
              <div className="profileBox">
                {this.props.user.profilePicture ? (
                  <img
                    className="img-responsive"
                    src={getThumbImage('small', this.state.profilePicture)}
                    alt=""
                  />
                ) : (
                  <div className="pp-default">
                    <span className="icon-user_default2" />
                  </div>
                )}
                <p className="pName">
                  {this.state.firstName}
                  &nbsp;
                  {this.state.lastName}
                </p>
              </div>
            </div>
          </div>
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                {this.state.myConnections &&
                this.state.myConnections.length > 0 ? (
                  <div className="title--with--border rightSide">
                    <p>Your Connections</p>
                  </div>
                ) : (
                  ''
                )}

                <div className="connections-list">
                  <Row>
                    {this.state.parentData && this.state.parentData.length > 0
                      ? this.state.parentData.map((data, index) => (
                          <Col sm={4} key={index}>
                            <div className="box-with--image">
                              {data.profilePicture ? (
                                <img
                                  className="img-responsive smallPic"
                                  src={getThumbImage(
                                    'small',
                                    data.profilePicture
                                  )}
                                  alt=""
                                />
                              ) : (
                                <span class="icon-user_default2 default-icon flat smallPic" />
                              )}
                              <div className="user--details">
                                <Link
                                  to={{
                                    pathname: '/parent/profile/' + data.userId
                                  }}
                                >
                                  <p className="p--name wrap-long-words">
                                    {data.firstName
                                      ? limitCharacter(data.firstName, 10)
                                      : ''}{' '}
                                    &nbsp;
                                    {data.lastName
                                      ? limitCharacter(data.lastName, 10)
                                      : ''}
                                  </p>
                                  <p style={{ color: '#a9b9ca' }}>
                                    {data.email}
                                  </p>
                                </Link>
                              </div>
                            </div>
                          </Col>
                        ))
                      : ''}
                  </Row>
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
    parent: state.User.parentData
  };
};

export default connect(
  mapStateToProps,
  null
)(ParentList);
