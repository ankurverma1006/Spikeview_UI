import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import spikeViewApiService from '../../common/core/api/apiService';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionGetStudentList } from '../../common/core/redux/actions';
import { actionSetStudentAsUser } from '../../common/core/redux/actions';
import Header from '../header/header';
import {
  Button,
  FormGroup,
  FormControl,
  ControlLabel,
  Form,
  Col,
  InputGroup,
  Row
} from 'react-bootstrap';
import {
  ZoomInAndOut,
  renderMessage,
  setLocalStorage,
  showSuccessToast,
  showErrorToast
} from '../../common/commonFunctions';
import PlacesAutocomplete, {
  geocodeByAddress
} from 'react-places-autocomplete';
import CONSTANTS from '../../common/core/config/appConfig';

let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class editProfile extends Component {
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
    this.navigationClose = this.navigationClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.handleSelect = this.handleSelect.bind(this);

    this.onChange = streetAddress1 => this.setState({ streetAddress1 });

    this.validatorTypes = strategy.createSchema(
      {
        firstName: ['required', 'regex:' + regExpressions.alphaOnly],
        lastName: ['required', 'regex:' + regExpressions.alphaOnly]
      },
      {
        'required.firstName': validationMessages.firstName.required,
        'regex.firstName': validationMessages.firstName.alphaOnly,
        'required.lastName': validationMessages.lastName.required,
        'regex.lastName': validationMessages.lastName.alphaOnly
      }
    );
  }

  componentWillMount() {
    document.body.classList.remove('light-theme');
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {
    if (this.props.parent) {
      this.props.parent['token'] = this.props.user['token'];
    }
    if (this.props.user) {
      let user = this.props.parent ? this.props.parent : this.props.user;
      this.setState({
        user: user,
        firstName: user.firstName,
        lastName: user.lastName
      });
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

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
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

  navigationClose() {
    this.props.history.push('/parent/dashboard');
  }

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

  checkStudentName = (index, event) => {
    let studentMailList = this.state.studentMailList;
    let self = this;
    if (event.target.value === '') return false;

    var filter = /^[A-Za-z\s]+$/;
    if (!filter.test(event.target.value)) {
      studentMailList[index]['firstName'] = '';
      this.setState({ studentMailList: studentMailList });
      showErrorToast('Invalid Student Name.');
    }
  };

  existMail = (index, event) => {
    let students = this.state.user.students;
    let studentMailList = this.state.studentMailList;
    let self = this;
    console.log('existMail Function----------------');

    if (event.target.value === '') return false;

    var filter = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (!filter.test(event.target.value)) {
      studentMailList[index]['email'] = '';
      self.setState({ studentMailList: studentMailList });
      showErrorToast('Invalid Email.');
    }

    students.forEach(function(data) {
      if (data.email === event.target.value) {
        showErrorToast('Email already exist.');
        studentMailList[index]['email'] = '';
        self.setState({ studentMailList: studentMailList });
        return false;
      }
    });

    studentMailList.forEach(function(data, i) {
      if (data.email === event.target.value && i !== index) {
        showErrorToast('Email already in use.');
        studentMailList[index]['email'] = '';
        self.setState({ studentMailList: studentMailList });
        return false;
      }
    });
  };

  handleSubmit() {
    let self = this;
    let userId = this.state.user.userId;
    let roleId = this.state.user.roleId;
    let firstName = this.state.firstName;
    let lastName = this.state.lastName;
    let isActive = this.state.user.isActive;
    //    let students = this.state.studentMailList;

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
      roleId,
      isActive,
      address
    };

    spikeViewApiService('updateParentUserProfile', data)
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
              //   user['students'] = studentListResponse;
              setLocalStorage('parentInfo', user);
              setLocalStorage('userInfo', user);
              let parentStudentData = {
                parent: user,
                studentData: user
              };
              //     self.props.actionSetStudentAsUser(parentStudentData);
              if (studentListResponse && studentListResponse.length > 0) {
                console.log(studentListResponse);
                if (response1.data.status === 'Error') {
                  // setTimeout(() => {
                  // //  self.props.history.push('/parent/dashboard');
                  // }, 4000);
                } else {
                  showSuccessToast(response1.data.message);
                  setTimeout(() => {
                    self.props.history.push('/parent/dashboard');
                  }, 4000);
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
      <div className="flex flex-dir-column fullHeight">
        <Header {...this.props} />
        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        />
        <div className="innerWrapper mt-50  flex-1 centeredBox">
          <div className="container">
            <div className="floating-label--wrapper">
              <Form horizontal className="editProfileForm">
                <div className="flex justify-content-between row editProfileForm--inner">
                  <div className="flex-item--half col-sm-6">
                    <p className="headingEProfile text-center">Edit Profile</p>
                    <FormGroup controlId="formHorizontalEmail">
                      <FormControl
                        type="text"
                        name="firstName"
                        placeholder=" First Name"
                        value={this.state.firstName}
                        onChange={this.handleChange}
                        autoComplete="off"
                        maxLength="35"
                      />
                      <Col componentClass={ControlLabel}>First Name</Col>
                      {renderMessage(
                        this.props.getValidationMessages('firstName')
                      )}
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                      <FormControl
                        type="text"
                        name="lastName"
                        placeholder=" Last Name"
                        value={this.state.lastName}
                        onChange={this.handleChange}
                        autoComplete="off"
                        maxLength="35"
                      />
                      <Col componentClass={ControlLabel}>Last Name</Col>
                      {renderMessage(
                        this.props.getValidationMessages('lastName')
                      )}
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                      <FormControl
                        type="email"
                        name="parentEmail"
                        placeholder="Email"
                        disabled
                        value={this.state.user && this.state.user.email}
                        onChange={this.handleChange}
                      />
                      <Col componentClass={ControlLabel}>Email</Col>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                      <InputGroup className="fullWidth">
                        <InputGroup.Addon>
                          <span className="icon-location" />
                        </InputGroup.Addon>
                        <PlacesAutocomplete
                          inputProps={inputProps}
                          onSelect={this.handleSelect}
                          classNames={cssClasses}
                          styles={defaultStyles}
                        />
                        <Col componentClass={ControlLabel}>Address</Col>
                      </InputGroup>
                    </FormGroup>

                    <FormGroup controlId="formHorizontalPassword">
                      <InputGroup className="fullWidth">
                        <InputGroup.Addon>
                          <span className="icon-location" />
                        </InputGroup.Addon>
                        <FormControl
                          type="text"
                          placeholder="Street Address2"
                          name="streetAddress2"
                          value={this.state.streetAddress2}
                          onChange={this.handleChange}
                          autoComplete="off"
                        />
                        <Col componentClass={ControlLabel}>Address</Col>
                      </InputGroup>
                    </FormGroup>
                    <Row>
                      <Col sm={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            placeholder="City"
                            name="city"
                            value={this.state.city}
                            onChange={this.handleChange}
                            autoComplete="off"
                          />
                          <Col componentClass={ControlLabel}>City</Col>
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            placeholder="State"
                            name="state"
                            value={this.state.state}
                            onChange={this.handleChange}
                            autoComplete="off"
                          />
                          <Col componentClass={ControlLabel}>State</Col>
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            placeholder="Zipcode"
                            name="zipcode"
                            value={this.state.zipcode}
                            onChange={this.handleChange}
                            autoComplete="off"
                          />
                          <Col componentClass={ControlLabel}>Zip</Col>
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            placeholder="Country"
                            name="country"
                            value={this.state.country}
                            onChange={this.handleChange}
                            autoComplete="off"
                          />
                          <Col componentClass={ControlLabel}>Country</Col>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                  {/* <div className="flex-item--half seperator col-sm-6">
                    <p className="headingEProfile text-center">
                      Add New Student
                    </p>
                    {this.state.studentMailList.map(function(data, index) {
                      return (
                        <div className="borderedBox">
                          <FormGroup controlId="formHorizontalPassword">
                            <FormControl
                              type="text"
                              name="firstName"
                              placeholder="Student Name"
                              value={data.firstName}
                              onBlur={self.checkStudentName.bind(self, index)}
                              onChange={self.handleChangeStudentMail.bind(
                                self,
                                index
                              )}
                              autoComplete="off"
                              maxLength="35"
                            />
                            <Col componentClass={ControlLabel}>Name</Col>
                          </FormGroup>
                          <FormGroup>
                            <FormControl
                              type="email"
                              name="email"
                              placeholder="Student Email "
                              value={data.email}
                              onBlur={self.existMail.bind(self, index)}
                              onChange={self.handleChangeStudentMail.bind(
                                self,
                                index
                              )}
                              autoComplete="off"
                            />
                            <Col componentClass={ControlLabel}>Email</Col>
                          </FormGroup>
                        </div>
                      );
                    })}
                    <a className="mute pull-right">
                      <small onClick={self.handleAddMail}>
                        Add More Student
                      </small>
                    </a>
                  </div> */}
                </div>
                <div className="editBtnWrap text-center">
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
                    onClick={this.navigationClose}
                  >
                    Close
                  </Button>
                </div>
              </Form>
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { actionGetStudentList, actionSetStudentAsUser },
    dispatch
  );
};

editProfile = validation(strategy)(editProfile);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(editProfile);
