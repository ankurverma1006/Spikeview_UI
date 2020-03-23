import React, { Component } from 'react';
import { ToastContainer } from 'react-toastify';
import {
  Button,
  Modal,
  Form,
  FormGroup,
  Col,
  Row,
  ControlLabel,
  FormControl
} from 'react-bootstrap';

//import 'react-datepicker/dist/react-datepicker.css';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';

import ImageCropper from '../../../common/cropper/imageCropper';
import CONSTANTS from '../../../common/core/config/appConfig';
import {
  renderMessage,
  ZoomInAndOut,
  generateTimestamp,
  getThumbImage,
  showErrorToast
} from '../../../common/commonFunctions';
import spikeViewApiService from '../../../common/core/api/apiService';
import { actionListOragnization } from '../../../common/core/redux/actions';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';

let AsyncTypeahead = asyncContainer(Typeahead);
let validationMessages = CONSTANTS.validationMessages;

class addEducation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      educationModal: true,
      organizationId: '',
      instituteName: '',
      city: '',
      description: '',
      userId: '',
      isActive: true,
      educationId: '',
      listOragnization: [],
      searchText: '',
      fromYear: '',
      toYear: '',
      fromGrade: '',
      toGrade: '',
      oragnizationPreview: '',
      oragnizationLogo: '',
      oragnizationFile: '',
      isToGrade: '',
      isToYear: '',
      imageSource: '',
      educationFromYear: '',
      educationToYear: '',
      disabled: true
    };

    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.uploadImageToAzure = this.uploadImageToAzure.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        instituteName: 'required',
        city: 'required',
        fromGrade: 'required',
        toGrade: 'required'
        // fromYear: 'required',
        // toYear: 'required'
      },
      {
        'required.instituteName': validationMessages.instituteName.required,
        'required.city': validationMessages.city.required,
        'required.fromGrade': validationMessages.fromGrade.required,
        'required.toGrade': validationMessages.toGrade.required
        //'required.fromYear': validationMessages.fromYear.required,
        // 'required.toYear': validationMessages.toYear.required
      }
    );
  }

  componentWillMount() {
    this.listOragnization();
    this.generateSASToken();
  }

  componentDidMount() {
    if (this.props.user) {
      this.setState({
        userId: this.props.user.userId,
        isActive: this.props.user.isActive
      });
    }

    if (this.props.educationDetail) {
      let data = this.props.educationDetail;
      let logo = data.logo !== '' ? getThumbImage('medium', data.logo) : '';
      this.setState({
        educationId: data.educationId,
        instituteName: data.institute,
        city: data.city,
        fromGrade: data.fromGrade,
        toGrade: data.toGrade,
        educationFromYear: data.fromYear,
        educationToYear: data.toYear,
        fromYear: data.fromYear,
        toYear: data.toYear,
        organizationId: data.organizationId,
        oragnizationPreview: logo,
        oragnizationLogo: data.logo,
        //grade: data.grade,
        //fieldOfStudy: data.fieldOfStudy,
        description: data.description
        //startDate: moment(data.fromDate),
        //endDate: moment(data.toDate)
      });
    }
  }

  closeEducationModal = () => {
    this.setState({
      educationModal: false
    });
    this.props.closeEducationComponent();
  };

  getValidatorData = () => {
    return this.state;
  };

  getClasses = field => {
    return classnames({
      error: !this.props.isValid(field)
    });
  };

  handleImageChange = event => {
    this.setState({ imageSource: '' });
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
    if (file) {
      this.generateSASToken();
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = event => {
        this.setState({
          // oragnizationFile: file,

          imageSource: event.target.result,
          imageName: fileName,
          imageType: fileType,
          action: 1
        });
      };
    }
  };

  generateSASToken() {
    spikeViewApiService('getSASToken')
      .then(response => {
        if (response.data.status === 'Success') {
          let sasToken = response.data.result.sasToken;
          this.setState({ sasToken });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleCompare = (fromValue, toValue, key) => {
    if (fromValue !== '' && toValue !== '') {
      let fromValueNum = parseInt(fromValue, 10);
      let toValueNum = parseInt(toValue, 10);

      if (key === 1) {
        if (fromValueNum > toValueNum) {
          showErrorToast('The ToGrade must be greater than FromGrade');
          this.setState({
            toGrade: fromValue
          });
          //   this.validatorTypes.rules['isToGrade'] = 'required';
          //   this.validatorTypes.messages['required.isToGrade'] =
          //     'The ToGrade must be greater than FromGrade';
          // } else {
          //   this.validatorTypes.rules['isToGrade'] = '';
          //   this.validatorTypes.messages['required.isToGrade'] = '';
        }
      } else if (key === 2) {
        if (fromValueNum > toValueNum) {
          showErrorToast('The "to" date should be greater than "from');
          this.setState({
            toYear: fromValue
          });
          //   this.validatorTypes.rules['isToYear'] = 'required';
          //   this.validatorTypes.messages['required.isToYear'] =
          //     'The "to" date should be greater than "from"';
          // } else {
          //   this.validatorTypes.rules['isToYear'] = '';
          //   this.validatorTypes.messages['required.isToYear'] = '';
        }
      }
    }
  };

  handleToGrade = event => {
    if (this.state.fromGrade) {
      this.setState({
        [event.target.name]: event.target.value
      });
      this.handleCompare(this.state.fromGrade, event.target.value, 1);
    } else {
      showErrorToast('Please select grade (from)');
    }
  };

  handleFromGrade = event => {
    this.setState({
      [event.target.name]: event.target.value,
      toGrade: event.target.value
    });
    this.handleCompare(event.target.value, event.target.value, 1);
  };

  handleToYear = event => {
    if (this.state.fromYear) {
      let toYear = this.state.educationToYear;
      let DOB =
        this.props.user && this.props.user.dob
          ? moment(this.props.user.dob).format('YYYY')
          : '';

      if (
        toYear &&
        this.props.educationMode === 2 &&
        parseInt(DOB, 10) > parseInt(toYear, 10)
      ) {
        var x = document.getElementById('toYearSelect');
        var selectBoxLength = document.getElementById('toYearSelect').length;
        x.remove(selectBoxLength - 2);
      }
      this.setState({ [event.target.name]: event.target.value });
      this.handleCompare(this.state.fromYear, event.target.value, 2);
    } else {
      showErrorToast('Please select year (from)');
    }
  };

  handleFromYear = event => {
    if (this.state.toGrade) {
      var fromYear = this.state.educationFromYear;
      let DOB =
        this.props.user && this.props.user.dob
          ? moment(this.props.user.dob).format('YYYY')
          : '';
      if (
        fromYear &&
        this.props.educationMode === 2 &&
        parseInt(DOB, 10) > parseInt(fromYear, 10)
      ) {
        var x = document.getElementById('fromYearSelect');
        var selectBoxLength = document.getElementById('fromYearSelect').length;
        x.remove(selectBoxLength - 2);
      }

      if (this.state.fromGrade && this.state.toGrade) {
        let fromGrade = parseInt(this.state.fromGrade, 10);
        let toGrade = parseInt(this.state.toGrade, 10);
        let toYear = toGrade - fromGrade;
        toYear = toYear + 1;
        let yearDiff = parseInt(event.target.value, 10) + toYear;

        if (fromGrade === toGrade) {
          this.setState({
            [event.target.name]: event.target.value,
            toYear: event.target.value
          });
          this.handleCompare(event.target.value, event.target.value, 2);
        } else {
          this.setState({
            [event.target.name]: event.target.value,
            toYear: yearDiff
          });
          this.handleCompare(event.target.value, yearDiff, 2);
        }
      }
    } else {
      showErrorToast('Please select grade (to)');
    }
  };

  handleChangeStart = startDate => {
    this.handleDateChange({ startDate });
  };

  handleChangeEnd = endDate => {
    this.handleDateChange({ endDate });
  };

  handleDateChange = ({ startDate, endDate }) => {
    startDate = startDate || this.state.startDate;
    endDate = endDate || this.state.endDate;
    if (startDate.isAfter(endDate)) {
      endDate = startDate;
    }
    this.setState({ startDate, endDate });
  };

  validateData = () => {
    let self = this;

    this.props.validate(function(error) {
      if (!error) {
        // let toGrade = parseInt(self.state.toGrade, 10);
        // let toYear = parseInt(self.state.toYear, 10);
        // let fromYear = parseInt(self.state.fromYear, 10);
        // let yearDiff = toYear - fromYear;
        // if (yearDiff !== toGrade) {
        //   showErrorToast("Don't think, you can make it in this tenure.");
        // } else {
        self.setState({ isLoading: true });
        if (self.state.oragnizationFile !== '') {
          self.uploadOragnizationLogo();
        } else {
          self.handleSubmit();
        }
        //}
      }
    });
  };

  uploadImageToAzure(file) {
    if (file) {
      this.setState({
        oragnizationPreview: this.state.imageSource,
        oragnizationFile: file
      });
    }
  }

  uploadOragnizationLogo() {
    let AzureStorage = window.AzureStorage;
    let sasToken = this.state.sasToken;
    let userId = this.state.userId;
    let fileData = this.state.oragnizationFile;
    let fileName = generateTimestamp(fileData.name);
    let uploadPath = `sv_${userId}/${CONSTANTS.oragnizationAlbum}/${fileName}`;
    let self = this;

    const blobService = AzureStorage.Blob.createBlobServiceWithSas(
      CONSTANTS.azureBlobURI,
      sasToken
    );

    blobService.createBlockBlobFromBrowserFile(
      CONSTANTS.azureContainer,
      uploadPath,
      fileData,
      (error, result) => {
        if (result) {
          self.setState(
            {
              oragnizationLogo: uploadPath
            },
            () => {
              self.handleSubmit();
            }
          );
        }
        if (error) {
          console.log('error ', error);
        }
      }
    );
  }

  handleSubmit() {
    let organizationId = this.state.organizationId;
    let educationId = this.state.educationId;
    let userId = this.state.userId;
    let institute = this.state.instituteName;
    let city = this.state.city;
    let fromGrade = this.state.fromGrade;
    let toGrade = this.state.toGrade;
    let fromYear = this.state.fromYear;
    let toYear = this.state.toYear;
    // let fieldOfStudy = this.state.fieldOfStudy;
    //let grade = this.state.grade;
    // let fromDate =
    //   this.state.startDate !== ''
    //     ? moment(this.state.startDate).format('DD-MMM-YYYY')
    //     : '';
    // let toDate =
    //   this.state.endDate !== ''
    //     ? moment(this.state.endDate).format('DD-MMM-YYYY')
    //     : '';
    let description = this.state.description;
    let isActive = this.state.isActive;
    let type = CONSTANTS.typeSchool;
    let logo = this.state.oragnizationLogo;

    let data = {
      educationId,
      organizationId,
      userId,
      logo,
      institute,
      city,
      fromGrade,
      toGrade,
      fromYear,
      toYear,
      description,
      isActive,
      type
    };

    let self = this;
    if (this.state.educationId === '') {
      spikeViewApiService('addEducation', data)
        .then(response => {
          if (response && response.data.status === 'Success') {
            self.props.closeEducationComponent();
            self.props.getAllEducation();
            self.setState({ isLoading: false });
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log('err', error);
        });
    } else {
      spikeViewApiService('editEducation', data)
        .then(response => {
          if (response && response.data.status === 'Success') {
            self.props.closeEducationComponent();
            self.props.getAllEducation();
            self.setState({ isLoading: false, educationModal: false });
          } else {
            self.setState({ isLoading: false });
          }
        })
        .catch(error => {
          self.setState({ isLoading: false });
          console.log('err', error);
        });
    }
  }

  deleteEducation = educationId => {
    let data = {
      educationId
    };
    let self = this;
    if (educationId) {
      spikeViewApiService('deleteEducation', data)
        .then(response => {
          if (response && response.data.status === 'Success') {
            self.props.closeEducationComponent();
            self.props.getAllEducation();
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  listOragnization() {
    let self = this;
    this.props
      .actionListOragnization()
      .then(response => {
        if (response.payload && response.payload.data.status === 'Success') {
          let oragnizationData = response.payload.data.result;
          if (oragnizationData.length > 0) {
            let options = oragnizationData.map(function(item) {
              return {
                value: item.organizationId,
                label: item.name
              };
            });
            self.setState({ listOragnization: options, isLoading: false });
          } else {
            self.setState({ listOragnization: [], isLoading: false });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleInstituteChange = value => {
    if (value.length > 0) {
      let organizationId = value[0].value;
      let instituteName = value[0].label;

      this.setState({
        organizationId,
        instituteName
      });
    }
  };

  handleInputChange = value => {
    this.setState({
      instituteName: value
    });
  };

  renderFromYearDropdown() {
    const yearList = [];
    let fromYear = this.state.educationFromYear;

    let DOB =
      this.props.user && this.props.user.dob
        ? moment(this.props.user.dob).format('YYYY')
        : '';

    if (DOB === 0 || DOB === null || DOB === '') {
      let current_year = moment().format('YYYY') - 49;
      DOB = current_year;
    }

    yearList.push(
      <option value="" key={''}>
        Year
      </option>
    );

    if (
      parseInt(fromYear, 10) &&
      parseInt(DOB, 10) &&
      parseInt(DOB, 10) > parseInt(fromYear, 10) &&
      this.props.educationMode === 2
    ) {
      yearList.push(
        <option value={fromYear} key={fromYear}>
          {fromYear}
        </option>
      );
    }

    for (var i = DOB; i <= CONSTANTS.toYear; i++) {
      yearList.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return yearList;
  }

  renderToYearDropdown() {
    let toYear = this.state.educationToYear;

    const yearList = [];
    let DOB =
      this.props.user && this.props.user.dob
        ? moment(this.props.user.dob).format('YYYY')
        : '';

    if (DOB === 0 || DOB === null || DOB === '') {
      let current_year = moment().format('YYYY') - 49;
      DOB = current_year;
    }

    yearList.push(
      <option value="" key={''}>
        Year
      </option>
    );

    if (
      parseInt(toYear, 10) &&
      parseInt(DOB, 10) &&
      parseInt(DOB, 10) > parseInt(toYear, 10) &&
      this.props.educationMode === 2
    ) {
      yearList.push(
        <option value={toYear} key={toYear}>
          {toYear}
        </option>
      );
    }

    for (var i = DOB; i <= CONSTANTS.toYear; i++) {
      yearList.push(
        <option value={i} key={i}>
          {i}
        </option>
      );
    }
    return yearList;
  }

  renderGradeDropdown() {
    const gradeArray = [
      '1st',
      '2nd',
      '3rd',
      '4th',
      '5th',
      '6th',
      '7th',
      '8th',
      '9th',
      '10th',
      '11th',
      '12th'
    ];
    const gradeList = [];
    gradeList.push(
      <option value="" key={''}>
        Grade
      </option>
    );
    for (var i = 0; i <= gradeArray.length - 1; i++) {
      gradeList.push(
        <option value={gradeArray[i]} key={i}>
          {gradeArray[i]}
        </option>
      );
    }
    return gradeList;
  }

  // handleFromClick = () => {
  //   let fromYear = this.state.educationFromYear;
  //   let DOB =
  //     this.props.user && this.props.user.dob
  //       ? moment(this.props.user.dob).format('YYYY')
  //       : '';

  //   if (DOB == 0 || DOB === null) {
  //     let current_year = moment().format('YYYY') - 30;
  //     DOB = current_year;
  //   }
  //   if (fromYear && this.props.educationMode === 2) {
  //     var x = document.getElementById('mySelect');
  //     var selectedValue = x.value;
  //     if (
  //       selectedValue == fromYear &&
  //       parseInt(DOB, 10) > parseInt(fromYear, 10)
  //     ) {
  //       x.remove(x.selectedIndex);
  //     }
  //   }
  // };

  render() {
    const { isLoading } = this.state;
    return (
      <Modal
        bsSize="large"
        show={this.state.educationModal}
        onHide={this.closeEducationModal}
        backdrop="static"
        keyboard={false}
      >
        {/* <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        /> */}

        {this.state.imageSource ? (
          <ImageCropper
            imageSource={this.state.imageSource}
            imageName={this.state.imageName}
            imageType={this.state.imageType}
            aspectRatio={1 / 1}
            modalSize={this.state.action === 1 ? 'medium' : 'large'}
            cropBoxWidth={this.state.action === 1 ? '200' : '700'}
            cropBoxHeight={this.state.action === 1 ? '200' : '700'}
            uploadImageToAzure={this.uploadImageToAzure}
          />
        ) : null}
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">EDUCATION</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal className="lightBgForm">
            <Col sm={9}>
              <FormGroup
                controlId="formHorizontalEmail"
                className={this.getClasses('instituteName')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  Institute
                </Col>
                <Col sm={9}>
                  <AsyncTypeahead
                    minLength={2}
                    isLoading={this.state.isLoading}
                    labelKey={'label'}
                    placeholder="Search Institute"
                    onSearch={this.listOragnization.bind(this)}
                    options={this.state.listOragnization}
                    name="instituteName"
                    value={this.state.instituteName}
                    onChange={this.handleInstituteChange}
                    allowNew={true}
                    newSelectionPrefix="Add Oragnization"
                    onInputChange={this.handleInputChange}
                    searchText={this.state.searchText}
                    defaultInputValue={this.state.instituteName}
                  />
                  {/* <FormControl
                    type="text"
                    placeholder="Golden Leaf School"
                    name="instituteName"
                    value={this.state.instituteName}
                    onChange={this.handleChange}
                    autoComplete="off"
                  /> */}
                  {renderMessage(
                    this.props.getValidationMessages('instituteName')
                  )}
                </Col>
              </FormGroup>
              <FormGroup
                controlId="formHorizontalPassword"
                className={this.getClasses('city')}
              >
                <Col componentClass={ControlLabel} sm={3}>
                  City
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="Ex: New york"
                    name="city"
                    value={this.state.city}
                    onChange={this.handleChange}
                    autoComplete="off"
                  />
                  {renderMessage(this.props.getValidationMessages('city'))}
                </Col>
              </FormGroup>
              {/* <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Field of study
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="Enter field of study"
                    name="fieldOfStudy"
                    value={this.state.fieldOfStudy}
                    onChange={this.handleChange}
                    autoComplete="off"
                  />
                </Col>
              </FormGroup> */}

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Grade
                </Col>
                <Col sm={9}>
                  <Row className="customDatePicker">
                    <Col sm={6} className={this.getClasses('fromGrade')}>
                      <div className="line-between-form-controls">
                        <div className="custom-select">
                          <span className="icon-down_arrow selectIcon" />
                          <FormControl
                            componentClass="select"
                            placeholder="Grade"
                            onChange={this.handleFromGrade}
                            name="fromGrade"
                            value={this.state.fromGrade}
                          >
                            {this.renderGradeDropdown()}
                          </FormControl>
                        </div>
                      </div>
                      {renderMessage(
                        this.props.getValidationMessages('fromGrade')
                      )}
                    </Col>

                    <Col sm={6} className={this.getClasses('toGrade')}>
                      <div className="line-between-form-controls">
                        <div className="custom-select">
                          <span className="icon-down_arrow selectIcon" />
                          <FormControl
                            componentClass="select"
                            placeholder="Grade"
                            onChange={this.handleToGrade}
                            name="toGrade"
                            value={this.state.toGrade}
                          >
                            {this.renderGradeDropdown()}
                          </FormControl>
                        </div>
                      </div>
                      {renderMessage(
                        this.props.getValidationMessages('toGrade')
                      )}
                    </Col>
                    <Col sm={12}>
                      {renderMessage(
                        this.props.getValidationMessages('isToGrade')
                      )}
                    </Col>
                  </Row>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col componentClass={ControlLabel} sm={3}>
                  From
                </Col>
                <Col sm={9}>
                  <Row className="customDatePicker">
                    <Col sm={6} className={this.getClasses('fromYear')}>
                      <div className="line-between-form-controls">
                        <div className="custom-select">
                          <span className="icon-down_arrow selectIcon" />
                          <FormControl
                            id="fromYearSelect"
                            componentClass="select"
                            placeholder="Year"
                            onChange={this.handleFromYear}
                            onClick={this.handleFromClick}
                            // disabled={
                            //   this.state.fromGrade && this.state.toGrade
                            //     ? false
                            //     : true
                            // }
                            name="fromYear"
                            value={this.state.fromYear}
                          >
                            {this.renderFromYearDropdown().reverse()}
                          </FormControl>
                        </div>
                      </div>
                      {renderMessage(
                        this.props.getValidationMessages('fromYear')
                      )}
                    </Col>
                    <Col sm={6} className={this.getClasses('toYear')}>
                      <div className="line-between-form-controls">
                        <div className="custom-select">
                          <span className="icon-down_arrow selectIcon" />
                          <FormControl
                            id="toYearSelect"
                            componentClass="select"
                            placeholder=" Year"
                            onChange={this.handleToYear}
                            name="toYear"
                            value={this.state.toYear}
                            // disabled={this.state.toYear ? false : true}
                          >
                            {this.renderToYearDropdown().reverse()}
                          </FormControl>
                        </div>
                      </div>
                      {renderMessage(
                        this.props.getValidationMessages('toYear')
                      )}
                    </Col>
                    <Col sm={12}>
                      {renderMessage(
                        this.props.getValidationMessages('isToYear')
                      )}
                    </Col>
                  </Row>
                </Col>
              </FormGroup>

              {/* <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Grade
                </Col>
                <Col sm={9}>
                  <FormControl
                    type="text"
                    placeholder="Enter grade"
                    name="grade"
                    value={this.state.grade}
                    onChange={this.handleChange}
                    autoComplete="off"
                  />
                </Col>
              </FormGroup> */}

              {/* <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  From to Date
                </Col>
                <Col sm={9} className={this.getClasses('startDate')}>
                  <div className="flex row ">
                    <Col sm={6}>
                      <DatePicker
                        className="form-control"
                        selected={this.state.startDate}
                        selectsStart
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeStart}
                        readOnly={true}
                        placeholderText="Date"
                        showYearDropdown
                        dateFormat="DD-MMM-YYYY"
                        isClearable={false}
                      />
                      {renderMessage(
                        this.props.getValidationMessages('startDate')
                      )}
                    </Col>
                    <Col sm={6} className={this.getClasses('endDate')}>
                      <DatePicker
                        className="form-control"
                        selected={this.state.endDate}
                        selectsEnd
                        startDate={this.state.startDate}
                        endDate={this.state.endDate}
                        onChange={this.handleChangeEnd}
                        readOnly={true}
                        placeholderText="Date"
                        showYearDropdown
                        dateFormat="DD-MMM-YYYY"
                        isClearable={false}
                      />
                      {renderMessage(
                        this.props.getValidationMessages('endDate')
                      )}
                    </Col>
                  </div>
                </Col>
              </FormGroup> */}

              <FormGroup controlId="formHorizontalPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Description
                </Col>
                <Col sm={9}>
                  <FormControl
                    componentClass="textarea"
                    placeholder="Enter Here"
                    name="description"
                    value={this.state.description}
                    onChange={this.handleChange}
                    autoComplete="off"
                    maxLength="500"
                  />
                </Col>
              </FormGroup>
            </Col>
            <Col sm={3}>
              <div className="box flex flex-column flex-center">
                <input
                  type="file"
                  onChange={this.handleImageChange.bind(this)}
                  accept="image/*"
                  value=""
                  className="custom-fileUpload"
                />
                <div className="addProfileWrapper text-center">
                  {this.state.oragnizationPreview === '' ? (
                    <span className="icon-school icon lg-icon" />
                  ) : (
                    <img src={this.state.oragnizationPreview} alt="" />
                  )}
                  <div className="hover-section">
                    <input
                      type="file"
                      onChange={this.handleImageChange.bind(this)}
                      accept="image/*"
                      value=""
                      className="custom-fileUpload"
                    />
                    <span className="icon-edit_pencil icon" />
                  </div>
                </div>
              </div>
            </Col>
            <div className="flex align-center justify-content-between fullWidth" />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-content-between align-center">
            <div className="left">
              {this.state.educationId !== '' ? (
                <Button
                  bsStyle="danger"
                  className="no-bold no-round btn btn-danger"
                  onClick={this.deleteEducation.bind(
                    this,
                    this.state.educationId
                  )}
                >
                  Delete Education
                </Button>
              ) : (
                ''
              )}
            </div>
            <div className="right flex align-center">
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
                className="no-bold no-round"
                onClick={this.closeEducationModal}
              >
                Close
              </Button>
            </div>
          </div>
          {/* <Button
            bsStyle="primary"
            className="no-bold no-round"
            disabled={isLoading}
            onClick={!isLoading ? this.validateData : null}
          >
            {isLoading ? 'In Progress...' : 'Save'}
          </Button>
          <Button
            bsStyle="default"
            className="no-bold no-round"
            onClick={this.closeEducationModal}
          >
            Close
          </Button>
          {this.state.educationId !== '' ? (
            <Button
              bsStyle="default"
              className="no-bold no-round btn btn-danger"
              onClick={this.deleteEducation.bind(this, this.state.educationId)}
            >
              Delete Education
            </Button>
          ) : (
            ''
          )*/}
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
  return bindActionCreators({ actionListOragnization }, dispatch);
};

addEducation = validation(strategy)(addEducation);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(addEducation);
