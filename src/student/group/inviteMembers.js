import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  Modal,
  Checkbox,
  Radio,
  FormGroup,
  FormControl,
  Col,
  ControlLabel,
  Form
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { getThumbImage, renderMessage } from '../../common/commonFunctions';
import Header from '../header/header';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';
let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class InviteMembers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      disabled: false,
      connectionLoader: true,
      connectionList: [],
      myConnections: [],
      invitationByEmailFlag: false,
      userId:
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.userId,
      clicked: false
    };

    this.tagConnection = [];
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.validatorTypes = strategy.createInactiveSchema(
      {
        shareFirstName: ['required', 'regex:' + regExpressions.alphaOnly],
        shareLastName: ['required', 'regex:' + regExpressions.alphaOnly],
        invitedByEmail: 'required|email'
      },
      {
        'required.shareFirstName': validationMessages.firstName.required,
        'regex.shareFirstName': validationMessages.firstName.alphaOnly,
        'required.shareLastName': validationMessages.lastName.required,
        'regex.shareLastName': validationMessages.lastName.alphaOnly,
        'required.invitedByEmail': validationMessages.email.required,
        'email.invitedByEmail': validationMessages.email.invalid
      }
    );
  }

  componentDidMount() {
    console.log(this.props.groupMemberList);
    this.getMyConnections();
    this.setState({ selectedGroup: this.props.selectedGroup });
  }

  memberModal = () => {
    this.props.memberModal();
  };

  getMyConnections = () => {
    let roleId = 1,
      _this = this;
    let isActive = true;
    let userId = this.props.user.userId;
    spikeViewApiService('getChatConnections', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let memberList =
                        response.data.result.Accepted
                        ? response.data.result.Accepted
                        : [];
          memberList = _.filter(memberList, function(connection) {
            return connection.partner.roleId === 1;
          });    
          this.getGroupMemberListByGroupId(
            memberList,
            this.props.selectedGroup.groupId
          );
        }
      })
      .catch(err => {
        this.setState({ connectionLoader: false });
        console.log(err);
      });
  };

  getGroupMemberListByGroupId(memberList, groupId) {
    spikeViewApiService('getGroupMemberListByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let result = response.data.result;
          let groupMemberList = result.members;
          memberList = memberList.map(function(item) {
            let index = groupMemberList.findIndex(
              todo => todo.userId == item.partner.userId
            );
            if (index !== -1) {
              item['status'] = groupMemberList[index].status;
            }
            return item;
          });

          let memberUserIndex = memberList.findIndex(
            todo => todo.partner.userId == this.props.user.userId
          );
          if (memberUserIndex !== -1) memberList.splice(memberUserIndex, 1);

          this.setState({
            myConnections: memberList,
            connectionList: memberList,
            connectionLoader: false
          });
        }
      }
    );
  }

  selectMember = (connectionId, index, event) => {
    let myConnections = this.state.myConnections;
    if (event.target.checked) {
      myConnections[index]['checked'] = true;
      this.tagConnection.push({ userId: connectionId });
    } else {
      let filtered = _.filter(this.tagConnection, function(connection) {
        return connection.userId !== connectionId;
      });
      myConnections[index]['checked'] = false;
      this.tagConnection = filtered;
    }
    this.setState({ myConnections: myConnections });
  };

  filterList = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.validateData();
    }

    let updatedList = this.state.myConnections;
    if (event.target.value.length === 1) {
      updatedList = this.state.connectionList;
    }

    if (event.target.value) {
      updatedList = _.filter(updatedList, function(item) {
        return (
          _
            .toLower(item.firstName || item.lastName)
            .search(event.target.value.toLowerCase()) !== -1
        );
      });
      this.setState({
        myConnections: updatedList,
        searchText: event.target.value
      });
    } else {
      this.setState({
        myConnections: this.state.connectionList,
        searchText: ''
      });
    }
  };

  inviteMember = (invitedByEmail, shareFirstName, shareLastName) => {
    let data = {
      groupId: this.state.selectedGroup.groupId,
      members: this.tagConnection,
      email: invitedByEmail,
      invitedBy: this.props.user.firstName,
      firstName: shareFirstName,
      lastName: shareLastName
    };
    this.setState({ isLoading: true });

    let members = this.state.selectedGroup.members;
    let memberList = [],
      _this = this;
    this.tagConnection.forEach(function(item) {
      let index = members.findIndex(
        todo => todo.userId === parseInt(item.userId, 10)
      );
      if (index === -1) memberList.push(item);
    });
    spikeViewApiService('inviteGroupMember', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          this.tagConnection = [];
          _this.state.selectedGroup.members = response.data.result;
          // memberList.forEach(function(data) {
          //   _this.setNotification(data.userId);
          // });
          this.memberModal();
          this.setState({
            invitedByEmail: '',
            shareFirstName: '',
            shareLastName: '',
            isLoading: false,
            invitationByEmailFlag: false
          });
        }else{
          this.setState({ connectionLoader: false, isLoading: false });
          this.tagConnection = [];
        }
      })
      .catch(err => {
        this.setState({ connectionLoader: false, isLoading: false });
        this.tagConnection = [];
        console.log(err);
      });
  };

  searchBoxClick = action => {
    if (action === 1) {
      this.setState({
        clicked: true
      });
    }

    if (action === 2) {
      this.setState({
        clicked: false,
        searchText: '',
        myConnections: this.state.connectionList,
        invitationByEmailFlag: false
      });
    }
  };

  setNotification(receiveId) {
    let displayData = [];
    displayData.push(
      <div id="display-data">
        <pre />
      </div>
    );
    let dateTime = new Date().valueOf();
    let text =
      this.props.user.firstName +
      ' ' +
      (this.props.user.lastName ? this.props.user.lastName : '') +
      ' invited you to ' +
      (this.state.selectedGroup && this.state.selectedGroup.groupName
        ? this.state.selectedGroup.groupName
        : '') +
      '  group groupId=' +
      this.state.selectedGroup.groupId;

    let feedId = '';
    let flag = false;
    let notificationData = {
      userId: receiveId,
      actedBy: this.props.user.userId,
      profilePicture: this.props.user.profilePicture,
      feedId,
      text,
      dateTime,
      flag
    };
    //spikeViewApiService('postNotification', notificationData);
  }

  handleChange = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
    this.setState({ [event.target.name]: event.target.value });
  };

  getValidatorData = () => {
    return this.state;
  };

  getClasses = field => {
    return classnames({
      error: !this.props.isValid(field)
    });
  };

  validateData = () => {
    let self = this;
    this.props.validate(function(error) {
      if (!error) {
        self.setState({ isLoading: true });
        //       self.handleSubmit();
        self.inviteMemberByEmail();
      }
    });
  };

  inviteMemberByEmail() {
    this.inviteMember(
      this.state.invitedByEmail,
      this.state.shareFirstName,
      this.state.shareLastName
    );
  }

  inviteMemberByEmailChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  switchInvitationMode() {
    this.setState({ invitationByEmailFlag: !this.state.invitationByEmailFlag });
  }

  render() {
    const { isLoading } = this.state;
    var centeredLoader = {
      position: 'absolute',
      height: '100%'
    };

    var modalBodyMinHeight = {
      minHeight: '300px'
    };
    return (
      <Modal
        // bsSize="medium"
        show={this.props.memberModal}
        onHide={this.memberModal}
      >
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">
            {!this.state.invitationByEmailFlag
              ? 'INVITE MEMBERS'
              : 'INVITE MEMBERS BY EMAIL'}
          </Modal.Title>
          {!this.state.invitationByEmailFlag ? (
            <form
              className={`animated-serachbar ${
                this.state.clicked === true ? 'open' : ''
              }`}
            >
              <input
                className="form-control animated-serachbar--input"
                autoComplete="off"
                type="text"
                name="searchText"
                value={this.state.searchText}
                placeholder="Search"
                onChange={this.filterList}
                onKeyPress={this.filterList}
                onClick={this.searchBoxClick.bind(this, 1)}
              />
              <button
                type="button"
                className="close"
                onClick={this.searchBoxClick.bind(this, 2)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
              <input
                className="form-control animated-serachbar--input"
                type="submit"
              />
            </form>
          ) : null}
        </Modal.Header>
        <Modal.Body style={modalBodyMinHeight}>
          {this.state.connectionLoader === true ? (
            <div
              className="loading-wrapper centered-loader"
              style={centeredLoader}
            >
              <img
                className="ml-1"
                src="../assets/img/svg-loaders/three-dots.svg"
                width="40"
                alt="loader"
              />
            </div>
          ) : !this.state.invitationByEmailFlag ? (
            <div>
              {/* <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search"
              onChange={this.filterList} 
            />*/}
              <br />
              <ul className="likedBy--user mh-300">
                {this.state.myConnections && this.state.myConnections.length > 0
                  ? this.state.myConnections.map((connection, index) => (
                      <li key={index}>
                        <div className="u--topDetails">
                          <div className="user-icon">
                            {connection.partner.profilePicture ? (
                              <img
                                className="object-fit-cover"
                                src={getThumbImage(
                                  'small',
                                  connection.partner.profilePicture
                                )}
                                alt=""
                              />
                            ) : (
                              <span className="icon-user_default2" />
                            )}
                          </div>
                          <div className="user-details">
                            <div className="ud--wrapper">
                              {connection.partner.roleId === 1 ? (
                                <Link
                                  to={{
                                    pathname:
                                      '/student/profile/' + connection.partner.userId
                                  }}
                                >
                                  <div className="u--name">
                                    {connection.partner.firstName || ''}{' '}
                                    {connection.partner.lastName || ''}
                                  </div>
                                </Link>
                              ) : (
                                <Link
                                  to={{
                                    pathname:
                                      '/parent/profile/' + connection.partner.userId
                                  }}
                                >
                                  <div className="u--name">
                                    {connection.partner.firstName || ''}{' '}
                                    {connection.partner.lastName || ''}
                                  </div>
                                </Link>
                              )} 

                              <div className="u--designation" title={connection.partner.title || ''}>
                                {connection.partner.title || ''}
                              </div>
                              {connection.status ? (
                                connection.status
                              ) : connection.partner.userId === 1 ? '' : (
                                <div className="ud--right">
                                  <Checkbox
                                    className="checkbox-primary rounded m-0"
                                    name="connections"
                                    checked={connection.checked ? true : false}
                                    id={`connect_${connection.partner.connectId}`}
                                    value={connection.partner.userId}
                                    onChange={this.selectMember.bind(
                                      this,
                                      connection.partner.userId,
                                      index
                                    )}
                                  >
                                    <span className="check" />
                                  </Checkbox>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  : ''}
              </ul>
            </div>
          ) : (
            <Form horizontal className="lightBgForm">
              <Col sm={12}>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'shareFirstName'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    First Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      placeholder="First Name"
                      name="shareFirstName"
                      value={this.state.shareFirstName}
                      onChange={this.inviteMemberByEmailChange.bind(this)}
                      autoComplete="off"
                      maxLength="35"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('shareFirstName')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'shareLastName'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Last Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      placeholder="Last Name"
                      name="shareLastName"
                      value={this.state.shareLastName}
                      onChange={this.inviteMemberByEmailChange.bind(this)}
                      autoComplete="off"
                      maxLength="35"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('shareLastName')
                    )}
                  </Col>
                </FormGroup>

                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'invitedByEmail'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Email
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="Email"
                      placeholder="Email"
                      name="invitedByEmail"
                      value={this.state.invitedByEmail}
                      onChange={this.inviteMemberByEmailChange.bind(this)}
                      autoComplete="off"
                      onKeyPress={this.submitData}
                    />
                    {renderMessage(
                      this.props.getValidationMessages('invitedByEmail')
                    )}
                  </Col>
                </FormGroup>
              </Col>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="flex justify-content-space-between">
          <Button
            bsStyle="info"
            className="no-bold no-round"
            onClick={this.switchInvitationMode.bind(this, '')}
          >
            {!this.state.invitationByEmailFlag
              ? 'INVITE By Email'
              : ' Invite By Name'}
          </Button>

          <div className="flex-1">
            {!this.state.invitationByEmailFlag ? (
              <Button
                bsStyle="primary"
                className="no-bold no-round"
                onClick={
                  !isLoading
                    ? this.inviteMember.bind(
                        this,
                        '',
                        this.props.user.firstName || '',
                        this.props.user.lastName || ''
                      )
                    : null
                }
              >
                INVITE
              </Button>
            ) : (
              <Button
                bsStyle="primary"
                className="no-bold no-round"
                disabled={isLoading}
                onClick={!isLoading ? this.validateData : null}
              >
                {isLoading ? 'In Progress...' : 'INVITE'}
              </Button>
            )}

            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.memberModal.bind(this, '')}
            >
              CLOSE
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData
  };
};
InviteMembers = validation(strategy)(InviteMembers);
export default connect(
  mapStateToProps,
  null
)(InviteMembers);
