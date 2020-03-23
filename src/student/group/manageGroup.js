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
import INVITEMEMBERS from './inviteMembers';
import CONSTANTS from '../../common/core/config/appConfig';
let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class ManageGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userList: [],
      disabled: false,
      memberModal: false,
      connectionLoader: true,
      connectionList: [],
      myConnections: [],
      invitationByEmailFlag: false,
      userId:
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.userId,
      clicked: false,
      groupOwner:  this.props.location &&
                  this.props.location.state &&
                    this.props.location.state.groupOwner
    };

    this.tagConnection = [];
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.validatorTypes = strategy.createInactiveSchema(
      {
        groupName: 'required',
        aboutGroup: 'required'
      },
      {
        'required.groupName': validationMessages.groupName.required,
        'required.aboutGroup': validationMessages.aboutGroup.required
      }
    );
  }

  componentWillMount() {   
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {  
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.selectedGroup
    ) {
      let selectedGroup = this.props.location.state.selectedGroup;
      this.getGroupDetailByGroupId(selectedGroup.groupId);
    }  
  }

  getGroupDetailByGroupId(groupId) {
    spikeViewApiService('getGroupDetailByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let selectedGroup = response.data.result[0];
          this.setState({
            selectedGroup: selectedGroup,
            groupName: selectedGroup.groupName,
            aboutGroup: selectedGroup.aboutGroup,
            otherInfo: selectedGroup.otherInfo,
            groupMemberList: selectedGroup.members,
            type: selectedGroup.type
          });
        }
      }
    );
  }

  memberModal = () => {
    if (this.state.memberModal === false) {
      this.setState({ myConnections: [] });
    }
    this.setState({
      memberModal: !this.state.memberModal,
      invitationByEmailFlag: false
    });
  };

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
        self.editGroupInfo();
      }
    });
  };

  editGroupInfo = event => {
    let data = {
      groupId: this.state.selectedGroup.groupId,
      groupName: this.state.groupName,
      aboutGroup: this.state.aboutGroup,
      otherInfo: this.state.otherInfo,
      type: this.state.type
    };
    spikeViewApiService('updateGroupInfo', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          // this.setState({ memberModal: !this.state.memberModal });
          let result = response.data.result;
          let selectedGroup = this.state.selectedGroup;
          selectedGroup['groupName'] = result.groupName;
          this.setState({
            selectedGroup: selectedGroup,
            groupName: result.groupName,
            aboutGroup: result.aboutGroup,
            otherInfo: result.otherInfo,
            isLoading: false
          });
        }
      })
      .catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
      });
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div className="innerWrapper">
        <div className="container" />
        <Header {...this.props} />
        <div className="profileBox">
          <div className="container main">
            <div className="mt-1 fullWidth">
              <ul className="myProfileInfo--wrapper">
                <li>
                  <div className="">
                    <div className="flex align-center justify-content-between primary-text mb-1">
                      <div className="section-main-title boldTitle">
                        {this.state.selectedGroup &&
                          this.state.selectedGroup.groupName}
                      </div>
                      <div className="flex align-center button-group">
                        <Button
                          bsStyle="with-border with-icon smallBtn text-uppercase"
                          onClick={this.memberModal}
                        >
                          <span className="icon-plus" /> Invite Members
                        </Button>
                        <Button
                          disabled={this.state.groupOwner == this.props.user.userId ? false : true}
                          bsStyle="with-icon smallBtn btn-primary"
                          onClick={!isLoading ? this.validateData : null}
                        >
                          {isLoading ? 'In Progress...' : 'Save'}
                        </Button>
                        {/* <Button bsStyle="with-border with-icon smallBtn primary">
                          <span className="icon-send icon" /> Resend
                        </Button> */}
                      </div>
                    </div>

                    <div className="section-main mb-mb-">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Group Name
                          <span />
                        </div>
                      </div>
                      <FormGroup
                        controlId="formHorizontalEmail"
                        className={this.getClasses('groupName')}
                      >
                        <p>
                          <FormControl
                            type="text"
                            readOnly={this.state.groupOwner == this.props.user.userId ? false : true}
                            placeholder="Group Name"
                            name="groupName"
                            value={this.state.groupName}
                            onChange={this.handleChange}
                            onKeyPress={this.handleChange}
                            maxLength="50"
                          />
                          {}
                        </p>
                        {renderMessage(
                          this.props.getValidationMessages('groupName')
                        )}
                      </FormGroup>
                    </div>

                    <div className="section-main mb-mb-">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          About Group
                          <span />
                        </div>
                      </div>
                      <FormGroup
                        controlId="formHorizontalEmail"
                        className={this.getClasses('aboutGroup')}
                      >
                        <p>
                          <FormControl
                            readOnly={this.state.groupOwner == this.props.user.userId ? false : true}
                            componentClass="textarea"
                            name="aboutGroup"
                            placeholder="Enter Here"
                            value={this.state.aboutGroup}
                            onChange={this.handleChange}
                            maxLength="500"
                          />
                        </p>
                        {renderMessage(
                          this.props.getValidationMessages('aboutGroup')
                        )}
                      </FormGroup>
                    </div>

                    <div className="section-main mb-3">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Other Information
                          <span />
                        </div>
                      </div>
                      <p>
                        <FormControl
                          readOnly={this.state.groupOwner == this.props.user.userId ? false : true}
                          componentClass="textarea"
                          name="otherInfo"
                          placeholder="Enter Here"
                          value={this.state.otherInfo}
                          onChange={this.handleChange}
                          maxLength="500"
                        />
                      </p>
                    </div>

                    <div className="section-main mb-3">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Group Type
                          <span />
                        </div>
                      </div>

                      <Col>
                        <Radio
                          className="radio-primary"
                          disabled={this.state.groupOwner == this.props.user.userId ? false : true}
                          name="type"
                          checked={this.state.type === 'private' ? true : false}
                          value="private"
                          onChange={this.handleChange}
                        >
                          Private Group
                          <span className="check" />
                        </Radio>

                        <Radio
                          disabled={this.state.groupOwner == this.props.user.userId ? false : true}
                          className="radio-primary"
                          name="type"
                          checked={this.state.type === 'public' ? true : false}
                          value="public"
                          onChange={this.handleChange}
                        >
                          Public Group
                          <span className="check" />
                        </Radio>
                      </Col>
                    </div>

                    <div className="section-main mb-3">
                      <div className="flex align-center">
                        <div className="section-main-title secondaryTitle">
                          Created On
                          <span />
                        </div>
                      </div>
                      <p>
                        {this.state.selectedGroup &&
                          moment(this.state.selectedGroup.creationDate).format(
                            'DD MMMM, YYYY'
                          )}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {this.state.memberModal ? (
          <INVITEMEMBERS
            memberModal={this.state.memberModal}
            memberModal={this.memberModal}
            selectedGroup={this.state.selectedGroup}
          />
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData
  };
};
ManageGroup = validation(strategy)(ManageGroup);
export default connect(
  mapStateToProps,
  null
)(ManageGroup);
