import React, { Component } from 'react';
import {
  Form,
  Row,
  Col,
  ControlLabel,
  FormGroup,
  FormControl,
  InputGroup,
  Radio,
  Button,
  Checkbox
} from 'react-bootstrap';
import { YearPicker, MonthPicker, DayPicker } from 'react-dropdown-date';
import moment from 'moment';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PlacesAutocomplete, {
  geocodeByAddress
} from 'react-places-autocomplete';

import Header from '../header/header';
import { actionGetStudentPersonalInfo } from '../../common/core/redux/actions';
import { renderMessage, showErrorToast } from '../../common/commonFunctions';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class personalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
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
      parentEmails: [
        {
          email: '',
          firstName: '',
          lastName: '',
          readOnly: false,
          userId: ''
        }
      ],
      roleId: '',
      title: '',
      deleteIcon: false,
      DOBYear: '',
      DOBMonth: '',
      DOBDay: ''
    };

    this.onChange = streetAddress1 => this.setState({ streetAddress1 });
    this.handleSelect = this.handleSelect.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.setValidatorTypes = this.setValidatorTypes.bind(this);
  }

  async componentWillMount() {
    document.body.classList.remove('home');
    document.body.classList.remove('fixedHeader');
    document.body.classList.remove('absoluteHeader');
    this.getStudentPersonalInfo(this.props.user.userId);
    this.setValidatorTypes();
  }

  setValidatorTypes(type) {
    let elementObject = {
      firstName: ['required', 'regex:' + regExpressions.alphaOnly],
      lastName: ['required', 'regex:' + regExpressions.alphaOnly],
      year: 'required',
      month: 'required',
      day: 'required'
    };

    let messageObject = {
      'required.firstName': validationMessages.firstName.required,
      'regex.firstName': validationMessages.firstName.alphaOnly,
      'required.lastName': validationMessages.lastName.required,
      'regex.lastName': validationMessages.lastName.alphaOnly,
      'required.year': validationMessages.year.required,
      'required.day': validationMessages.day.required,
      'required.month': validationMessages.month.required
    };
    this.validatorTypes = strategy.createSchema(elementObject, messageObject);
  }

  componentDidMount() {
    if (this.props.user) {
      this.setProfileData();
    }
  }

  setProfileData = () => {
    let editParentEmails = [];

    if (this.props.user && this.props.user.dob !== 0) {
      let birthDay = '';
      let birthMonth = '';
      let birthYear = '';
      let DOB = new Date(this.props.user.dob);

      birthDay = DOB.getDate();
      birthMonth = DOB.getMonth();
      birthYear = DOB.getFullYear();

      console.log('Day', birthDay);
      console.log('Month', birthMonth);
      console.log('Year', birthYear);

      this.setState({
        day: birthDay,
        month: birthMonth,
        year: birthYear,
        DOBDay: birthDay,
        DOBMonth: birthMonth,
        DOBYear: birthYear
      });
    } else {
      console.log('No DOB');
    }

    if (this.props.user.parents.length > 0) {
      this.props.user.parents.map((parents, index) => {
        console.log('parents', parents);
        editParentEmails.push({
          email: parents.email,
          firstName: parents.firstName,
          lastName: parents.lastName,
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
    this.setState({
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: '',
      country: '',
      zipcode: ''
    });

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
  
  if(this.state.parentEmails.length > 0){
    if (
      this.state.parentEmails[this.state.parentEmails.length - 1]['email'] ===
      ''
    )
      return false;
    if (
      this.state.parentEmails[this.state.parentEmails.length - 1][
        'firstName'
      ] === ''
    )
      return false;
    if (
        this.state.parentEmails[this.state.parentEmails.length - 1][
          'lastName'
        ] === ''
      )
    return false;
    }

    let index= this.state.parentEmails.length;
    let _this= this;
    _this.validatorTypes = strategy.createInactiveSchema({
      ['parentEmail_'+index]: 'checkEmail',
    }, { 
                              
      }, function(validator) {
      validator.constructor.registerAsync('checkEmail', function(username, attribute, req, passes) {
         
        let newParentEmails = _this.state.parentEmails,passFlag=false;      
    
        newParentEmails.forEach(function(data, i) {
          if (data.email === username && i !== index) {                             
            newParentEmails[index]['email'] = '';                             
            _this.setState({ newParentEmails: newParentEmails });                             
            passFlag=true;   
            passes(false, 'Email already exist.');
            return false;
          }

          if (data.email === username && i !== index) {                            
            newParentEmails[index]['email'] = '';                              
            _this.setState({ newParentEmails: newParentEmails });                           
            passFlag=true;   
            passes(false, 'Email already in use.');
            return false;
          }
        });        
        if(passFlag==false){
          passes();
        }        
      });
    }) 

    if (this.state.parentEmails.length >= 10) {
      showErrorToast('You can not add more than 10 parents');
    } else {
      const parentEmails = this.state.parentEmails.concat({
        email: '',
        firstName: '',
        lastNae:'',
        readOnly: false,
        userId: ''
      });
      this.setState({ parentEmails });
    }
  };

  deleteParent = idx => {
    this.setState({
      parentEmails: this.state.parentEmails.filter((s, sidx) => idx !== sidx)
    });    
    let _this= this;
    _this.validatorTypes = strategy.createInactiveSchema({
      ['parentEmail_'+idx]: 'checkEmail',
    }, {                      
      }, function(validator) {
      validator.constructor.registerAsync('checkEmail', function(username, attribute, req, passes) {
        passes();       
      })
    })
    this.props.validate(function(error) {
      if (!error) {
       }
    })   
  };

  existMail = (index, event) => {
    let newParentEmails = this.state.parentEmails;
    let _this = this;

    if (event.target.value === '') return false;

    _this.validatorTypes = strategy.createInactiveSchema({
      ['parentEmail_'+index]: 'checkEmail',
    }, {     
                      
      }, function(validator) {

      validator.constructor.registerAsync('checkEmail', function(username, attribute, req, passes) {
         
         let newParentEmails = _this.state.parentEmails,passFlag=false;           
      
        newParentEmails.forEach(function(data, i) {
          if (data.email === username && i !== index) {                             
            newParentEmails[index]['email'] = '';                             
            _this.setState({ newParentEmails: newParentEmails });                             
            passFlag=true;   
            passes(false, 'Email already exist.');
            return false;
          }

          if (data.email === username && i !== index) {                            
            newParentEmails[index]['email'] = '';                              
            _this.setState({ newParentEmails: newParentEmails });                           
            passFlag=true;   
            passes(false, 'Email already in use.');
            return false;
          }
        });        
       
        if(passFlag==false){
          passes();
        }        
      });
    })   
    this.props.validate(function(error) {
      if (!error) {
       }
    })
  };

  validationForName = (index, event) => {
    let newParentEmails = this.state.parentEmails;
    let _this = this;

    if (event.target.value === '') return false;

    var filter = /^[a-zA-Z\s]+$/;

    if (!filter.test(event.target.value)) {
      newParentEmails[index]['firstName'] = '';
      _this.setState({ newParentEmails: newParentEmails });
      showErrorToast('Invalid Parent First Name.');
    }
  };

  handleParentEmailChange = (index, keyName) => event => {
    const newParentEmails = this.state.parentEmails.map((parentEmail, sidx) => {
      if (keyName == 'parentEmail') {
        if (index !== sidx) return parentEmail;
        return { ...parentEmail, email: event.target.value.toLowerCase() };
      }
      if (keyName == 'firstName' || keyName == 'lastName') {
        if (index !== sidx) return parentEmail;
        return { ...parentEmail, [keyName]: event.target.value };
      }
    });
    this.setState({ parentEmails: newParentEmails, [event.target.name]: event.target.value });
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

    this.submitValidationName();

    let self = this;
    this.props.validate(function(error) {
      if (!error) {
        self.handleSubmit();
      } else {
      }
    });
  };

  submitValidationName() {
    this.validatorTypes.rules['firstName'] = [
      'required',
      'regex:' + regExpressions.alphaOnly
    ];
    this.validatorTypes.messages['required.firstName'] =
      validationMessages.firstName.required;

    this.validatorTypes.messages['regex.firstName'] =
      validationMessages.firstName.alphaOnly;

    this.validatorTypes.rules['lastName'] = [
        'required',
        'regex:' + regExpressions.alphaOnly
    ];

    this.validatorTypes.messages['required.lastName'] =
      validationMessages.lastName.required;

    this.validatorTypes.messages['regex.lastName'] =
      validationMessages.lastName.alphaOnly;

    this.validatorTypes.rules['year'] = 'required';

    this.validatorTypes.rules['day'] = 'required';

    this.validatorTypes.rules['month'] = 'required';

    let newParentEmails = this.state.parentEmails;
    let _this = this;   
    for(var i = 0; i < newParentEmails.length; i++) {         
       let a= newParentEmails[i].email ? newParentEmails[i].email.trim() : null,
           b=newParentEmails[i].firstName ?  newParentEmails[i].firstName.trim() : null,
           c=newParentEmails[i].lastName ? newParentEmails[i].lastName.trim() :null;     
       
      if(a && b && c) {     
        if(a){
          _this.validatorTypes.rules['parentEmail_'+i] = [                           
            'email'
          ];  
          _this.validatorTypes.messages['email.parentEmail_'+i] =
          'Invalid email';     
        }      
      }

      if((a && !b  && !c) || (!a && b  && !c) || (!a && !b  && c) ||
          (a && b  && !c) || (a && !b  && c) || (!a && b  && c)){      
            
        if(a){
          _this.validatorTypes.rules['parentEmail_'+i] = [                           
            'email'
          ];  
          _this.validatorTypes.messages['email.parentEmail_'+i] =
          'Invalid email';     
        }
        
        if(!a){
          _this.validatorTypes.rules['parentEmail_'+i] = [                           
            'required'
          ];           
          _this.validatorTypes.messages['required.parentEmail_'+i] =
          'email is required';    
        }

        if(b){
          this.validatorTypes.rules['firstName_'+i] = [            
            'regex:' + regExpressions.alphaOnly
          ];
        
          this.validatorTypes.messages['regex.firstName_'+i] =
          "Parent's first name could only consist alphabets";      
        }  
       
       if(!b){
        _this.validatorTypes.rules['firstName_'+i] = [                           
          'required'
        ];  
        _this.validatorTypes.messages['required.firstName_'+i] =
        "Please enter parent's first name";
        }  
        
        if(c){
          this.validatorTypes.rules['lastName_'+i] = [            
            'regex:' + regExpressions.alphaOnly
          ];
        
          this.validatorTypes.messages['regex.lastName_'+i] =
          "Parent's last name could only consist alphabets";      
        }  
     
        if(!c){     
          _this.validatorTypes.rules['lastName_'+i] = [                           
            'required'
          ];                       
          _this.validatorTypes.messages['required.lastName_'+i] =
          "Please enter parent's last name";
        }
      }
    }
  }

  getProfileData = () => {
    let userId = this.props.user.userId;
    this.props.actionGetStudentPersonalInfo(userId);
  };

  handleSubmit() {   
    let day = this.state.day !== '' ? this.state.day : '';
    let month = this.state.month !== '' ? this.state.month : '';
    let year = this.state.year !== '' ? this.state.year : '';
    let dob = '';

    if (day && month >= 0 && year) {
      dob = new Date(year, month, day);
      dob = dob.valueOf();
    }

    let currentDate = moment().valueOf();
    if (dob <= currentDate) {
      let finalParentArray = [];
      let finalEmails = this.state.parentEmails;   

      if (finalEmails.length > 0) {
        finalEmails.forEach(function(task) {
          if (task.email !== '') {
            finalParentArray.push({
              email: task.email ? task.email.toLowerCase() : '',
              firstName: task.firstName ? task.firstName.trim() : '',
              lastName: task.lastName ? task.lastName.trim() : '',
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
            self.getProfileData();
            setTimeout(function() {
              self.props.history.push('/student/profile');
            }, 3000);
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log('err', error);
        });
    } else {
      showErrorToast('Date of birth should be less than future date');
    }
  }

  render() {
    const { isLoading } = this.state;
    const inputProps = {
      value: this.state.streetAddress1,
      onChange: this.onChange,
      placeholder: 'Street Address1',
      type: 'text',
      autoComplete: 'off'
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
      <div className="flex fullHeight">
        <Header {...this.props} />
        <div className="innerWrapper flex-1">
          <div className="container">
            <Form horizontal>
              <div className="flex justify-content-between row">
                <div className="flex-item--half col-sm-9">
                  <p className="headingEProfile text-center hero-head margin-set">
                    Edit Personal Information
                  </p>

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
                      {renderMessage(
                        this.props.getValidationMessages('firstName')
                      )}
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
                      {renderMessage(
                        this.props.getValidationMessages('lastName')
                      )}
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

                  <FormGroup controlId="formHorizontalPassword">
                    <Col
                      componentClass={ControlLabel}
                      sm={3}
                      className={this.getClasses('year')}
                    >
                      Date Of Birth
                    </Col>
                    <Col sm={9}>
                      <Row>
                        <Col sm={4} className={this.getClasses('year')}>
                          <div className="custom-select">
                            <span className="icon-down_arrow selectIcon" />
                            <YearPicker
                              id="year"
                              name="year"
                              classes="form-control"
                              defaultValue="Year"
                              end={moment().year()}
                              reverse
                              disabled={
                                this.state.year && this.state.DOBYear
                                  ? true
                                  : false
                              }
                              value={this.state.year}
                              onChange={year => {
                                this.setState({ year });
                                console.log(year);
                              }}
                            />
                          </div>
                          {renderMessage(
                            this.props.getValidationMessages('year')
                          )}
                        </Col>

                        <Col sm={4} className={this.getClasses('month')}>
                          <div className="custom-select">
                            <span className="icon-down_arrow selectIcon" />
                            <MonthPicker
                              id="month"
                              name="month"
                              classes="form-control"
                              defaultValue={'Month'}
                              short
                              disabled={
                                this.state.month !== '' &&
                                this.state.DOBMonth !== ''
                                  ? true
                                  : false
                              }
                              endYearGiven
                              year={this.state.year}
                              value={this.state.month}
                              onChange={month => {
                                this.setState({ month });
                                console.log(month);
                              }}
                            />
                          </div>
                          {renderMessage(
                            this.props.getValidationMessages('month')
                          )}
                        </Col>

                        <Col sm={4} className={this.getClasses('day')}>
                          <div className="custom-select">
                            <span className="icon-down_arrow selectIcon" />
                            <DayPicker
                              defaultValue="Day"
                              id="day"
                              name="day"
                              disabled={
                                this.state.day && this.state.DOBDay
                                  ? true
                                  : false
                              }
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
                          {renderMessage(
                            this.props.getValidationMessages('day')
                          )}
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
                        {/* <InputGroup.Addon>
                      <span className="icon-location" />
                    </InputGroup.Addon> */}
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
                        {/* <InputGroup.Addon>
                      <span className="icon-location" />
                    </InputGroup.Addon> */}
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
                          checked={
                            this.state.gender === 'Female' ? true : false
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
                            this.state.genderAtBirth === 'Non-Binary'
                              ? true
                              : false
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
                          checked={
                            this.state.usCitizenOrPR === 'no' ? true : false
                          }
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
                        maxLength="100"
                      />
                    </Col>
                  </FormGroup>

                  <FormGroup controlId="formHorizontalPassword">
                    <Col componentClass={ControlLabel} sm={3}>
                      Parent Detail (Optional)
                    </Col>
                    <Col sm={9}>
                      {this.state.parentEmails.map((parentEmail, index) => {

                          this.validatorTypes.rules['firstName_'+index] = [                           
                            'regex:' + regExpressions.alphaOnly
                          ];                   
                          this.validatorTypes.messages['regex.firstName_'+index] =
                            "First name could only consist alphabets";           

                          this.validatorTypes.rules['lastName_'+index] = [                           
                            'regex:' + regExpressions.alphaOnly
                          ];                   
                          this.validatorTypes.messages['regex.lastName_'+index] =
                            "First name could only consist alphabets";      

                       return <div className="bi-col" key={index}>
                          <div className="flex-1 mr-20">
                            <FormControl
                              readOnly={parentEmail.readOnly}
                              className="mb-1"
                              type="text"
                              placeholder="First Name"
                              key={index}
                              name={`firstName_${index}`}
                              value={
                                parentEmail.firstName
                                  ? parentEmail.firstName
                                  : ''
                              }
                              // onBlur={
                              //   parentEmail.readOnly
                              //     ? null
                              //     : this.validationForName.bind(this, index)
                              // }
                              onChange={this.handleParentEmailChange(
                                index,
                                'firstName'
                              )}
                            />
                            {renderMessage(
                              this.props.getValidationMessages(`firstName_${index}`)
                            )}
                          </div>
                          <div className="flex-1 mr-20">
                            <FormControl
                              readOnly={parentEmail.readOnly}
                              className="mb-1"
                              type="text"
                              placeholder="Last Name"
                              key={index}
                              name={`lastName_${index}`}
                              value={
                                parentEmail.lastName
                                  ? parentEmail.lastName
                                  : ''
                              }
                              // onBlur={
                              //   parentEmail.readOnly
                              //     ? null
                              //     : this.validationForName.bind(this, index)
                              // }
                              onChange={this.handleParentEmailChange(
                                index,
                                'lastName'
                              )}
                            />
                            {renderMessage(
                              this.props.getValidationMessages(`lastName_${index}`)
                            )}
                          </div>
                          <div className="flex-1 mr-20">
                          <FormControl
                            readOnly={parentEmail.readOnly}
                            className="mb-1 flex-1"
                            type="text"
                            placeholder="Email"
                            key={index}
                            name={`parentEmail_${index}`}
                            value={parentEmail.email ? parentEmail.email : ''}
                            onBlur={
                              parentEmail.readOnly
                                ? null
                                : this.existMail.bind(this, index)
                            }
                            onChange={this.handleParentEmailChange(
                              index,
                              'parentEmail'
                            )}
                          />                          
                          <span
                            className="icon-delete ico-bg-del fm-del"
                            onClick={this.deleteParent.bind(this, index)}
                          />
                          {renderMessage(
                            this.props.getValidationMessages(`parentEmail_${index}`)
                          )}
                          </div>
                        </div>
                      })}

                      <Button
                        bsStyle="primary"
                        className="animated animated-top"
                        onClick={this.addMoreParentEmail.bind(this)}
                      >
                        <span className="icon-plus" /> Add More
                      </Button>
                    </Col>
                  </FormGroup>

                  {/* <FormGroup>
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
                  </FormGroup> */}

                  <div className="editBtnWrap text-center mb-1">
                    <Button
                      bsStyle="primary mr-1"
                      className="no-bold no-round"
                      disabled={isLoading}
                      onClick={!isLoading ? this.validateData : null}
                    >
                      {isLoading ? 'In Progress...' : 'Save'}
                    </Button>
                    <Button
                      bsStyle="default"
                      onClick={() =>
                        this.props.history.push('/student/profile')
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
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

personalInfo = validation(strategy)(personalInfo);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(personalInfo);
