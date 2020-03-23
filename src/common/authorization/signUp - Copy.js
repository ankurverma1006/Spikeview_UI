import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import {
  Button,
  FormGroup,
  InputGroup,
  FormControl,
  ButtonToolbar,
  DropdownButton,
  MenuItem,
  Nav,
  NavItem
} from 'react-bootstrap';

import Sidebar from './sideBar';
import spikeViewApiService from '../core/api/apiService';
import {
  ZoomInAndOut,
  renderMessage,
  showErrorToast
} from '../commonFunctions';
import CONSTANTS from '../core/config/appConfig';

import moment from 'moment';
//import DatePicker from 'react-datepicker';
import DatePicker from 'react-date-picker';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class Signup extends Component {
  constructor(props, context) {
    super(props);
    this.state = {
      isLoading: false,
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      parentFirstName: '',
      roles: [],
      roleId:
        this.props.location.state &&
        this.props.location.state.eventKey &&
        this.props.location.state.eventKey === 2
          ? 2
          : 1,
      eventKey:
        this.props.location.state &&
        this.props.location.state.eventKey &&
        this.props.location.state.eventKey === 2
          ? 2
          : 3,
      birthDate: '',
      isOpen: false
    };

    this.initialState = this.state;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.setValidatorTypes = this.setValidatorTypes.bind(this);
  }

  async componentWillMount() {
    this.getRoles();
    this.setValidatorTypes(
      this.props.location.state &&
        this.props.location.state.eventKey &&
        this.props.location.state.eventKey === 2
        ? 2
        : 1
    );
  }
  componentDidMount() {
    this.setDatePickerPlaceHolder();
  }

  setValidatorTypes(type) {
    let elementObject = {
      firstName: ['required', 'regex:' + regExpressions.alphaOnly],
      lastName: ['required', 'regex:' + regExpressions.alphaOnly],
      email: 'required|email'
    };

    let messageObject = {
      'required.firstName': validationMessages.firstName.required,
      'regex.firstName': validationMessages.firstName.alphaOnly,
      'required.lastName': validationMessages.lastName.required,
      'regex.lastName': validationMessages.lastName.alphaOnly,
      'required.email': validationMessages.email.required,
      'email.email': validationMessages.email.invalid
    };

    if (parseInt(type, 10) === 1) {
      elementObject.birthDate = 'required';
      messageObject['required.birthDate'] =
        validationMessages.birthDate.required;

      elementObject.parentFirstName = ['regex:' + regExpressions.alphaOnly];
      messageObject['regex.parentFirstName'] =
        validationMessages.parentName.alphaOnly;
    }

    if (parseInt(type, 10) === 2) {
      elementObject.parentEmail = 'required|email';
      elementObject.parentFirstName = [
        'required',
        'regex:' + regExpressions.alphaOnly
      ];
      messageObject['required.parentEmail'] =
        validationMessages.parentEmail.required;
      messageObject['email.parentEmail'] = validationMessages.email.invalid;
      messageObject['required.parentFirstName'] =
        validationMessages.parentFirstName.required;
      messageObject['regex.parentFirstName'] =
        validationMessages.parentFirstName.alphaOnly;
    }
    this.validatorTypes = strategy.createSchema(elementObject, messageObject);
  }

  getValidatorData() {
    return this.state;
  }

  getClasses(field) {
    return classnames({
      error: !this.props.isValid(field)
    });
  }

  getRoles = () => {
    spikeViewApiService('roleType', '')
      .then(response => {
        if (response.data.status === 'Success') {
          this.setState({ roles: response.data.result });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  setDatePickerPlaceHolder() {
    try {
      if (!this.state.birthDate)
        document.getElementsByName('date')[0].style.visibility = 'visible';
      else {
        document.getElementsByName('date')[0].style.visibility = 'hidden';
      }
    } catch (error) {}
  }

  handleDate = birthDate => {
    let bDate = moment(birthDate).format('MM-DD-YYYY');
    console.log(bDate);
    this.setState({ birthDate, isOpen: false }, () => {
      this.setDatePickerPlaceHolder();
    });
    //Parent Email Blank In case of greater than 13
    let role = this.state.roleId;
    let age = this.calculateAgeWithDate(birthDate);
    if (role === 1) {
      if (age < 14) {
        this.validatorTypes.rules['parentEmail'] = 'required|email';
        this.validatorTypes.messages['required.parentEmail'] =
          'Please enter parent email address';
        this.validatorTypes.messages['email.parentEmail'] =
          'Please enter a valid parent email address';

        this.validatorTypes.rules['parentFirstName'] =
          'required|regex:' + regExpressions.alphaOnly;
        this.validatorTypes.messages['required.parentFirstName'] =
          validationMessages.parentName.required;
        this.validatorTypes.messages['regex.parentFirstName'] =
          validationMessages.parentName.alphaOnly;
      } else {
        this.validatorTypes.rules['parentEmail'] = 'email';
        this.validatorTypes.messages['required.parentEmail'] = '';
        this.validatorTypes.messages['email.parentEmail'] =
          'Please enter a valid parent email address';

        this.validatorTypes.rules['parentFirstName'] =
          'regex:' + regExpressions.alphaOnly;
        this.validatorTypes.messages['required.parentFirstName'] = '';
      }
    }
  };

  submitData = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.validateData();
    }
  };

  validateData = () => {
    let self = this;
    this.props.validate(function(error) {
      if (!error) {
        if (self.state.email === self.state.parentEmail) {
          showErrorToast('Email should not be same');
        } else {
          self.setState({ isLoading: true });
          self.handleSubmit();
        }
      }
    });
  };

  //Age  calculate Function
  calculateAgeWithDate(value) {
    let dob = moment(value).format('LLLL');
    // let current = Math.floor(Date.now() / 1000);
    var today = new Date();
    var birthDate = new Date(dob);
    var age = today.getFullYear() - birthDate.getFullYear();
    console.log('age : ', age);
    return age;
  }

  handleSelect = eventKey => {
    if (eventKey !== this.state.roleId) {
      this.setState({
        firstName: '',
        lastName: '',
        email: '',
        parentEmail: '',
        parentFirstName: '',
        birthDate: ''
      });
    }
    this.setState({ roleId: eventKey == 2 ? 2 : 1, eventKey: eventKey });
    this.props.clearValidations();
    this.setValidatorTypes(eventKey);
  };

  handleResetForm = () => {
    this.setState(this.initialState);
  };

  handleSubmit() {
    let firstName = this.state.firstName.trim();
    let lastName = this.state.lastName.trim();
    let email = this.state.email.toLowerCase().trim();
    let roleId = this.state.roleId;
    let dob = moment(this.state.birthDate).valueOf();
    let students = [];
    let data = '';
    let self = this;

    if (roleId === 1) {
      let parentEmail = self.state.parentEmail.trim();
      let parentFirstName = this.state.parentFirstName.trim();
      let data = {
        firstName,
        lastName,
        email,
        parentEmail,
        parentFirstName,
        roleId,
        dob
      };

      spikeViewApiService('signupStudent', data)
        .then(response => {
          if (response.data.status === 'Success') {
            self.handleResetForm();
            setTimeout(function() {
              self.props.history.push('/login');
            }, 5000);
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(err => {
          self.setState({ isLoading: false });
          console.log(err);
        });
    }

    if (roleId === 2) {
      students.push({
        email: self.state.parentEmail.trim(),
        firstName: this.state.parentFirstName.trim()
      });

      data = {
        firstName,
        lastName,
        email,
        students,
        roleId
      };

      spikeViewApiService('signupParent', data)
        .then(response => {
          if (response.data.status === 'Success') {
            self.handleResetForm();
            setTimeout(function() {
              self.props.history.push('/login');
            }, 5000);
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(err => {
          self.setState({ isLoading: false });
          console.log(err);
        });
    }
  }

  DOBClick = () => {
    console.log(this.state.isOpen);
    this.setState(
      {
        isOpen: false
      },
      () => {
        this.setState({
          isOpen: true
        });
      }
    );
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div className="innerWrapper fullHeight">
        <Sidebar />
        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        />
        <div className="formContent">
          <div className="centeredBox p-5">
            <Nav bsStyle="tabs" activeKey={this.state.eventKey == 2 ? 2 : 3}>
              <NavItem
                eventKey={1}
                onClick={() => this.props.history.push('/login')}
              >
                LOGIN
              </NavItem>

              <NavItem eventKey={2} onClick={this.handleSelect.bind(this, '2')}>
                PARENT SIGN UP
              </NavItem>

              <NavItem eventKey={3} onClick={this.handleSelect.bind(this, '3')}>
                STUDENT SIGN UP
              </NavItem>
            </Nav>
            <form>
              {/* <div className="signupText">
                Sign up to SpikeView as
                <ButtonToolbar>
                  <DropdownButton
                    bsSize="xsmall"
                    title={this.state.roleId === 1 ? 'Student' : 'Parent'}
                    id="dropdown-size-large"
                  >
                    {this.state.roles.length > 0
                      ? this.state.roles.map((role, index) => (
                          <MenuItem
                            key={index}
                            eventKey={role.roleTypeId}
                            onSelect={this.handleSelect}
                          >
                            {role.roleName}
                          </MenuItem>
                        ))
                      : ''}
                  </DropdownButton>
                </ButtonToolbar>
              </div> */}

              <FormGroup className={this.getClasses('firstName')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-username" />
                  </InputGroup.Addon>
                  <FormControl
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={this.state.firstName}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="35"
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('firstName'))}
              </FormGroup>

              <FormGroup className={this.getClasses('lastName')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-username" />
                  </InputGroup.Addon>
                  <FormControl
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={this.state.lastName}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="35"
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('lastName'))}
              </FormGroup>

              <FormGroup className={this.getClasses('email')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-email" />
                  </InputGroup.Addon>
                  <FormControl
                    type="Email"
                    placeholder="Email"
                    name="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    autoComplete="off"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('email'))}
              </FormGroup>

              {this.state.roleId === 1 ? (
                <div
                  // onClick={() => {
                  //   console.log(
                  //     'this is test page ',
                  //     document.getElementsByName('date')[0].style.visibility,
                  //     this.state.birthDate
                  //   );
                  //   setTimeout(() => {
                  //     if (
                  //       document.getElementsByName('date')[0].style
                  //         .visibility !== 'hidden' &&
                  //       !this.state.birthDate
                  //     ) {
                  //       this.DOBClick();
                  //     }
                  //   }, 200);
                  // }}
                  id="dev"
                >
                  <FormGroup
                    className={`fullWidthDatepicker ${this.getClasses(
                      'birthDate'
                    )}`}
                    // onClick={this.DOBClick}
                  >
                    <InputGroup>
                      <InputGroup.Addon>
                        <span class="icon-calender" />
                      </InputGroup.Addon>
                      <DatePicker
                        onChange={this.handleDate}
                        value={this.state.birthDate}
                        showLeadingZeros={false}
                        className="form-control"
                        maxDate={new Date()}
                        isOpen={this.state.isOpen}
                      />
                    </InputGroup>

                    {/* <InputGroup>
                    <InputGroup.Addon>
                      <span class="icon-calender" />
                    </InputGroup.Addon>
                    <DatePicker
                      onChange={this.handleDate}
                      value={this.state.birthDate}
                      calendarClassName="form-control"
                    />
                    </InputGroup> */}
                    {/* <DatePicker
                      className="form-control"
                      name="birthDate"
                      fixedHeight
                      selected={this.state.birthDate}
                      onChange={this.handleDate}
                      //showYearDropdown
                      // scrollableYearDropdown
                      placeholderText="Date Of Birth"
                      // yearDropdownItemNumber={6}
                      dateFormat="DD-MMM-YYYY"
                      maxDate={moment()}
                      autoComplete="off"
                      readOnly={true}
                      //todayButton={'Now'}
                    /> */}
                    {/* <DatePicker
                      className="form-control"
                      name="birthDate"
                      maxDate={moment()}
                      selected={
                        this.state.birthDate ? moment(this.state.birthDate) : ''
                      }
                      onChange={this.handleDate}
                      placeholderText="Date Of Birth"
                      dateFormat="DD-MMM-YYYY"
                      // showYearDropdown
                      autoComplete="off"
                      // fixedHeight
                      //  yearDropdownItemNumber="8"
                      // scrollableYearDropdown={true}selected={this.state.startDate}

                      showYearDropdown
                      dateFormatCalendar="MMMM"
                      scrollableYearDropdown
                      yearDropdownItemNumber={15}
                    /> */}

                    {renderMessage(
                      this.props.getValidationMessages('birthDate')
                    )}
                  </FormGroup>
                </div>
              ) : (
                ''
              )}

              <FormGroup className={this.getClasses('parentEmail')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-email" />
                  </InputGroup.Addon>
                  <FormControl
                    type="Email"
                    placeholder={
                      this.state.roleId === 1 ? 'Parent Email' : 'Student Email'
                    }
                    name="parentEmail"
                    value={this.state.parentEmail}
                    onChange={this.handleChange}
                    autoComplete="off"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>

                {renderMessage(this.props.getValidationMessages('parentEmail'))}
              </FormGroup>

              <FormGroup className={this.getClasses('parentFirstName')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-username" />
                  </InputGroup.Addon>
                  <FormControl
                    type="Email"
                    placeholder={
                      this.state.roleId === 1
                        ? 'Parent First Name'
                        : 'Student First Name'
                    }
                    name="parentFirstName"
                    value={this.state.parentFirstName}
                    onChange={this.handleChange}
                    autoComplete="off"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(
                  this.props.getValidationMessages('parentFirstName')
                )}
              </FormGroup>
              <FormGroup>
                <Button
                  bsStyle="primary"
                  className="centeredBtn btn-lg"
                  disabled={isLoading}
                  onClick={!isLoading ? this.validateData : null}
                >
                  {isLoading ? 'In Progress...' : 'Sign Up'}
                </Button>
              </FormGroup>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
Signup = validation(strategy)(Signup);
export default Signup;
