import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import {
  FormGroup,
  FormControl,
  Checkbox,
  Col,
  Modal,
  Button,
  Form,
  ControlLabel
} from 'react-bootstrap';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';

import CONSTANTS from '../../common/core/config/appConfig';
import spikeViewApiService from '../../common/core/api/apiService';
import {
  renderMessage,
  generateTimestamp,
  getThumbImage,
  limitCharacter
} from '../../common/commonFunctions';
import {
  actionSetGroupList,
  actionUpdateGroupInfo
} from '../../common/core/redux/actions';
import ImageCropper from '../../common/cropper/imageCropper';

let validationMessages = CONSTANTS.validationMessages;

class GroupList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      disabled: false,
      isLoading: false,
      groupType: 'private',
      groupPreview: '',
      groupFile: '',
      groupLogo: '',
      groupOwner: '',
      imageSource: '',
      imageName: '',
      imageType: ''
    };

    this.getGroupInfo = this.getGroupInfo.bind(this);
    this.linkOnChange = this.linkOnChange.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.uploadImageToAzure = this.uploadImageToAzure.bind(this);
    this.validatorTypes = strategy.createSchema(
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

  componentDidMount() {
    this.getGroupList();
    this.setState({ groupList: this.props.groupListData });
    if (this.props.groupId) {
      this.isUserExistAsMember(this.props.groupId);
    }
    let userId = this.props.userId;
    this.setState({ userId });
    this.props.onRefGroupList(this);
  }

  isUserExistAsMember(groupId) {
    spikeViewApiService('getGroupDetailByGroupId', { groupId }).then(
      response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let selectedGroup = response.data.result[0];
          if (selectedGroup) {
            let index = selectedGroup.members.findIndex(
              todo => todo.userId == this.props.userId
            );

            if (index !== -1) {
              this.getGroupMemberList(selectedGroup);
            }
          }
        }
      }
    );
  }

  componentWillUnmount() {
    this.props.onRefGroupList(undefined);
  }

  groupImageUpload() {
    this.getGroupList();
  }

  getValidatorData = () => {
    return this.state;
  };

  getClasses = field => {
    return classnames({
      error: !this.props.isValid(field)
    });
  };

  linkOnChange = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
    this.setState({ [event.target.name]: event.target.value });
  };

  getGroupList() {
    let userId = this.props.userId;
    this.props
      .actionSetGroupList({ userId })
      .then(response => {
        if (response && response.payload.status === 200) {
          let groupList = response.payload.data.result;
          this.setState({
            groupList
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  validateData = () => {
    let self = this;
    this.props.validate(function(error) {
      if (!error) {
        self.setState({ isLoading: true });
        if (self.state.groupFile !== '') {
          self.uploadGroupLogo();
        } else {
          self.createGroup();
        }
      }
    });
  };

  uploadImageToAzure(file) {
    if (file) {
      this.setState({
        groupPreview: this.state.imageSource,
        groupFile: file
      });
    }
  }

  uploadGroupLogo() {
    let AzureStorage = window.AzureStorage;
    let sasToken = this.state.sasToken;
    let userId = this.state.userId;
    let fileData = this.state.groupFile;
    let fileName = generateTimestamp(fileData.name);
    let uploadPath = `sv_${userId}/${CONSTANTS.feedAlbum}/${fileName}`;
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
              groupLogo: uploadPath
            },
            () => {
              self.createGroup();
            }
          );
        }
        if (error) {
          console.log('error ', error);
        }
      }
    );
  }

  createGroup = event => {
    let data = {
      groupName: this.state.groupName,
      type: this.state.groupType,
      creationDate: moment().valueOf(),
      createdBy: this.props.userId,
      isActive: true,
      aboutGroup: this.state.aboutGroup,
      otherInfo: this.state.otherInfo,
      members: [
        {
          userId: this.props.userId,
          isAdmin: true,
          status: CONSTANTS.groupStatus.ACCEPTED
        }
      ],
      groupImage: this.state.groupLogo
    };
    spikeViewApiService('createGroups', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          this.getGroupList();
          this.setState({
            openGroupModal: !this.state.openGroupModal,
            groupName: '',
            aboutGroup: '',
            otherInfo: '',
            isLoading: false
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  groupAddPopUp = data => {
    this.setState({
      openGroupModal: !this.state.openGroupModal,
      groupName: '',
      aboutGroup: '',
      otherInfo: ''
    });
  };

  handleImageChange = event => {
    //this.setState({ groupPreview: '' });
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
          imageSource: event.target.result,
          imageName: fileName,
          imageType: fileType,
          action: 1
          //groupFile: file,
          //groupPreview: event.target.result
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

  getGroupInfo = data => {
    if (data.groupId !== this.state.groupId) {
      this.getGroupMemberList(data);
      this.props.getGroupInfo(data);
      this.props.actionUpdateGroupInfo(data);
    }
  };

  getGroupMemberList(data) {
    let groupId = data.groupId;
    let groupOwner = data.createdBy;

    spikeViewApiService('getGroupMemberListByGroupId', { groupId })
      .then(response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let groupMemberList = response.data.result.members,
            memberCount = 0;
          groupMemberList.forEach(function(data) {
            if (data.status === CONSTANTS.groupStatus.ACCEPTED) {
              memberCount++;
            }
          });

          this.setState({
            groupMemberList,
            groupOwner,
            groupId,
            memberCount
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  showProfileDashboard(data){
    let userId = data.userId;
    let name = data.firstName;
    let roleId = data.roleId;

    if (userId && roleId === 1) {
      if (userId === this.props.user.userId) {
        this.props.history.push('/student/profile');
      } else {
        this.props.history.push({
          pathname: '/student/profile/' + userId,
          state: {
            searchKey: name
          }
        });
      }
    }

    if (userId && roleId === 2) {
      if (userId === this.props.user.userId) {
        this.props.history.push('/parent/dashboard');
      } else {
        this.props.history.push({
          pathname: '/parent/profile/' + userId,
          state: {
            searchKey: name  
          }
        });
      }
    }    
  } 


  render() {
    const { isLoading } = this.state;
    let _this = this;
    return (
      <div>
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
        {/* {this.state.groupMemberList && this.state.groupMemberList.length > 0 ? (
          <div className="postWrapper myGroups mt-0">
            <div className="pw-postHeader md-size flex justify-content-between">
              <div className="sectionTitle">
                {this.state.groupMemberList &&
                  this.state.groupMemberList.length + ' Members'}{' '}
              </div>
              {/* <a onClick={this.educationPopup} className="btn addBtn">
                <span className="icon-plus" />
              </a> 
            </div>
            <div className="pw-postBody">
              <ul className="group-names">
                {this.state.groupMemberList &&
                  this.state.groupMemberList.map(function(data) {
                    return (
                      <li>
                        <a>
                          {data.profilePicture ? (
                            <img
                              src={`${azureURL}/${data.profilePicture}`}
                              className="object-fit-cover groupBanner--img"
                              alt=""
                            />
                          ) : (
                            <span className="icon-all_connections icon" />
                          )} 
                          {data.firstName} {data.lastName}
                        </a>
                      </li>
                    );
                  })}
              </ul>
              <Link
                to={{
                  pathname: '/student/groupMembersList',
                  state: {
                    groupMemberList: this.state.groupMemberList,
                    groupId: this.state.groupId,
                    groupOwner: this.state.groupOwner
                  }
                }}
              >
                {' '}
                <Button bsStyle="link white">View All</Button>
              </Link>
            </div>
          </div>
        ) : null} */}

        <div className="group--area">
          <div className="postWrapper myGroups mt-0">
            <div className="pw-postHeader md-size flex justify-content-between">
              <div className="sectionTitle">Your Groups</div>

              <a onClick={this.groupAddPopUp} className="btn addBtn">
                <span className="icon-plus" />
              </a>
            </div>
            <div className="pw-postBody h-200 text-center r-box-set">
              <ul className="group-names">
                {this.state.groupList &&
                  this.state.groupList.map(function(data, index) {
                    let statusDot = null;
                    {
                      data.members &&
                        data.members.map(function(item) {
                          if (
                            _this.props.userId === data.createdBy &&
                            item.status === CONSTANTS.groupStatus.REQUESTED
                          ) {
                            statusDot = <span className="n-dot" />;
                            return false;
                          } else if (
                            _this.props.userId === item.userId &&
                            (item.status === CONSTANTS.groupStatus.INVITED ||
                              item.status === CONSTANTS.groupStatus.REQUESTED)
                          ) {
                            statusDot = <span className="n-dot" />;
                            return false;
                          }
                        });
                    }
                    return index < 3 ? (
                      <li key={index}>
                        {_this.props.match &&
                        _this.props.match.url &&
                        _this.props.match.url.indexOf('/groupFeed') >= 0 ? (
                          <a
                            onClick={_this.getGroupInfo.bind(_this, data)}
                            title={data.groupName}
                          >
                            {data.groupImage ? (
                              <img
                                src={getThumbImage('small', data.groupImage)}
                                className="object-fit-cover groupBanner--img"
                                alt=""
                              />
                            ) : (
                              <span className="icon-all_connections icon" />
                            )}
                            {limitCharacter(data.groupName, 20)}
                          </a>
                        ) : (
                          <Link
                            to={{
                              pathname: '/student/groupFeed',
                              state: {
                                groupId: data.groupId
                              }
                            }}
                            title={data.groupName}
                          >
                            {data.groupImage ? (
                              <img
                                src={getThumbImage('small', data.groupImage)}
                                className="object-fit-cover groupBanner--img"
                                alt=""
                              />
                            ) : (
                              <span className="icon-all_connections icon" />
                            )}
                            {limitCharacter(data.groupName, 20)}
                          </Link>
                        )}
                        {statusDot ? statusDot : null}
                      </li>
                    ) : null;
                  })}
              </ul>
              {this.state.groupList && this.state.groupList.length > 0 ? (
                <Link
                  to={{
                    pathname: '/student/groupListAll'
                  }}
                >
                  {' '}
                  <div className="centeredBox mt-1">
                    <Button className="btn btn-with-border light">
                      View All
                    </Button>
                  </div>
                </Link>
              ) : (
                'Creating your spikeview group is just matter of few step, start creating your group by clicking on "+" icon above !!'
              )}
            </div>
          </div>

          {this.state.groupMemberList &&
          this.state.groupMemberList.length > 0 ? (
            <div className="postWrapper myGroups">
              <div className="pw-postHeader md-size flex justify-content-between">
                <div className="sectionTitle">
                  {' Members (' + this.state.memberCount + ')'}{' '}
                </div>
                {/* <a onClick={this.educationPopup} className="btn addBtn">
                <span className="icon-plus" />
              </a> */}
              </div>
              <div className="pw-postBody">
                <ul className="group-names">
                  {this.state.groupMemberList &&
                    this.state.groupMemberList.map(function(data, i) {
                      return i < 3 ? (
                        _this.state.groupOwner === _this.props.userId ||
                        (_this.state.groupOwner !== _this.props.userId &&
                          data.status === CONSTANTS.groupStatus.ACCEPTED) ? (
                          <li key={i}>
                            <a onClick={_this.showProfileDashboard.bind(_this,data)}>
                              {data.profilePicture ? (
                                <img
                                  src={getThumbImage(
                                    'small',
                                    data.profilePicture
                                  )}
                                  className="object-fit-cover groupBanner--img"
                                  alt=""
                                />
                              ) : (
                                <span className="icon-all_connections icon" />
                              )}
                                {data.firstName}
                            </a>

                            {_this.props.userId === _this.state.groupOwner &&
                            (data.status === CONSTANTS.groupStatus.INVITED ||
                              data.status ===
                                CONSTANTS.groupStatus.REQUESTED) ? (
                              <span className="n-dot" />
                            ) : null}
                          </li>
                        ) : null
                      ) : null;
                    })}
                </ul>
                <Link
                  to={{
                    pathname: '/student/groupMembersList',
                    state: {
                      groupMemberList: this.state.groupMemberList,
                      groupId: this.state.groupId,
                      groupOwner: this.state.groupOwner
                    }
                  }}
                >
                  {' '}
                  <div className="centeredBox mt-1">
                    <Button className="btn btn-with-border light">
                      View All
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
        <Modal
          bsSize="large"
          show={this.state.openGroupModal}
          onHide={this.groupAddPopUp}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Create Group
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form horizontal className="lightBgForm">
              <Col sm={9}>
                <FormGroup
                  controlId="formHorizontalEmail"
                  className={this.getClasses('groupName')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    Group Name
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      type="text"
                      placeholder="Group Name"
                      name="groupName"
                      value={this.state.groupName}
                      onChange={this.linkOnChange}
                      onKeyPress={this.linkOnChange}
                      maxLength="50"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('groupName')
                    )}
                  </Col>
                </FormGroup>

                <FormGroup
                  controlId="formHorizontalPassword"
                  className={this.getClasses('aboutGroup')}
                >
                  <Col componentClass={ControlLabel} sm={3}>
                    About Group
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      name="aboutGroup"
                      value={this.state.aboutGroup}
                      onChange={this.linkOnChange}
                      componentClass="textarea"
                      placeholder="About Group"
                      maxLength="500"
                    />
                    {renderMessage(
                      this.props.getValidationMessages('aboutGroup')
                    )}
                  </Col>
                </FormGroup>

                <FormGroup controlId="formHorizontalPassword">
                  <Col componentClass={ControlLabel} sm={3}>
                    Other Information
                  </Col>
                  <Col sm={9}>
                    <FormControl
                      name="otherInfo"
                      value={this.state.otherInfo}
                      onChange={this.linkOnChange}
                      componentClass="textarea"
                      placeholder="Example: Group policies"
                      maxLength="500"
                    />
                  </Col>
                </FormGroup>

                <FormGroup>
                  <Col smOffset={3} sm={9}>
                    <Checkbox
                      className="checkbox-primary"
                      name="groupType"
                      checked={
                        this.state.groupType === 'private' ? true : false
                      }
                      value="private"
                      onChange={this.linkOnChange}
                    >
                      Private Group
                      <span className="check" />
                    </Checkbox>

                    <Checkbox
                      className="checkbox-primary"
                      name="groupType"
                      checked={this.state.groupType === 'public' ? true : false}
                      value="public"
                      onChange={this.linkOnChange}
                    >
                      Public Group
                      <span className="check" />
                    </Checkbox>
                  </Col>
                </FormGroup>
              </Col>
              {/* <Col sm={3}>
                <div className="box flex flex-column flex-center">
                  <input
                    type="file"
                    onChange={this.handleImageChange.bind(this)}
                    accept="image/*"
                    value=""
                    className="custom-fileUpload"
                  />
                  <div className="addProfileWrapper text-center">
                    {this.state.groupPreview === '' ? (
                      <span className="icon-school icon lg-icon" />
                    ) : (
                      <img src={this.state.groupPreview} alt="" />
                    )}
                    <div className="hover-section">
                      <input
                        type="file"
                        onChange={this.handleImageChange.bind(this)}
                        accept="image/*"
                        value=""
                        className="custom-fileUpload"
                      />
                      <span class="icon-edit_pencil icon" />
                    </div>
                  </div>
                </div>
              </Col> */}
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
              {isLoading ? 'In Progress...' : 'Create'}
            </Button>
            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.groupAddPopUp}
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionSetGroupList,
      actionUpdateGroupInfo
    },
    dispatch
  );
};

const mapStateToProps = state => {
  return {
    groupListData: state.User.groupListData
  };
};

GroupList = validation(strategy)(GroupList);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupList);
