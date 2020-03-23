import React, { Component } from 'react';
import Header from '../header/header';
import { Button, Row, Col,OverlayTrigger,Tooltip } from 'react-bootstrap';
import spikeViewApiService from '../../common/core/api/apiService';
import { connect } from 'react-redux';

import moment from 'moment';
import { Link } from 'react-router-dom';
import { limitCharacter, getThumbImage } from '../../common/commonFunctions';

class Connections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      requestedConnections: [],
      myConnections: []
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('absoluteHeader');
    document.body.classList.remove('home');
    document.body.classList.remove('fixedHeader');
  }

  componentDidMount() {
    this.getConnections();
  }

  getConnections = () => {
    let userId = this.props.parent.userId;
    spikeViewApiService('connectionList', { userId })
      .then(response => {
        if (response.data.status === 'Success') {
          if (response.data.result) {
            console.log(response.data.result);
            let requestedConnections = response.data.result.Requested
              ? response.data.result.Requested
              : [];
            console.log(requestedConnections);
            let myConnections = response.data.result.Accepted
              ? response.data.result.Accepted
              : [];
            this.setState({
              requestedConnections,
              myConnections
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateConnection = (status, connectId) => {
    //let userId = this.props.user.userId;
    let dateTime = moment().valueOf();
    let isActive = true;

    let data = {
      connectId,
      //   userId,
      // partnerId,
      dateTime,
      status,
      isActive
    };

    spikeViewApiService('updateConnection', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.getConnections();
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  deleteConnection = connectId => {
    let data = {
      connectId
    };

    spikeViewApiService('deleteConnection', data)
      .then(response => {
        if (response.data.status === 'Success') {
          this.getConnections();
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
 
        <div className="profileBox">
          <div className="banner small-banner align-center">          
            {this.props.parent && this.props.parent.coverImage ?
            <img
              className="bannerImg1"
              src={getThumbImage('small', this.props.parent.coverImage)}
              alt=""
            /> : <img className="bannerImg" src="assets/img/sidebarBg.png" alt="" /> }
            <div className="bannerProfile--connections">
              <div className="profileBox">
                {this.props.parent.profilePicture ? (
                  <img
                    className="img-responsive"
                    src={getThumbImage(
                      'small',
                      this.props.parent.profilePicture
                    )}
                    alt=""
                  />
                ) : (
                  <div className="pp-default">
                    <span className="icon-user_default2" />
                  </div>
                )}
                <p className="pName">
                  {this.props.parent.firstName}
                  &nbsp;
                  {this.props.parent.lastName}
                </p>
              </div>
              <ul className="bannerProfile--connectionsList">
                <li>
                  {this.state.requestedConnections.length} <span>Request</span>
                </li>
                <li>
                  {this.state.myConnections.length}
                  <span>Connections</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                {this.state.requestedConnections &&
                this.state.requestedConnections.length > 0 ? (
                  <div className="title--with--border rightSide">
                    <p>Connection Request</p>
                  </div>
                ) : (
                  ''
                )}

                <div className="connections-list">
                  <Row>
                    {this.state.requestedConnections &&
                    this.state.requestedConnections.length > 0
                      ? this.state.requestedConnections.map(
                          (connection, index) => (
                            <Col sm={4} key={index}>
                              <div className="box-with--image">
                                {connection.partner.profilePicture ? (
                                  <img
                                    className="img-responsive smallPic"
                                    src={getThumbImage(
                                      'small',
                                      connection.partner.profilePicture
                                    )}
                                    alt=""
                                  />
                                ) : (
                                  <span class="icon-user_default2 default-icon flat smallPic" />
                                )}
                                <div className="user--details">
                                  {connection.partner.roleId === 1 ? (
                                    <Link
                                      to={{
                                        pathname:
                                          '/student/profile/' +
                                          connection.partner.userId
                                      }}
                                    >
                                      <p className="p--name wrap-long-words">
                                        {connection.partner.firstName
                                          ? limitCharacter(
                                              connection.partner.firstName,
                                              10
                                            )
                                          : ''}{' '}
                                        &nbsp;
                                        {connection.partner.lastName
                                          ? limitCharacter(
                                              connection.partner.lastName,
                                              10
                                            )
                                          : ''}
                                      </p>
                                    </Link>
                                  ) : (
                                    <Link
                                      to={{
                                        pathname:
                                          '/parent/profile/' +
                                          connection.partner.userId
                                      }}
                                    >
                                      <p className="p--name wrap-long-words">
                                        {connection.partner.firstName
                                          ? limitCharacter(
                                              connection.partner.firstName,
                                              10
                                            )
                                          : ''}{' '}
                                        &nbsp;
                                        {connection.partner.lastName
                                          ? limitCharacter(
                                              connection.partner.lastName,
                                              10
                                            )
                                          : ''}
                                      </p>
                                    </Link>
                                  )}
                                  {/* <p className="p--email">
                                    {connection.partner.email}
                                  </p> */}
                                  <ul className="req--controls">
                                    <li>
                                      <a
                                        className="btn btn-with-border primary with-icon  smallBtn"
                                        onClick={this.updateConnection.bind(
                                          this,
                                          'Accepted',
                                          // connection.partnerId,
                                          connection.connectId
                                        )}
                                      >
                                        <span className="icon-right_tick" />
                                        Accept
                                      </a>
                                    </li>

                                    <li>
                                      <a
                                        className="btn btn-with-border default with-icon  smallBtn"
                                        onClick={this.deleteConnection.bind(
                                          this,
                                          connection.connectId
                                        )}
                                      >
                                        <span className="icon-cross" /> Reject
                                      </a>
                                    </li>

                                    {/* <li>
                                      <a
                                        onClick={this.updateConnection.bind(
                                          this,
                                          'Accepted',
                                          // connection.partnerId,
                                          connection.connectId
                                        )}
                                      >
                                        <span class="icon-right_tick" />
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        onClick={this.updateConnection.bind(
                                          this,
                                          'Rejected',
                                          //   connection.userId,
                                          connection.connectId
                                        )}
                                      >
                                        <span class="icon-cross" />
                                      </a>
                                    </li> */}
                                  </ul>
                                </div>
                              </div>
                            </Col>
                          )
                        )
                      : ''}
                  </Row>
                </div>
              </div>

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
                    {this.state.myConnections &&
                    this.state.myConnections.length > 0
                      ? this.state.myConnections.map((connection, index) => (
                          <Col sm={4} key={index}>
                            <div className="box-with--image">
                              {connection.partner.profilePicture ? (
                                <img
                                  className="img-responsive smallPic"
                                  src={getThumbImage(
                                    'small',
                                    connection.partner.profilePicture
                                  )}
                                  alt=""
                                />
                              ) : (
                                <span class="icon-user_default2 default-icon flat smallPic" />
                              )}
                              <div className="user--details">
                                {connection.partner.roleId === 1 ? (
                                  <Link
                                    to={{
                                      pathname:
                                        '/student/profile/' +
                                        connection.partner.userId
                                    }}
                                  >
                                    <p className="p--name wrap-long-words">
                                      {connection.partner.firstName
                                        ? limitCharacter(
                                            connection.partner.firstName,
                                            10
                                          )
                                        : ''}{' '}
                                      &nbsp;
                                      {connection.partner.lastName
                                        ? limitCharacter(
                                            connection.partner.lastName,
                                            10
                                          )
                                        : ''}
                                    </p>
                                  </Link>
                                ) : (
                                  <Link
                                    to={{
                                      pathname:
                                        '/parent/profile/' +
                                        connection.partner.userId
                                    }}
                                  >
                                    <p className="p--name wrap-long-words">
                                      {connection.partner.firstName
                                        ? limitCharacter(
                                            connection.partner.firstName,
                                            10
                                          )
                                        : ''}{' '}
                                      &nbsp;
                                      {connection.partner.lastName
                                        ? limitCharacter(
                                            connection.partner.lastName,
                                            10
                                          )
                                        : ''}
                                    </p>
                                  </Link>
                                )}
                                <ul className="req--controls">
                                  <li>
                                    {connection.partnerId === 1 ? (
                                      ''
                                    ) : (
                                      <Button
                                        bsStyle="primary with-icon smallBtn "
                                        onClick={this.deleteConnection.bind(
                                          this,
                                          connection.connectId
                                        )}
                                      >
                                        <span class="icon-unsubscribe" />
                                        Un-Friend
                                      </Button>
                                    )}
                                  </li>
                                  <li>
                                    <Link
                                      to={{
                                        pathname: 'messaging/',
                                        state: {
                                          messageUser: connection.partner.userId
                                        }
                                      }}
                                    >
                                      <Button bsStyle="primary with-icon smallBtn ">
                                        <span class="icon-comment" />
                                        Message
                                      </Button>
                                    </Link>
                                  </li>
                                </ul>
                                {connection.partnerId === 1 ? (                                   
                                   <OverlayTrigger
                                      key="bottom"
                                      placement="bottom"
                                      overlay={
                                        <Tooltip id="bottom">
                                         Reach out to spikeview with questions or requests
                                        </Tooltip>
                                      }
                                    >     
                                       <span className="icon-info in-ico-pos"> </span>                            
                                    </OverlayTrigger>                                  
                                 ):""}
                                {/* <p className="p--email">
                                  {connection.partner.email}
                                </p> */}
                              </div>
                            </div>
                          </Col>
                        ))
                      : ''}
                  </Row>
                  {/* <div className="centeredBox">
                    <Button bsStyle="with-border light">View All</Button>
                  </div> */}
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
)(Connections);
