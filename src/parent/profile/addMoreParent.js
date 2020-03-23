import React, { Component } from 'react';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import spikeViewApiService from '../../common/core/api/apiService';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionGetStudentList } from '../../common/core/redux/actions';
import { actionSetStudentAsUser } from '../../common/core/redux/actions';

import {
  Button,
  Modal,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  FormControl
} from 'react-bootstrap';
import {
  renderMessage,
  showSuccessToast,
  showErrorToast
} from '../../common/commonFunctions';

import CONSTANTS from '../../common/core/config/appConfig';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class AddMoreParent extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      firstName: '',
      lastName: '',
      isLoading: false,
      studentMailList: [{ email: '' }],
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      country: '',
      zipcode: ''
    };
    this.handleSubmit = this.handleSubmit.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.addStudentModelFun = this.addStudentModelFun.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        firstName: ['required', 'regex:' + regExpressions.alphaOnly],
        lastName: ['required','regex:' + regExpressions.alphaOnly],
        email: 'required|email'
      },
      {
        'required.firstName': validationMessages.firstName.required,
        'regex.firstName': validationMessages.firstName.alphaOnly,
        'required.lastName': validationMessages.lastName.required,
        'regex.lastName': validationMessages.lastName.alphaOnly,
        'required.email': validationMessages.email.required,
        'email.email': validationMessages.email.invalid
      }
    );
  }

  componentDidMount() {
    if (this.props.parent) {
      this.props.parent['token'] = this.props.user['token'];
    }
    if (this.props.user) {
      let user = this.props.parent ? this.props.parent : this.props.user;
      this.setState({
        user: user,
        firstName: '',
        lastName: ''
      });
    }
    this.setState({ addParentModel: this.props.addParentModel });
  }

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
      console.log('error', error);
      if (!error) {
        self.setState({ isLoading: true });
        self.handleSubmit();
      }
    });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  submitData = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.validateData();
    }
  };

  //   checkStudentName = (index, event) => {
  //     let studentMailList = this.state.studentMailList;
  //     let self = this;
  //     if (event.target.value === '') return false;

  //     var filter = /^[A-Za-z\s]+$/;
  //     if (!filter.test(event.target.value)) {
  //       studentMailList[index]['firstName'] = '';
  //       this.setState({ studentMailList: studentMailList });
  //       showErrorToast('Invalid Student Name.');
  //     }
  //   };

  handleSubmit() {
    let existParentEmail = this.state.user.email;
    let email = this.state.email;
    if (existParentEmail === email) {
      this.setState({
        isLoading: false
      });
      showErrorToast('Parent Email Id Can not be Same.');
    } else {
      let self = this;
      let parentId = this.state.user.userId;
      let parentName = this.state.user.firstName;
      let roleId = this.state.user.roleId;
      let firstName = this.state.firstName;
      let lastName = this.state.lastName;
      let studentId = this.props.studentId;

      console.log('state ', this.state);
      let data = {
        parentName,
        parentId,
        firstName,
        lastName,
        email,
        roleId,
        studentId
      };

      spikeViewApiService('addParentProfile', data)
        .then(response => {
          if (response.data.status === 'Error') {
            self.setState({
              isLoading: false
            });
            // setTimeout(() => {
            // //  self.props.history.push('/parent/dashboard');
            // }, 4000);
          } else {
            showSuccessToast(response.data.message);
            self.addStudentModelFun();
          }
        })
        .catch(error => {
          self.setState({
            isLoading: false
          });
          console.log('err', error);
        });
    }
  }

  addStudentModelFun() {
    this.setState({ addParentModel: this.state.addParentModel });
    this.props.closeAddParentModel();
  }

  render() {
    let self = this;
    const { isLoading } = this.state;

    return (
      <div>
        <Modal
          // bsSize="medium"
          show={this.state.addParentModel}
          onHide={this.addStudentModelFun}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Add New Parent
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form horizontal className="lightBgForm">
              <Col sm={12}>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'firstName'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    First Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={this.state.firstName}
                      //     onBlur={self.checkStudentName.bind(self, index)}
                      onChange={self.handleChange.bind(self)}
                      autoComplete="off"
                      maxLength="35"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('firstName')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses(
                    'lastName'
                  )}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Last Name
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={this.state.lastName}
                      //     onBlur={self.checkStudentName.bind(self, index)}
                      onChange={self.handleChange.bind(self)}
                      autoComplete="off"
                      maxLength="35"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('lastName')
                    )}
                  </Col>
                </FormGroup>
                <FormGroup
                  className={`centeredRightLabel ${this.getClasses('email')}`}
                >
                  <Col componentclassName={ControlLabel} sm={4}>
                    Email
                  </Col>
                  <Col sm={8}>
                    <FormControl
                      type="email"
                      name="email"
                      placeholder="Email "
                      value={this.state.email}
                      //   onBlur={self.existMail.bind(self)}
                      onChange={self.handleChange.bind(self)}
                      autoComplete="off"
                    />
                    {renderMessage(this.props.getValidationMessages('email'))}
                  </Col>
                </FormGroup>
              </Col>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="primary no-bold no-round mr-1"
              className="no-bold no-round"
              disabled={isLoading}
              onClick={!isLoading ? this.validateData : null}
            >
              {isLoading ? 'Loading...' : 'Save'}
            </Button>
            <Button
              bsStyle="default no-bold no-round"
              className="no-bold no-round"
              onClick={this.addStudentModelFun}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { actionGetStudentList, actionSetStudentAsUser },
    dispatch
  );
};

AddMoreParent = validation(strategy)(AddMoreParent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddMoreParent);
