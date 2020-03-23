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
  Nav,
  NavItem
} from 'react-bootstrap';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';

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
//import DatePicker from '../../assets/react-datepicker';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;
let i = 0;

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
      parentLastName: '',
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
      isOpen: false,
      year: '',
      month: '',
      day: '',
      parentField: false,
      dob: ''
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
        : 3
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

    if (parseInt(type, 10) === 3) {
      //elementObject.parentFirstName = ['regex:' + regExpressions.alphaOnly];
      elementObject.year = 'required';
      elementObject.month = 'required';
      elementObject.day = 'required';

      // messageObject['regex.parentFirstName'] =
      //   validationMessages.parentName.alphaOnly;

      messageObject['required.year'] = validationMessages.DOBYear.required;

      messageObject['required.month'] = validationMessages.DOBMonth.required;

      messageObject['required.day'] = validationMessages.DOBDay.required;
    }

    if (parseInt(type, 10) === 2) {
      elementObject.parentEmail = 'required|email';
      elementObject.parentFirstName = [
        'required',
        'regex:' + regExpressions.alphaOnly
      ];
      elementObject.parentLastName = [
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

      messageObject['required.parentLastName'] =
        validationMessages.parentLastName.required;

      messageObject['regex.parentLastName'] =
        validationMessages.parentLastName.alphaOnly;
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

  // handleDate = birthDate => {
  //   let bDate = moment(birthDate).format('MM-DD-YYYY');
  //   console.log(bDate);
  //   this.setState({ birthDate, isOpen: false }, () => {
  //     this.setDatePickerPlaceHolder();
  //   });
  //   //Parent Email Blank In case of greater than 13
  //   let role = this.state.roleId;
  //   let age = this.calculateAgeWithDate(birthDate);
  //   if (role === 1) {
  //     if (age < 14) {
  //       this.validatorTypes.rules['parentEmail'] = 'required|email';
  //       this.validatorTypes.messages['required.parentEmail'] =
  //         'Please enter parent email address';
  //       this.validatorTypes.messages['email.parentEmail'] =
  //         'Please enter a valid parent email address';

  //       this.validatorTypes.rules['parentFirstName'] =
  //         'required|regex:' + regExpressions.alphaOnly;
  //       this.validatorTypes.messages['required.parentFirstName'] =
  //         validationMessages.parentName.required;
  //       this.validatorTypes.messages['regex.parentFirstName'] =
  //         validationMessages.parentName.alphaOnly;
  //     } else {
  //       this.validatorTypes.rules['parentEmail'] = 'email';
  //       this.validatorTypes.messages['required.parentEmail'] = '';
  //       this.validatorTypes.messages['email.parentEmail'] =
  //         'Please enter a valid parent email address';

  //       this.validatorTypes.rules['parentFirstName'] =
  //         'regex:' + regExpressions.alphaOnly;
  //       this.validatorTypes.messages['required.parentFirstName'] = '';
  //     }
  //   }
  // };

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
        var email = self.state.email
          ? self.state.email.toLowerCase().trim()
          : '';
        var parentEmail = self.state.parentEmail
          ? self.state.parentEmail.toLowerCase().trim()
          : '';
        if (email === parentEmail) {
          showErrorToast("Parent and Student's email address should be unique");
        } else {
          self.setState({ isLoading: true });
          self.handleSubmit();
        }
      }
    });
  };

  // //Age  calculate Function
  // calculateAgeWithDate(value) {
  //   let dob = moment(value).format('LLLL');
  //   // let current = Math.floor(Date.now() / 1000);
  //   var today = new Date();
  //   var birthDate = new Date(dob);
  //   var age = today.getFullYear() - birthDate.getFullYear();
  //   console.log('age : ', age);
  //   return age;
  // }

  handleSelect = eventKey => {
    if (eventKey !== this.state.roleId) {
      this.setState({
        firstName: '',
        lastName: '',
        email: '',
        parentEmail: '',
        parentFirstName: '',
        parentLastName: '',
        birthDate: '',
        month: '',
        day: '',
        year: ''
      });
    }

    this.setState({
      roleId: eventKey == 2 ? 2 : 1,
      eventKey: eventKey
    });
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
    let day = this.state.day !== '' ? this.state.day : '';
    let month = this.state.month !== '' ? Number(this.state.month) : '';
    let year = this.state.year !== '' ? this.state.year : '';
    let dob = '';

    if (day && month >= 0 && year) {
      dob = new Date(year, month, day);
      dob = dob.valueOf();
    }

    let students = [];
    let data = '';
    let self = this;

    if (roleId === 1) {
      let parentEmail = self.state.parentEmail.toLowerCase().trim();
      let parentFirstName = this.state.parentFirstName.trim();
      let parentLastName = this.state.parentLastName
        ? this.state.parentLastName.trim()
        : '';
      let data = {
        firstName,
        lastName,
        email,
        parentEmail,
        parentFirstName,
        parentLastName,
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
        firstName: this.state.parentFirstName.trim(),
        lastName: this.state.parentLastName
          ? this.state.parentLastName.trim()
          : ''
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

  selectDate(type, value) {
    if (type === 'year') {
      this.setState({ year: value }, () => this.checkAge());
    }
    if (type === 'month') {
      this.setState({ month: value }, () => this.checkAge());
    }
    if (type === 'day') {
      this.setState({ day: value }, () => this.checkAge());
      // console.log(value);
      // console.log(this.state.year);
      // console.log(moment().format('YYYY'));
      // console.log(moment().format('D'));
      // if (
      //   value > moment().format('D') &&
      //   this.state.year <= moment().format('YYYY')
      // ) {
      //   showErrorToast('Please select valid day');
      //   this.setState({ day: '' });
      // } else {
      //   this.setState({ day: value }, () => this.checkAge());
      // }
    }
  }

  checkAge() {
    if (this.state.year && this.state.month && this.state.day) {
      let day = this.state.day;
      let month = Number(this.state.month);
      console.log(month);
      let year = this.state.year;
      let birthDate = new Date(year, month, day);
      var today = new Date();

      if (birthDate > today) {
        showErrorToast('Date of birth should be less than future date');
        this.setState({
          day: '',
          month: '',
          year: ''
        });
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      if (age <= 13) {
        this.setState({
          parentField: true
        });
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

        this.validatorTypes.rules['parentLastName'] =
          'required|regex:' + regExpressions.alphaOnly;

        this.validatorTypes.messages['required.parentLastName'] =
          validationMessages.parentLName.required;

        this.validatorTypes.messages['regex.parentLastName'] =
          validationMessages.parentLName.alphaOnly;
      } else {
        this.setState({
          parentField: false,
          parentFirstName: '',
          parentEmail: ''
        });
        this.validatorTypes.rules['parentEmail'] = 'email';
        this.validatorTypes.messages['required.parentEmail'] = '';
        this.validatorTypes.messages['email.parentEmail'] =
          'Please enter a valid parent email address';

        this.validatorTypes.rules['parentFirstName'] =
          'regex:' + regExpressions.alphaOnly;
        this.validatorTypes.messages['required.parentFirstName'] = '';
        this.validatorTypes.messages['regex.parentFirstName'] = '';

        this.validatorTypes.rules['parentLastName'] =
          'regex:' + regExpressions.alphaOnly;
        this.validatorTypes.messages['required.parentLastName'] = '';
        this.validatorTypes.messages['regex.parentLastName'] = '';
      }
    }
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div className="innerWrapper fullHeight">
      <div className="d-app-head">
          <a href="https://testflight.apple.com/join/7xaw03JI" className="app-btn">
            <img src="../assets/img/App-Store.png" />
          </a>
          <a href="https://drive.google.com/file/d/15KFJVR8nIb5hSV7e-SGyXY_Od4GdRZYC/view?usp=sharing" className="app-btn">
            <img src="../assets/img/Play-Store.png" />
          </a>
        </div>
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
                <label className="form-label">First Name</label>
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
                <label className="form-label">Last Name</label>
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
                <label className="form-label">Email</label>
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
                <FormGroup>
                  <label className="form-label">Date Of Birth</label>
                  <div className="dob">
                    <div className={`form-group ${this.getClasses('year')}`}>
                      <YearPicker
                        id="year"
                        name="year"
                        classes="form-control"
                        defaultValue="Year"
                        start={1970}
                        end={moment().year()}
                        reverse
                        value={this.state.year}
                        onChange={year => this.selectDate('year', year)}
                      />
                      {renderMessage(this.props.getValidationMessages('year'))}
                    </div>

                    <div className={`form-group ${this.getClasses('month')}`}>
                      <MonthPicker
                        id="month"
                        name="month"
                        classes="form-control"
                        defaultValue="Month"
                        short
                        endYearGiven
                        year={this.state.year}
                        value={this.state.month}
                        onChange={month => this.selectDate('month', month)}
                      />

                      {renderMessage(this.props.getValidationMessages('month'))}
                    </div>

                    <div className={`form-group ${this.getClasses('day')}`}>
                      <DayPicker
                        defaultValue="Day"
                        id="day"
                        name="day"
                        classes="form-control"
                        year={this.state.year}
                        month={this.state.month}
                        endYearGiven
                        value={this.state.day}
                        onChange={day => this.selectDate('day', day)}
                      />
                      {renderMessage(this.props.getValidationMessages('day'))}
                    </div>
                  </div>
                  <span
                    className="error"
                    id="dateOfBirth"
                    style={{ display: 'none' }}
                  >
                    Please enter valid date of birth
                  </span>
                  {/* {renderMessage(this.props.getValidationMessages('DOB'))} */}
                  {/* <InputGroup>
                    <InputGroup.Addon>
                      <span class="icon-calender" />
                    </InputGroup.Addon>
                    <DatePicker
                      className="form-control"
                      name="birthDate"
                      maxDate={moment()}
                      selected={this.state.birthDate}
                      onChange={this.handleDate}
                      placeholderText="Date Of Birth"
                      showYearDropdown={true}
                      //showMonthDropdown={true}
                      dateFormat="DD-MMM-YYYY"
                      isClearable={false}
                      dropdownMode={'scroll'}
                      scrollableYearDropdown={true}
                    />

                    {renderMessage(
                      this.props.getValidationMessages('birthDate')
                    )}
                  </InputGroup> */}
                </FormGroup>
              ) : (
                ''
              )}
              {this.state.roleId === 1
                ? this.state.parentField
                  ? [
                      <FormGroup
                        className={this.getClasses('parentEmail')}
                        key="1"
                      >
                        <label className="form-label">Parent Email</label>
                        <InputGroup>
                          <InputGroup.Addon>
                            <span className="icon-email" />
                          </InputGroup.Addon>
                          <FormControl
                            type="Email"
                            placeholder={
                              this.state.roleId === 1
                                ? 'Parent Email'
                                : 'Student Email'
                            }
                            name="parentEmail"
                            value={this.state.parentEmail}
                            onChange={this.handleChange}
                            autoComplete="off"
                            onKeyPress={this.submitData}
                          />
                        </InputGroup>

                        {renderMessage(
                          this.props.getValidationMessages('parentEmail')
                        )}
                      </FormGroup>,

                      <FormGroup
                        className={this.getClasses('parentFirstName')}
                        key="2"
                      >
                        <label className="form-label">Parent First Name</label>
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
                      </FormGroup>,
                      <FormGroup
                        key="3"
                        className={this.getClasses('parentLastName')}
                      >
                        <label className="form-label">Parent Last Name</label>
                        <InputGroup>
                          <InputGroup.Addon>
                            <span className="icon-username" />
                          </InputGroup.Addon>
                          <FormControl
                            type="Email"
                            placeholder="Parent Last Name"
                            name="parentLastName"
                            value={this.state.parentLastName}
                            onChange={this.handleChange}
                            autoComplete="off"
                            onKeyPress={this.submitData}
                          />
                        </InputGroup>
                        {renderMessage(
                          this.props.getValidationMessages('parentLastName')
                        )}
                      </FormGroup>
                    ]
                  : ''
                : this.state.roleId === 2
                  ? [
                      <FormGroup
                        className={this.getClasses('parentEmail')}
                        key="1"
                      >
                        <label className="form-label">Student Email</label>
                        <InputGroup>
                          <InputGroup.Addon>
                            <span className="icon-email" />
                          </InputGroup.Addon>
                          <FormControl
                            type="Email"
                            placeholder={
                              this.state.roleId === 1
                                ? 'Parent Email'
                                : 'Student Email'
                            }
                            name="parentEmail"
                            value={this.state.parentEmail}
                            onChange={this.handleChange}
                            autoComplete="off"
                            onKeyPress={this.submitData}
                          />
                        </InputGroup>

                        {renderMessage(
                          this.props.getValidationMessages('parentEmail')
                        )}
                      </FormGroup>,

                      <FormGroup
                        className={this.getClasses('parentFirstName')}
                        key="2"
                      >
                        <label className="form-label">Student First Name</label>
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
                      </FormGroup>,
                      <FormGroup
                        key="3"
                        className={this.getClasses('parentFirstName')}
                      >
                        <label className="form-label">Student Last Name</label>
                        <InputGroup>
                          <InputGroup.Addon>
                            <span className="icon-username" />
                          </InputGroup.Addon>
                          <FormControl
                            type="Email"
                            placeholder="Student Last Name"
                            name="parentLastName"
                            value={this.state.parentLastName}
                            onChange={this.handleChange}
                            autoComplete="off"
                            onKeyPress={this.submitData}
                          />
                        </InputGroup>
                        {renderMessage(
                          this.props.getValidationMessages('parentLastName')
                        )}
                      </FormGroup>
                    ]
                  : ''}
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
