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
  setLocalStorage,
  showSuccessToast,
  showErrorToast
} from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class AddMoreStudent extends Component {
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
    this.handleAddMail = this.handleAddMail.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.addStudentModelFun = this.addStudentModelFun.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        firstName: ['required', 'regex:' + regExpressions.alphaOnly],
        lastName: ['regex:' + regExpressions.alphaOnly],
        email: 'required|email'
      },
      {
        'required.firstName': validationMessages.firstName.required,
        'regex.firstName': validationMessages.firstName.alphaOnly,
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
        parentFirstName: user.firstName,
        parentLastName: user.lastName
      });
      if (this.props.user) {
        this.setState({
          addStudentModel: this.props.addStudentModel
        });
      }
    }
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

  handleAddMail() {
    let studentMailList = this.state.studentMailList;
    console.log(studentMailList.length);
    if (studentMailList[studentMailList.length - 1]['email'] === '')
      return false;
    studentMailList.push({ email: '', firstName: '' });
    this.setState({ studentMailList: studentMailList });
  }

  handleChangeStudentMail = (index, event) => {
    console.log(event.target.value);
    let studentMailList = this.state.studentMailList;
    studentMailList[index][event.target.name] = event.target.value;
    this.setState({ studentMailList: studentMailList });
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

  existMail = event => {
    let students = this.state.user.students;
    let studentMailList = this.state.studentMailList;
    let self = this;
    console.log('existMail Function----------------');

    if (event.target.value === '') return false;

    // var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    // if (!filter.test(event.target.value)) {
    //   studentMailList[index]['email'] = '';
    //   self.setState({ studentMailList: studentMailList });
    //   showErrorToast('Invalid Email.');
    // }

    students &&
      students.forEach(function(data) {
        if (data.email === event.target.value) {
          showErrorToast('Email already exist.');
          self.setState({ [event.target.name]: '' });
          return false;
        }
      });

    // studentMailList.forEach(function(data, i) {
    //   if (data.email === event.target.value && i !== index) {
    //     showErrorToast('Email already in use.');
    //     studentMailList[index]['email'] = '';
    //     self.setState({ studentMailList: studentMailList });
    //     return false;
    //   }
    // });
  };

  handleSubmit() {
    let self = this;
    let userId = this.state.user.userId;
    let roleId = this.state.user.roleId;
    let firstName = this.state.parentFirstName;
    let lastName = this.state.parentLastName;
    let isActive = this.state.user.isActive;
    let students = [
      {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email
      }
    ];
    let address = {
      street1: this.state.streetAddress1,
      street2: this.state.streetAddress2,
      city: this.state.city,
      state: this.state.state,
      country: this.state.country,
      zip: this.state.zipcode
    };

    console.log('state ', this.state);
    let data = {
      userId,
      firstName,
      lastName,
      students,
      roleId,
      isActive,
      address
    };

    spikeViewApiService('updateUserProfile', data)
      .then(response1 => {
        self.props
          .actionGetStudentList(userId)
          .then(response => {
            self.setState({ isLoading: false });
            if (
              response.payload &&
              response.payload.data.status === 'Success'
            ) {
              const studentListResponse = response.payload.data.result;
              let user = self.state.user;

              user['firstName'] = firstName;
              user['lastName'] = lastName;
              user['address'] = address;
              user['students'] = studentListResponse;
              setLocalStorage('parentInfo', user);
              setLocalStorage('userInfo', user);
              let parentStudentData = {
                parent: user,
                studentData: user
              };
              self.props.actionSetStudentAsUser(parentStudentData);
              if (studentListResponse && studentListResponse.length > 0) {
                console.log(studentListResponse);
                if (response1.data.status === 'Error') {
                  // setTimeout(() => {
                  // //  self.props.history.push('/parent/dashboard');
                  // }, 4000);
                } else {
                  showSuccessToast(response1.data.message);
                  self.addStudentModelFun();
                }
              } else {
                console.log('ddddddd');
              }
            }
          })
          .catch(error => {
            self.setState({
              isLoading: false
            });
            console.log('err', error);
          });
      })
      .catch(err => {
        console.log(err);
      });
  }

  addStudentModelFun() {
    this.setState({ addStudentModel: this.state.addStudentModel });
    this.props.closeAddStudentModel();
  }

  render() {
    let self = this;
    const { isLoading } = this.state;
    const cssClasses = {
      root: 'input-group mb-1',
      input: 'form-control'
    };
    const inputProps = {
      value: this.state.streetAddress1,
      onChange: this.onChange,
      placeholder: 'Street Address1',
      type: 'text'
    };
    const defaultStyles = {
      root: {
        position: 'relative',
        paddingBottom: '0px'
      },
      input: {
        display: 'inline-block',
        width: '100%',
        padding: '10px'
      },
      autocompleteContainer: {
        position: 'absolute',
        top: '100%',
        backgroundColor: 'white',
        border: '1px solid #555555',
        width: '100%'
      },
      autocompleteItem: {
        backgroundColor: '#ffffff',
        padding: '10px',
        color: '#555555',
        cursor: 'pointer'
      },
      autocompleteItemActive: {
        backgroundColor: '#fafafa'
      }
    };

    return (
      <div>
        <Modal
          //   bsSize="medium"
          show={this.state.addStudentModel}
          onHide={this.addStudentModelFun}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Add New Student
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
                  <Col sm={4}>First Name</Col>
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
                  <Col sm={4}>Last Name</Col>
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
                  <Col sm={4}>Email</Col>
                  <Col sm={8}>
                    <FormControl
                      type="email"
                      name="email"
                      placeholder="Email "
                      value={this.state.email}
                      onBlur={self.existMail.bind(self)}
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

AddMoreStudent = validation(strategy)(AddMoreStudent);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddMoreStudent);
