import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  Row,
  InputGroup,
  Radio,
  Checkbox,
  Col,
  ControlLabel,
  FormControl
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PlacesAutocomplete, {
  geocodeByAddress
} from 'react-places-autocomplete';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
import moment from 'moment';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';

import { actionGetStudentPersonalInfo } from '../../../common/core/redux/actions';
import { renderMessage, showErrorToast } from '../../../common/commonFunctions';
import CONSTANTS from '../../../common/core/config/appConfig';
import spikeViewApiService from '../../../common/core/api/apiService';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class addSummary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      summaryModal: true,
      userId: '',
      firstName: '',
      lastName: '',
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      country: '',
      zipcode: '',
      year: '',
      month: '',
      day: '',
      mobileNumber: '',
      gender: 'Female',
      genderAtBirth: 'Female',
      usCitizenOrPR: 'yes',
      requireParentApproval: false,
      ccToParents: false,
      summary: '',
      tagline: '',
      parentEmails: [{ email: '', readOnly: false, userId: '' }],
      roleId: '',
      title: ''
    };

    this.onChange = streetAddress1 => this.setState({ streetAddress1 });
    this.handleSelect = this.handleSelect.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.setValidatorTypes = this.setValidatorTypes.bind(this);
  }

  async componentWillMount() {
    this.getStudentPersonalInfo(this.props.user.userId);
    this.setValidatorTypes();
  }

  setValidatorTypes(type) {
    let elementObject = {
      firstName: ['required', 'regex:' + regExpressions.alphaOnly],
      lastName: ['required', 'regex:' + regExpressions.alphaOnly],
      // year: 'required',
      // month: 'required',
      // day: 'required',
      // city: 'required',
      // state: 'required',
      // country: 'required',
      summary: 'required',
      title: 'required'
    };

    let messageObject = {
      'required.firstName': validationMessages.firstName.required,
      'regex.firstName': validationMessages.firstName.alphaOnly,
      'required.lastName': validationMessages.lastName.required,
      'regex.lastName': validationMessages.lastName.alphaOnly,
      // 'required.year': validationMessages.year.required,
      // 'required.day': validationMessages.day.required,
      // 'required.month': validationMessages.month.required,
      // 'required.city': validationMessages.city.required,
      // 'required.state': validationMessages.state.required,
      // 'required.country': validationMessages.country.required,

      'required.summary': validationMessages.summary.required,
      'required.title': validationMessages.title.required
    };

    this.validatorTypes = strategy.createSchema(elementObject, messageObject);
  }

  closeSummaryModal = () => {
    this.setState({ summaryModal: false });
    this.props.closeSummaryComponent();
  };

  componentWillReceiveProps(res) {}

  componentDidMount() {
    if (this.props.user) {
      this.setProfileData();
    }
  }

  setProfileData = () => {
    let DOB = moment(this.props.user.dob);
    let birthDay = '';
    let birthMonth = '';
    let birthYear = '';
    let editParentEmails = [];

    if (DOB) {
      birthDay = DOB.format('D');
      birthMonth = DOB.format('MM');
      birthYear = DOB.format('YYYY');
    }

    if (this.props.user.parents.length > 0) {
      this.props.user.parents.map((parents, index) => {
        editParentEmails.push({
          email: parents.email,
          readOnly: true,
          userId: parents.userId
        });
      });
      this.setState({ parentEmails: editParentEmails });
    }

    if (this.props.user.address) {
      this.setState({
        streetAddress1: this.props.user.address.street1 || '',
        streetAddress2: this.props.user.address.street2 || '',
        city: this.props.user.address.city || '',
        state: this.props.user.address.state || '',
        country: this.props.user.address.country || '',
        zipcode: this.props.user.address.zipcode || ''
      });
    }

    this.setState({
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      userId: this.props.user.userId,
      roleId: this.props.user.roleId,
      gender: this.props.user.gender
        ? this.props.user.gender
        : this.state.gender,
      genderAtBirth: this.props.user.genderAtBirth
        ? this.props.user.genderAtBirth
        : this.state.genderAtBirth,
      ccToParents: this.props.user.ccToParents,
      requireParentApproval: this.props.user.requireParentApproval,
      usCitizenOrPR: this.props.user.usCitizenOrPR === false ? 'no' : 'yes',
      summary: this.props.user.summary,
      day: birthDay,
      month: birthMonth - 1,
      year: birthYear,
      mobileNumber:
        this.props.user.mobileNo === 0 ? '' : this.props.user.mobileNo,
      tagline: this.props.user.tagline,
      title: this.props.user.title
    });
  };

  getStudentPersonalInfo(userId) {
    this.props.actionGetStudentPersonalInfo(userId);
  }

  handleChange = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  handleMobileChange = event => {
    if (event.target.value.match('^[+0-9 ]*$') != null) {
      this.setState({ mobileNumber: event.target.value });
    }
  };

  handleSelect = streetAddress1 => {
    this.setState({ streetAddress1 });
    var componentForm = {
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name'
    };

    var self = this;

    geocodeByAddress(streetAddress1)
      .then(function(results) {
        console.log(results);

        for (var i = 0; i < results[0].address_components.length; i++) {
          var addressType = results[0].address_components[i].types[0];
          if (componentForm[addressType]) {
            var val =
              results[0].address_components[i][componentForm[addressType]];
            if (addressType === 'street_number') {
              self.setState({ streetAddress1: val });
            }
            if (addressType === 'route') {
              self.setState({ streetAddress2: val });
            }
            if (addressType === 'locality') {
              self.setState({ city: val });
            }
            if (addressType === 'administrative_area_level_1') {
              self.setState({ state: val });
            }
            if (addressType === 'country') {
              self.setState({ country: val });
            }
            if (addressType === 'postal_code') {
              self.setState({ zipcode: val });
            }
          }
        }
      })
      .catch(error => console.error(error));
  };

  addMoreParentEmail = () => {
    if (
      this.state.parentEmails[this.state.parentEmails.length - 1]['email'] ===
      ''
    )
      return false;

    const parentEmails = this.state.parentEmails.concat({
      email: '',
      readOnly: false,
      userId: ''
    });
    this.setState({ parentEmails });
  };

  existMail = (index, event) => {
    let newParentEmails = this.state.parentEmails;
    let _this = this;

    if (event.target.value === '') return false;

    var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (!filter.test(event.target.value)) {
      newParentEmails[index]['email'] = '';
      _this.setState({ newParentEmails: newParentEmails });
      showErrorToast('Invalid Email.');
    }

    newParentEmails.forEach(function(data, i) {
      if (data.email === event.target.value && i !== index) {
        showErrorToast('Email already exist.');
        newParentEmails[index]['email'] = '';
        _this.setState({ newParentEmails: newParentEmails });
        return false;
      }
      if (data.email === event.target.value && i !== index) {
        showErrorToast('Email already in use.');
        newParentEmails[index]['email'] = '';
        _this.setState({ newParentEmails: newParentEmails });
        return false;
      }
    });
  };

  handleParentEmailChange = index => event => {
    const newParentEmails = this.state.parentEmails.map((parentEmail, sidx) => {
      if (index !== sidx) return parentEmail;
      return { ...parentEmail, email: event.target.value.toLowerCase() };
    });
    this.setState({ parentEmails: newParentEmails });
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
        self.handleSubmit();
      }
    });
  };

  handleSubmit() {
    let day = this.state.day !== '' ? this.state.day : '';
    let month = this.state.month !== '' ? Number(this.state.month) + 1 : '';
    let year = this.state.year !== '' ? this.state.year : '';
    let dob = '';
    if (day && month && year) {
      dob = moment(year + '-' + month + '-' + day);
      dob = moment(dob).valueOf();
    }
    let currentDate = moment().valueOf();
    if (dob <= currentDate) {
      this.setState({ isLoading: true });
      let finalParentArray = [];
      let finalEmails = this.state.parentEmails;

      if (finalEmails.length > 0) {
        finalEmails.forEach(function(task) {
          if (task.email !== '') {
            finalParentArray.push({
              email: task.email ? task.email.toLowerCase() : '',
              userId: task.userId
            });
          }
        });
      }

      let userId = this.state.userId;
      let firstName = this.state.firstName.trim();
      let lastName = this.state.lastName.trim();
      let gender = this.state.gender;
      let genderAtBirth = this.state.genderAtBirth;
      let address = {
        street1: this.state.streetAddress1,
        street2: this.state.streetAddress2,
        city: this.state.city,
        state: this.state.state,
        country: this.state.country,
        zip: this.state.zipcode
      };
      let mobileNo = this.state.mobileNumber;
      let summary = this.state.summary;
      let requireParentApproval = this.state.requireParentApproval;
      let ccToParents = this.state.ccToParents;
      let usCitizenOrPR = this.state.usCitizenOrPR === 'yes' ? true : false;
      let parents = finalParentArray;

      let title = this.state.title;
      let tagline = this.state.tagline;
      let roleId = this.state.roleId;

      let data = {
        userId,
        roleId,
        firstName,
        lastName,
        gender,
        genderAtBirth,
        dob,
        usCitizenOrPR,
        parents,
        address,
        requireParentApproval,
        ccToParents,
        summary,
        tagline,
        mobileNo,
        title
      };

      let self = this;

      spikeViewApiService('updateStudentPersonalInfo', data)
        .then(response => {
          if (response && response.data.status === 'Success') {
            self.setState({ isLoading: false });
            self.props.closeSummaryComponent();
            self.props.getProfileData();
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log('err', error);
        });
    } else {
      showErrorToast('Please enter valid date of birth');
    }
  }

  render() {
    const { isLoading } = this.state;
    const inputProps = {
      value: this.state.streetAddress1,
      onChange: this.onChange,
      placeholder: 'Street Address1',
      type: 'text'
    };

    const cssClasses = {
      root: 'input-group mb-1',
      input: 'form-control'
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
      <Modal
        bsSize="large"
        show={this.state.summaryModal}
        onHide={this.closeSummaryModal}
        backdrop="static"
        keyboard={false}
      >
        {/* <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        /> */}
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">
            PERSONAL INFO
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal className="lightBgForm">
            <Col sm={10}>
              <FormGroup
                controlId="formHorizontalEmail"
                className={this.getClasses('firsttName')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  First Name
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={this.state.firstName}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="35"
                  />
                  {renderMessage(this.props.getValidationMessages('firstName'))}
                </Col>
              </FormGroup>
              <FormGroup
                controlId="formHorizontalPassword"
                className={this.getClasses('lastName')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  Last Name
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={this.state.lastName}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="35"
                  />
                  {renderMessage(this.props.getValidationMessages('lastName'))}
                </Col>
              </FormGroup>

              <FormGroup
                controlId="formHorizontalEmail"
                className={this.getClasses('title')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  Title
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="Title"
                    name="title"
                    value={this.state.title}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="50"
                  />
                  {renderMessage(this.props.getValidationMessages('title'))}
                </Col>
              </FormGroup>

              <FormGroup
                controlId="formHorizontalPassword"
                className={this.getClasses('year')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  Date Of Birth
                </Col>
                <Col sm={9}>
                  <Row>
                    <Col sm={4}>
                      <div className="custom-select">
                        <span className="icon-down_arrow selectIcon" />
                        <YearPicker
                          id="year"
                          name="year"
                          classes="form-control"
                          defaultValue="Year"
                          end={moment().year()}
                          reverse
                          value={this.state.year}
                          onChange={year => {
                            this.setState({ year });
                            console.log(year);
                          }}
                        />
                      </div>
                      {renderMessage(this.props.getValidationMessages('year'))}
                    </Col>

                    <Col sm={4}>
                      <div className="custom-select">
                        <span className="icon-down_arrow selectIcon" />
                        <MonthPicker
                          id="month"
                          name="month"
                          classes="form-control"
                          defaultValue={'Month'}
                          short
                          endYearGiven
                          year={this.state.year}
                          value={this.state.month}
                          onChange={month => {
                            this.setState({ month });
                            console.log(month);
                          }}
                        />
                      </div>
                      {renderMessage(this.props.getValidationMessages('month'))}
                    </Col>

                    <Col sm={4}>
                      <div className="custom-select">
                        <span className="icon-down_arrow selectIcon" />
                        <DayPicker
                          defaultValue="Day"
                          id="day"
                          name="day"
                          classes="form-control"
                          year={this.state.year}
                          month={this.state.month}
                          endYearGiven
                          value={this.state.day}
                          onChange={day => {
                            this.setState({ day });
                            console.log(day);
                          }}
                        />
                      </div>
                      {renderMessage(this.props.getValidationMessages('day'))}
                    </Col>
                  </Row>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Mobile Number
                </Col>
                <Col sm={9}>
                  <div className="flex nowrap">
                    <FormControl
                      type="text"
                      placeholder=" Mobile Number"
                      name="mobileNumber"
                      value={this.state.mobileNumber}
                      onChange={this.handleMobileChange}
                      autoComplete="off"
                      maxLength="15"
                    />
                  </div>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Address
                </Col>
                <Col sm={9}>
                  <div className="flex">
                    <PlacesAutocomplete
                      inputProps={inputProps}
                      onSelect={this.handleSelect}
                      classNames={cssClasses}
                      styles={defaultStyles}
                    />
                  </div>

                  <InputGroup className="mb-1">
                    <FormControl
                      type="text"
                      placeholder="Street Address2"
                      name="streetAddress2"
                      value={this.state.streetAddress2}
                      onChange={this.handleChange}
                      autoComplete="off"
                    />
                  </InputGroup>

                  <Row>
                    <Col sm={6}>
                      <FormControl
                        className="mb-1"
                        type="text"
                        placeholder="City"
                        name="city"
                        value={this.state.city}
                        onChange={this.handleChange}
                        autoComplete="off"
                      />
                    </Col>
                    <Col sm={6}>
                      <FormControl
                        className="mb-1"
                        type="text"
                        placeholder="State"
                        name="state"
                        value={this.state.state}
                        onChange={this.handleChange}
                        autoComplete="off"
                      />
                    </Col>
                    <Col sm={6}>
                      <FormControl
                        className="mb-1"
                        type="text"
                        placeholder="Zipcode"
                        name="zipcode"
                        value={this.state.zipcode}
                        onChange={this.handleChange}
                        autoComplete="off"
                      />
                    </Col>
                    <Col sm={6}>
                      <FormControl
                        className="mb-1"
                        type="text"
                        placeholder="Country"
                        name="country"
                        value={this.state.country}
                        onChange={this.handleChange}
                        autoComplete="off"
                      />
                    </Col>
                  </Row>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  With what gender do you most closely identified
                </Col>
                <Col sm={9}>
                  <div className="flex">
                    <Radio
                      name="gender"
                      className="custom-radio"
                      value="Female"
                      checked={this.state.gender === 'Female' ? true : false}
                      onChange={this.handleChange}
                    >
                      <span className="icon-female block-icon">
                        <span className="path1" />
                        <span className="path2" />
                      </span>
                      Female
                    </Radio>
                    <Radio
                      name="gender"
                      className="custom-radio"
                      value="Male"
                      checked={this.state.gender === 'Male' ? true : false}
                      onChange={this.handleChange}
                    >
                      <span className="icon-male block-icon">
                        <span className="path1" />
                        <span className="path2" />
                      </span>
                      Male
                    </Radio>
                    <Radio
                      name="gender"
                      className="custom-radio"
                      value="Non-Binary"
                      checked={
                        this.state.gender === 'Non-Binary' ? true : false
                      }
                      onChange={this.handleChange}
                    >
                      <span className="icon-non-binary  block-icon">
                        <span className="path1" />
                        <span className="path2" />
                        <span className="path3" />
                        <span className="path4" />
                      </span>
                      Non-Binary
                    </Radio>
                    <Radio
                      name="gender"
                      className="custom-radio"
                      value="NA"
                      checked={this.state.gender === 'NA' ? true : false}
                      onChange={this.handleChange}
                    >
                      <span className="icon-NA block-icon" />
                      NA
                    </Radio>
                  </div>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  What gender were you assigned at birth
                </Col>
                <Col sm={9}>
                  <div className="flex">
                    <Radio
                      name="genderAtBirth"
                      className="custom-radio"
                      value="Female"
                      checked={
                        this.state.genderAtBirth === 'Female' ? true : false
                      }
                      onChange={this.handleChange}
                    >
                      <span className="icon-female block-icon">
                        <span className="path1" />
                        <span className="path2" />
                      </span>
                      Female
                    </Radio>
                    <Radio
                      name="genderAtBirth"
                      className="custom-radio"
                      value="Male"
                      checked={
                        this.state.genderAtBirth === 'Male' ? true : false
                      }
                      onChange={this.handleChange}
                    >
                      <span className="icon-male block-icon">
                        <span className="path1" />
                        <span className="path2" />
                      </span>
                      Male
                    </Radio>
                    <Radio
                      name="genderAtBirth"
                      className="custom-radio"
                      value="Non-Binary"
                      checked={
                        this.state.genderAtBirth === 'Non-Binary' ? true : false
                      }
                      onChange={this.handleChange}
                    >
                      <span className="icon-non-binary  block-icon">
                        <span className="path1" />
                        <span className="path2" />
                        <span className="path3" />
                        <span className="path4" />
                      </span>
                      Non-Binary
                    </Radio>
                  </div>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Are you US citizen or permanent resident?
                </Col>
                <Col sm={9}>
                  <div className="flex">
                    <Radio
                      name="usCitizenOrPR"
                      className="radio-primary"
                      value="yes"
                      checked={
                        this.state.usCitizenOrPR === 'yes' ? true : false
                      }
                      onChange={this.handleChange}
                    >
                      Yes
                      <div className="check" />
                    </Radio>{' '}
                    <Radio
                      name="usCitizenOrPR"
                      className="radio-primary"
                      value="no"
                      checked={this.state.usCitizenOrPR === 'no' ? true : false}
                      onChange={this.handleChange}
                    >
                      No
                      <div className="check" />
                    </Radio>{' '}
                  </div>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Parent Email (Optional)
                </Col>
                <Col sm={9}>
                  <a
                    className="mute pull-right absolute-link"
                    onClick={this.addMoreParentEmail}
                    style={{ cursor: 'pointer' }}
                  >
                    <small>Add More Email</small>
                  </a>

                  {this.state.parentEmails.map((parentEmail, index) => (
                    <div className="" key={index}>
                      <FormControl
                        readOnly={parentEmail.readOnly}
                        className="mb-1"
                        type="text"
                        placeholder="parent@yourmail.com"
                        key={index}
                        name={`parentEmail_${index}`}
                        value={parentEmail.email ? parentEmail.email : ''}
                        onBlur={
                          parentEmail.readOnly
                            ? null
                            : this.existMail.bind(this, index)
                        }
                        onChange={this.handleParentEmailChange(index)}
                      />
                    </div>
                  ))}
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Tagline
                </Col>
                <Col sm={9}>
                  <FormControl
                    className="mb-1"
                    type="text"
                    placeholder="tagline"
                    name="tagline"
                    value={this.state.tagline}
                    onChange={this.handleChange}
                    maxLength="50"
                  />
                </Col>
              </FormGroup>
              <FormGroup>
                <Col smOffset={3} sm={9}>
                  <Checkbox
                    className="checkbox-primary"
                    name="ccToParents"
                    onChange={this.handleChange}
                    checked={this.state.ccToParents}
                  >
                    CC required for parents
                    <span className="check" />
                  </Checkbox>
                  <Checkbox
                    className="checkbox-primary"
                    name="requireParentApproval"
                    onChange={this.handleChange}
                    checked={this.state.requireParentApproval}
                  >
                    Require parent approval
                    <span className="check" />
                  </Checkbox>
                </Col>
              </FormGroup>

              <FormGroup controlId="formControlsTextarea">
                <Col sm={3}>
                  <ControlLabel>Summary</ControlLabel>
                </Col>

                <Col sm={9} className={this.getClasses('summary')}>
                  <FormControl
                    componentClass="textarea"
                    placeholder="summary"
                    name="summary"
                    type="text"
                    value={this.state.summary}
                    onChange={this.handleChange}
                    maxLength="1000"
                  />
                  {renderMessage(this.props.getValidationMessages('summary'))}
                </Col>
              </FormGroup>
            </Col>
            <div className="flex align-center justify-content-between fullWidth" />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="primary"
            className="no-bold no-round"
            disabled={isLoading}
            onClick={!isLoading ? this.validateData : null}
          >
            {isLoading ? 'In Progress...' : 'Save'}
          </Button>
          <Button
            bsStyle="default"
            onClick={this.closeSummaryModal}
            className="no-bold no-round"
          >
            Close
          </Button>
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ actionGetStudentPersonalInfo }, dispatch);
};

addSummary = validation(strategy)(addSummary);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(addSummary);
