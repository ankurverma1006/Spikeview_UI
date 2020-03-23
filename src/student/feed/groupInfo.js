import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ImageCropper from '../../common/cropper/imageCropper';
import CONSTANTS from '../../common/core/config/appConfig';
import { generateTimestamp, getThumbImage } from '../../common/commonFunctions';
import { Link } from 'react-router-dom';
import { NavDropdown, Nav } from 'react-bootstrap';
import spikeViewApiService from '../../common/core/api/apiService';
import { Button } from 'react-bootstrap';
import { actionUpdateGroupInfo } from '../../common/core/redux/actions';
import defaultGroupImage from '../../assets/img/background_group.jpg';

class GroupInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupImage: '',
      userList: [],
      disabled: false,
      loader2: false
    };
    this.uploadImageToAzure = this.uploadImageToAzure.bind(this);
  }

  componentDidMount() {
    if (this.props.selectedGroup) {
      let groupId = this.props.selectedGroup.groupId;
      this.getGroupDetailByGroupId(groupId);
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
            userId: this.props.userId,
            groupImage: selectedGroup.groupImage
              ? getThumbImage('original', selectedGroup.groupImage)
              : selectedGroup.groupImage,
            groupId: selectedGroup.groupId,
            groupName: selectedGroup.groupName,
            groupOwner: selectedGroup.createdBy,
            aboutGroup: selectedGroup.aboutGroup,
            type: selectedGroup.type
          });
          let data = selectedGroup;
          let index = data.members.findIndex(
            todo => todo.userId == this.props.userId
          );
          if (index !== -1) {
            if (data.members[index].status === CONSTANTS.groupStatus.ACCEPTED)
              this.setState({
                viewAddPhotoLable: true,
                userStatus: data.members[index].status
              });
            else this.setState({ userStatus: data.members[index].status });
          } else {
            this.setState({ showJoinButton: true, userStatus: '' });
          }
        }
      }
    );
  }

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
          imageSource: event.target.result,
          imageName: fileName,
          imageType: fileType,
          action: 2
        });
      };
    }
  };

  uploadImageToAzure(file) {
    let _this = this;
    let userId = _this.state.userId;
    let sasToken = _this.state.sasToken;

    if (file !== '') {
      this.setState({ loader2: true, groupImage: '' });

      let AzureStorage = window.AzureStorage;
      let folderName = CONSTANTS.feedAlbum;
      let fileName = generateTimestamp(file.name);
      let uploadPath = `sv_${userId}/${folderName}/${fileName}`;

      const blobService = AzureStorage.Blob.createBlobServiceWithSas(
        CONSTANTS.azureBlobURI,
        sasToken
      );

      blobService.createBlockBlobFromBrowserFile(
        CONSTANTS.azureContainer,
        uploadPath,
        file,
        (error, result) => {
          if (result) {
            this.updateGroupData(uploadPath);
            this.setState({ groupImage: groupImage, loader2: false });
            this.getGroupDetailByGroupId(this.props.selectedGroup.groupId);
            let groupImage = `${CONSTANTS.azureBlobURI}/${
              CONSTANTS.azureContainer
            }/${uploadPath}`;
            console.log('upload is successful', uploadPath);
          }
          if (error) {
            console.log('error ', error);
          }
        }
      );
    }
  }

  updateGroupData = uploadPath => {
    let groupImage = uploadPath;
    let groupId = this.state.groupId;
    let data = {
      groupId,
      groupImage
    };
    let groupData = this.props.selectedGroup;
    groupData['groupImage'] = groupImage;
    this.setState({ groupImageStatus: true });
    this.props.actionUpdateGroupInfo(groupData);
    spikeViewApiService('updateGroupImage', data).then(response => {
      this.props.setUploadImage(this.state.groupId);
    });
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedGroup) {
      this.getGroupDetailByGroupId(nextProps.selectedGroup.groupId);
    }
    this.setState({ groupImageStatus: false });
    this.setState({ viewAddPhotoLable: true });
  }

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

  removeGroupImage = () => {
    this.setState({
      groupImage: ''
    });
  };

  joinMember = status => {
    let data = {
      groupId: this.state.groupId,
      userId: this.props.userId
    };
    this.setState({ isLoading: true });
    spikeViewApiService('joinMemberInGroup', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          let userStatus=  this.state.type === 'public' ? CONSTANTS.groupStatus.ACCEPTED : CONSTANTS.groupStatus.REQUESTED;
          this.setState({
            showJoinButton: false,
            userStatus: userStatus
          });
          this.setNotification(this.state.groupOwner);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  setNotification(receiveId) {
    let displayData = [];
    displayData.push(
      <div id="display-data">
        <pre />
      </div>
    );
    let dateTime = new Date().valueOf();
    let midText= this.state.type === 'public' ? " has joined " : " requested to join ";
    let text = 
      this.props.user.firstName +
      ' ' +
      (this.props.user.lastName ? this.props.user.lastName : '') +
       midText +
      (this.state.groupName ? this.state.groupName : '') +
      '  group groupId=' +
      this.state.groupId;

    let feedId = '';
    let flag = false;
    let notificationData = {
      userId: receiveId,
      actedBy: this.props.user.userId,
      profilePicture: this.props.user.profilePicture,
      feedId,
      text,
      dateTime,
      flag
    };
    spikeViewApiService('postNotification', notificationData);
  }

  updateMemeberStatus = (groupId, action) => {
    let data = {
      groupId: groupId,
      userId: this.props.userId,
      status: action
    };
    spikeViewApiService('updateMemberStatus', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          this.getGroupDetailByGroupId(groupId);
          this.props.setUploadImage();
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    let dots = <span className="icon-dots" />;
    let groupImage = this.state.groupImage;
    return (
      <div className="group--area">
        <div className="groupBanner--wrapper">
          <div className="loader">
            <img
              src="../assets/img/svg-loaders/three-dots.svg"
              width="50"
              alt="loader"
              style={
                this.state.loader2 === true
                  ? { visibility: 'visible' }
                  : { visibility: 'hidden' }
              }
            />
          </div>

          <img
            src={
              this.state.groupImage === ''
                ? defaultGroupImage
                : this.state.groupImage
            }
            className="object-fit-cover groupBanner--img"
            alt=""
          />

          {this.state.imageSource ? (
            <ImageCropper
              imageSource={this.state.imageSource}
              imageName={this.state.imageName}
              imageType={this.state.imageType}
              aspectRatio={this.state.action === 1 ? 1 / 1 : 16 / 9}
              modalSize={this.state.action === 1 ? 'medium' : 'large'}
              cropBoxWidth={this.state.action === 1 ? '200' : '700'}
              cropBoxHeight={this.state.action === 1 ? '200' : '700'}
              uploadImageToAzure={this.uploadImageToAzure}
            />
          ) : null}
          <div className="group--content">
            <div className="group--title">{this.state.groupName}</div>
            {this.props.selectedGroup &&
            (this.state.groupOwner == this.props.userId ||
              (this.state.type === 'public' &&
                this.state.userStatus === CONSTANTS.groupStatus.ACCEPTED)) ? (
              <div className="group--settings">
                <Nav>
                  <NavDropdown eventKey="3" title={dots}>
                    <li>
                      <Link
                        className="p-0"
                        to={{
                          pathname: '/student/managegroup',
                          state: {
                            selectedGroup: this.props.selectedGroup,
                            userId: this.props.userId,
                            groupOwner: this.state.groupOwner
                          }
                        }}
                      >
                        {' '}
                        <span className="icon-private icon " />
                        Manage Group
                      </Link>
                    </li>
                    {/* <MenuItem
                      eventKey="3.2"
                      onClick={this.removeGroupImage.bind(this)}
                    >
                      <span className="icon-public icon" />Remove group image
                    </MenuItem> */}
                  </NavDropdown>
                </Nav>
              </div>
            ) : this.state.showJoinButton ? (
              <Button
                className="btn btn-white with-icon btn btn-default m-t-15"
                onClick={this.joinMember.bind(
                  this,
                  CONSTANTS.groupStatus.REQUESTED
                )}
              >
                <span className="icon-connections2" /> Join
              </Button>
            ) : this.state.userStatus !== CONSTANTS.groupStatus.ACCEPTED ? (
              <Button
                className="btn btn-white with-icon btn btn-default m-t-15"
                disabled
              >
                <span className="icon-connections2" /> {this.state.userStatus}
              </Button>
            ) : null}
          </div>

          {this.props.selectedGroup &&
          (this.state.groupOwner == this.props.userId ||
            (this.state.type === 'public' &&
              this.state.userStatus === CONSTANTS.groupStatus.ACCEPTED)) ? (
            <div className="custom-upload" style={{ height: 'auto' }}>
              <input
                type="file"
                onChange={this.handleImageChange.bind(this)}
                accept="image/*"
                value=""
              />
              <span className="icon-camera icon icon" />{' '}
              {groupImage ? 'Edit Group Photo' : 'Add Group Photo'}
            </div>
          ) : null}
        </div>
        {this.state.userStatus === CONSTANTS.groupStatus.INVITED ? (
          <div className="request--notification">
            <ul className="request--notification--list">
              <li>
                <a
                  className="accept"
                  onClick={this.updateMemeberStatus.bind(
                    this,
                    this.state.groupId,
                    CONSTANTS.groupStatus.ACCEPTED
                  )}
                >
                  <span className="icon-right_tick1" />
                  Accept Invitation
                </a>
              </li>
              <li>
                <a
                  onClick={this.updateMemeberStatus.bind(
                    this,
                    this.state.groupId,
                    CONSTANTS.groupStatus.REJECTED
                  )}
                >
                  <span className="icon-cross" />
                  Decline Invitation
                </a>
              </li>
            </ul>
          </div>
        ) : null}

        <div className="section-main mb-1 mt-1">
          <div className="flex align-center">
            <div className="section-main-title secondaryTitle">
              About Group
              <span />
            </div>
          </div>
          <p>
            {this.props.selectedGroup && this.props.selectedGroup.aboutGroup}
          </p>
          {/* <a href="#" className="link gray">
            view all
          </a> */}
        </div>
      </div>
    );
  }
}
const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionUpdateGroupInfo
    },
    dispatch
  );
};

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    groupListData: state.User.groupListData
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GroupInfo);
