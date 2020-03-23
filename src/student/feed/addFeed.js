import React, { Component } from 'react';
import {
  FormGroup,
  FormControl,
  NavDropdown,
  MenuItem,
  Tab,
  Row,
  Col,
  Nav,
  NavItem,
  ResponsiveEmbed,
  Modal,
  Checkbox,
  Button
} from 'react-bootstrap';
import moment from 'moment';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import {
  isValidURL,
  showErrorToast,
  generateTimestamp,
  getThumbImage
} from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';
import spikeViewApiService from '../../common/core/api/apiService';

let AzureStorage = window.AzureStorage;

class AddFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postText: '',
      visiblity: 'Public',
      imageArray: [],
      imagePreview: [],
      imageData: [],
      videoFile: '',
      videoSelect: false,
      SVGLoader: false,
      connectionLoader: false,
      myConnections: [],
      connectionList: [],
      likeModal: false,
      disabled: true,
      isActive: '',
      submitClick: false,
      tagModal: false,
      clicked: false,
      videoIcon: false
    };
    this.userIdArr = [];
    this.tagConnection = [];
  }

  componentDidMount() {
    let userId = this.props.userId;
    let isActive = this.props.isActive;
    this.setState({ userId, isActive });
  }

  handler = e => {
    console.log(e);
    showErrorToast('Please wait, file is uploading...');
    e.stopPropagation();
    e.preventDefault();
  };

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
      submitClick: true
    });
    if (
      event.target.value.trim() !== '' ||
      this.state.imagePreview.length > 0 ||
      this.state.videoSelect === true
    ) {
      this.setState({
        disabled: false
      });
    } else {
      this.setState({
        disabled: true
      });
    }
  };

  handleSelect = eventKey => {
    this.setState({ visiblity: eventKey });
    if (eventKey === 'SelectedConnections') {
      this.setState({
        connectionLoader: true,
        likeModal: !this.state.likeModal
      });
      if (this.props.groupId) {
        this.getGroupMemberList(this.props.groupId);
      }else this.getMyConnections();
    }
  };

  getMyConnections = () => {
    let userId = this.state.userId;
    spikeViewApiService('getChatConnections', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let memberList = response.data.result.Accepted
            ? response.data.result.Accepted
            : [];

          this.setState({
            myConnections: memberList,
            connectionList: memberList,
            connectionLoader: false
          });
        }
      })
      .catch(err => {
        this.setState({ connectionLoader: false });
        console.log(err);
      });
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

  handleImageChange = event => {
    this.setState({ imageArray: [], imagePreview: [], submitClick: true });
    let imageArray = this.state.imageArray;
    const fileUpload = event.target.files;
    let _this = this;
    if (fileUpload.length > 0 && fileUpload.length < 9) {
      this.generateSASToken();
      this.setState({ disabled: false });
      for (var i = 0; i < fileUpload.length; i++) {
        const file = fileUpload[i];
        imageArray.push(file);
        let reader = new FileReader();
        reader.onload = function(e) {
          const data = e.target.result;
          _this.setState((prevState, props) => {
            prevState.imagePreview.push(data);
            return { imagePreview: prevState.imagePreview };
          });
        };
        reader.readAsDataURL(file);
      }
      this.setState({
        imageArray
      });
    } else {
      showErrorToast('A maximum of 8 photos can be uploaded at once');
    }
  };

  deleteImagePreview = event => {
    if (this.state.imagePreview.length > 0) {
      this.setState({
        imagePreview: [],
        imageArray: [],
        disabled: true,
        submitClick: false
      });
    }
  };

  handleVideoChange = event => {
    this.setState({
      videoFile: '',
      submitClick: true
    });
    let file = event.target.files[0];
    if (file) {
      this.generateSASToken();
      this.setState({
        videoSelect: true,
        videoFile: file,
        disabled: false
      });
      document
        .getElementById('videoDiv')
        .setAttribute('style', 'display: block;');
    }

    var source = document.getElementById('videoUpload');
    source.setAttribute('src', URL.createObjectURL(file));
    document.getElementById('videoPlayer').load();
  };

  deleteVideoPreview = () => {
    document.getElementById('videoDiv').setAttribute('style', 'display: none;');
    this.setState({
      videoFile: '',
      videoSelect: false,
      disabled: true,
      submitClick: false
    });
  };

  handleSubmit = event => {
    let postText = this.state.postText;
    let images = this.state.imageArray;
    let videoFile = this.state.videoFile;

    let _this = this;

    if (postText !== '' && images.length === 0 && videoFile === '') {
      _this.setState({
        SVGLoader: true,
        submitClick: false
      });
      _this.createFeed();
    }

    if (images.length > 0 && videoFile === '') {
      _this.setState({
        SVGLoader: true,
        submitClick: false
      });
      _this.uploadImages(images);
      setTimeout(function() {
        _this.createFeed();
      }, 5000);
    }

    if (images.length === 0 && videoFile) {
      _this.setState({
        SVGLoader: true,
        submitClick: false,
        videoIcon: false
      });
      _this.uploadVideo(videoFile);
      document.addEventListener('click', this.handler, true);
    }
  };

  createFeed = () => {
    let media = this.state.videoName;
    let postText = this.state.postText;
    let images = this.state.imageData;
    let visibility = this.state.visiblity;
    let dateTime = moment().valueOf();
    let postedBy = this.state.userId;
    let scope = this.userIdArr;
    let tags = this.tagConnection;
    let isActive = this.state.isActive;
    let _this = this;
    let groupId = this.props.groupId;
    let post = {
      text: postText,
      images: images,
      media: media
    };

    let lastActivityTime = dateTime;
    let lastActivityType = CONSTANTS.feedActivity.CREATEFEED;

    let data = {
      post,
      postedBy,
      dateTime,
      visibility,
      scope,
      isActive,
      tags,
      groupId,
      lastActivityTime,
      lastActivityType
    };

    spikeViewApiService('createFeed', data)
      .then(response => {
        if (response.data.status === 'Success') {
          _this.setState({
            postText: '',
            imagePreview: [],
            imageArray: [],
            imageData: [],

            visiblity: 'Public',
            videoSelect: false,
            videoFile: '',
            videoName: '',
            disabled: true,
            SVGLoader: false
          });
          _this.userIdArr = [];
          _this.tagConnection = [];
          _this.props.refreshFeeds();

          document
            .getElementById('videoDiv')
            .setAttribute('style', 'display: none;');
        }
      })
      .catch(err => {
        _this.setState({
          SVGLoader: false
        });
        console.log(err);
      });
  };

  uploadVideo = videoFile => {
    if (videoFile) {
      let sasToken = this.state.sasToken;
      let userId = this.state.userId;
      let _this = this;

      const blobService = AzureStorage.Blob.createBlobServiceWithSas(
        CONSTANTS.azureBlobURI,
        sasToken
      );

      let videoName = generateTimestamp(videoFile.name);
      let uploadPath = `sv_${userId}/${CONSTANTS.feedAlbum}/${videoName}`;
      _this.setState({
        videoName: uploadPath
      });

      blobService.createBlockBlobFromBrowserFile(
        CONSTANTS.azureContainer,
        uploadPath,
        videoFile,
        (error, result) => {
          if (result) {
            console.log('video uploaded', result);
            _this.createFeed();
            _this.setState({
              videoIcon: false
            });
            document.removeEventListener('click', _this.handler, true);
          }
          if (error) {
            console.log('error ', error);
          }
        }
      );
    }
  };

  uploadImages(mediaObject) {
    let sasToken = this.state.sasToken;
    let userId = this.state.userId;
    let imageData = [];
    let self = this;

    const blobService = AzureStorage.Blob.createBlobServiceWithSas(
      CONSTANTS.azureBlobURI,
      sasToken
    );

    function uploadFiles(uploadArray) {
      let albumName = CONSTANTS.feedAlbum;
      for (var index = 0; index < uploadArray.length; index++) {
        if (isValidURL(uploadArray[index]) === true) {
          let path = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/`;
          if (albumName === CONSTANTS.feedAlbum) {
            let imageName = uploadArray[index].replace(path, '');
            imageData.push(imageName);
          }
        } else {
          let fileName = generateTimestamp(uploadArray[index].name);
          let uploadPath = `sv_${userId}/${albumName}/${fileName}`;
          imageData.push(uploadPath);
          blobService.createBlockBlobFromBrowserFile(
            CONSTANTS.azureContainer,
            uploadPath,
            uploadArray[index],
            (error, result) => {
              if (result) {
                console.log(result);
              }
              if (error) {
                console.log('error ', error);
              }
            }
          );
        }
      }
      self.setState({ imageData: imageData });
    }
    uploadFiles(mediaObject);
  }

  likeModal = () => {
    this.setState({ likeModal: !this.state.likeModal });
  };

  tagModal = action => {
    console.log('this.tagConnection ', this.tagConnection);

    if (action === 1) {
      //    this.tagConnection = [];
      this.setState({ tagModal: !this.state.tagModal });
    } else {
      if (this.state.tagModal === false) {
        if (this.props.groupId) {
          this.getGroupMemberList(this.props.groupId);
        } else this.getMyConnections();
      }

      this.setState({ tagModal: !this.state.tagModal });
    }
  };

  getGroupMemberList(groupId) {
    console.log('add feed groupId --- ' + groupId);
    spikeViewApiService('getGroupMemberListByGroupId', { groupId })
      .then(response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let groupMemberList = response.data.result.members;
          groupMemberList = this.setState({
            groupMemberList
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  selectMember = (connectionId, index, event) => {
    let myConnections = this.state.groupMemberList;
    if (event.target.checked) {
      myConnections[index]['checked'] = true;
      this.tagConnection.push({ userId: connectionId });
    } else {
      let filtered = _.filter(this.tagConnection, function(connection) {
        return connection.userId !== connectionId;
      });
      myConnections[index]['checked'] = false;
      this.tagConnection = filtered;
    }
    this.setState({ groupMemberList: myConnections });
  };

  handleCheck = (connectionId, event) => {
    if (event.target.checked) {
      this.userIdArr.push(connectionId);
    } else {
      var index = this.userIdArr.indexOf(connectionId);
      if (index !== -1) this.userIdArr.splice(index, 1);
    }
  };

  handleTagConnection = (connectionId, index, event) => {
    if (event.target.checked) {
      this.tagConnection.push({ userId: connectionId });
    } else {
      var filtered = _.filter(this.tagConnection, function(connection) {
        return connection.userId !== connectionId;
      });
      this.tagConnection = filtered;
    }

    this.tagConnection = _.uniqBy(this.tagConnection, 'userId');
    // this is for tagConnection post--
    this.setState({ myConnections: this.state.myConnections });
    console.log(this.tagConnection);
  };

  filterList = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }

    let updatedList = this.state.myConnections;
    if (event.target.value.length === 1) {
      updatedList = this.state.connectionList;
    }

    if (event.target.value.trim()) {
      updatedList = _.filter(updatedList, function(item) {
        return (
          _
            .toLower(item.partner.firstName || item.partner.lastName)
            .search(event.target.value.toLowerCase()) !== -1
        );
      });
      console.log(updatedList);

      this.setState({
        myConnections: updatedList,
        searchText: event.target.value
      });
    } else {
      this.setState({
        myConnections: this.state.connectionList,
        searchText: ''
      });
    }
  };

  searchBoxClick = action => {
    if (action === 1) {
      this.setState({
        clicked: true
      });
    }

    if (action === 2) {
      this.setState({
        clicked: false,
        searchText: '',
        myConnections: this.state.connectionList
      });
    }
  };

  render() {
    let imgTotal = this.state.imagePreview.length;
    var className = '';
    if (imgTotal === 1) {
      className = '';
    } else if (imgTotal === 2) {
      className = 'tiles tiles-2';
    } else if (imgTotal === 3) {
      className = 'tiles tiles-3';
    } else if (imgTotal === 4) {
      className = 'tiles tiles-4';
    } else if (imgTotal > 4) {
      className = 'tiles tiles-4';
    }

    return (
      <div className="postWrapper">
        <Tab.Container id="tabs-with-dropdown" defaultActiveKey="first">
          <Row className="clearfix">
            <Col sm={12}>
              <Nav bsStyle="tabs" className="tabs pw--tabLinks">
                <NavItem eventKey="first">
                  <span className="icon-book1 icon" /> Write a Post
                </NavItem>
                <NavItem eventKey="second">
                  <span className="icon-gallery icon" />
                  Post Photos/Videos
                </NavItem>
              </Nav>
            </Col>
            <Col sm={12}>
              <Tab.Content animation>
                <Tab.Pane eventKey="first">
                  <div className="pw-tabContent">
                    <FormGroup controlId="formControlsTextarea">
                      <FormControl
                        componentClass="textarea"
                        placeholder="What's on your mind?"
                        name="postText"
                        value={this.state.postText}
                        onChange={this.handleChange}
                        autoComplete="off"
                        maxLength="2000"
                      />
                    </FormGroup>

                    <div className="pw-postBody">
                      {this.state.imagePreview &&
                      this.state.imagePreview.length > 0 ? (
                        <div className="post-img-with-close">
                          <a
                            className="close"
                            onClick={this.deleteImagePreview}
                          >
                            <span className="icon-cross" />
                          </a>

                          <div className={className}>
                            {this.state.imagePreview
                              .slice(0, 4)
                              .map((image, index) => (
                                <a
                                  className={
                                    index === 3 ? 'img-count--wrapper' : ''
                                  }
                                  key={index}
                                >
                                  <img
                                    className="object-fit-cover"
                                    src={image}
                                    alt={index}
                                  />

                                  {index === 3 &&
                                  this.state.imagePreview.length > 4 ? (
                                    <a className="img-count--value">
                                      {`+ ${this.state.imagePreview.length -
                                        4}`}
                                    </a>
                                  ) : (
                                    ''
                                  )}
                                </a>
                              ))}
                          </div>
                        </div>
                      ) : (
                        ''
                      )}
                    </div>

                    <div
                      className="pw-postBody"
                      style={{ display: 'none' }}
                      id="videoDiv"
                    >
                      <div className="post-img-with-close">
                        <a className="close" onClick={this.deleteVideoPreview}>
                          <span className="icon-cross" />
                        </a>
                        <div style={{ width: 100 + '%', height: 'auto' }}>
                          <ResponsiveEmbed a16by9>
                            <video controls id="videoPlayer">
                              <source type="video/mp4" id="videoUpload" />
                            </video>
                          </ResponsiveEmbed>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
        <div className="pw-postControls">
          <div className="pw-pc--wrapper">
            {this.state.imagePreview.length === 0 &&
            this.state.videoSelect === false ? (
              <div className="pw-pc--left">
                <div className="custom-upload">
                  <input
                    type="file"
                    onChange={this.handleImageChange}
                    accept="image/*"
                    multiple
                    id="fileupload"
                  />
                  <span className="icon-camera_home icon" />
                </div>

                <div
                  className={`custom-upload  ${
                    this.state.videoIcon === true ? 'disabled' : ''
                  }`}
                >
                  <input
                    type="file"
                    onChange={
                      this.state.videoIcon === true
                        ? ''
                        : this.handleVideoChange
                    }
                    accept="video/*"
                  />
                  <span className="icon-video icon" />
                </div>

                {/* <div
                  className={`custom-upload  ${
                    this.state.disabled === true ? 'disabled' : ''
                  }`}
                > */}
                <div className="custom-upload">
                  <span
                    className="icon-tagging icon"
                    onClick={this.tagModal}
                    //onClick={this.state.disabled === true ? '' : this.tagModal}
                  />
                </div>
              </div>
            ) : (
              ''
            )}

            <div className="pw-pc--right">
              {!this.props.groupId ? (
                <div className="customDropdownWrapper with-icon">
                  {this.state.visiblity === 'Private' ? (
                    <span className="icon-private icon " />
                  ) : this.state.visiblity === 'Public' ? (
                    <span className="icon-public icon" />
                  ) : this.state.visiblity === 'AllConnections' ? (
                    <span className="icon-all_connections icon" />
                  ) : this.state.visiblity === 'SelectedConnections' ? (
                    <span className="icon-selected_connections icon">
                      <span className="path1" />
                      <span className="path2" />
                      <span className="path3" />
                    </span>
                  ) : (
                    ''
                  )}
                  <ul className="customDropdown">
                    <NavDropdown
                      eventKey="3"
                      title={this.state.visiblity}
                      id="nav-dropdown-within-tab"
                    >
                      <MenuItem eventKey="Private" onSelect={this.handleSelect}>
                        <span className="icon-private icon " />
                        Private
                      </MenuItem>

                      <MenuItem eventKey="Public" onSelect={this.handleSelect}>
                        <span className="icon-public icon" />
                        Public
                      </MenuItem>

                      <MenuItem
                        eventKey="AllConnections"
                        onSelect={this.handleSelect}
                      >
                        <span className="icon-all_connections icon" />
                        All connections
                      </MenuItem>

                      <MenuItem
                        eventKey="SelectedConnections"
                        onSelect={this.handleSelect}
                      >
                        <span className="icon-selected_connections icon">
                          <span className="path1" />
                          <span className="path2" />
                          <span className="path3" />
                        </span>
                        selected connections
                      </MenuItem>
                    </NavDropdown>
                  </ul>
                </div>
              ) : null}

              <a
                className={`action--send btn  ${
                  this.state.disabled === true ? 'disabled' : ''
                }`}
                onClick={
                  this.state.submitClick === true ? this.handleSubmit : null
                }
              >
                {this.state.SVGLoader === false ? (
                  <span className="icon-post1 icon" />
                ) : (
                  <img
                    className="ml-1"
                    src="../assets/img/svg-loaders/three-dots.svg"
                    width="40"
                    alt="loader"
                  />
                )}
              </a>
            </div>
          </div>
        </div>
        <Modal show={this.state.likeModal} onHide={this.likeModal}>
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              My Connections
            </Modal.Title>
            <form
              className={`animated-serachbar ${
                this.state.clicked === true ? 'open' : ''
              }`}
            >
              <input
                className="form-control animated-serachbar--input"
                autoComplete="off"
                type="text"
                name="searchText"
                value={this.state.searchText}
                placeholder="Search"
                onChange={this.filterList}
                onKeyPress={this.filterList}
                onClick={this.searchBoxClick.bind(this, 1)}
              />
              <button
                type="button"
                className="close"
                onClick={this.searchBoxClick.bind(this, 2)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
              <input
                className="form-control animated-serachbar--input"
                type="submit"
              />
            </form>
          </Modal.Header>
          <Modal.Body className="height--425">
            <ul className="likedBy--user">
              {this.state.myConnections && this.state.myConnections.length > 0
                ? this.state.myConnections.map((connection, index) => (
                    <li key={index}>
                      <div className="u--topDetails">
                        <div className="user-icon">
                          {connection.partner.profilePicture ? (
                            <img
                              className="object-fit-cover"
                              src={getThumbImage(
                                'small',
                                connection.partner.profilePicture
                              )}
                              alt=""
                            />
                          ) : (
                            <span class="icon-user_default2" />
                          )}
                        </div>
                        <div className="user-details">
                          <div className="ud--wrapper">
                            <div>
                              {connection.partner.roleId === 1 ? (
                                <Link
                                  to={{
                                    pathname:
                                      '/student/profile/' +
                                      connection.partner.userId
                                  }}
                                >
                                  <div className="u--name">
                                    {connection.partner.firstName || ''}{' '}
                                    {connection.partner.lastName || ''}
                                  </div>
                                </Link>
                              ) : (
                                <Link
                                  to={{
                                    pathname:
                                      '/parent/profile/' +
                                      connection.partner.userId
                                  }}
                                >
                                  <div className="u--name">
                                    {connection.partner.firstName || ''}{' '}
                                    {connection.partner.lastName || ''}
                                  </div>
                                </Link>
                              )}

                              <div className="u--designation">
                                {connection.partner.title || ''}
                              </div>
                            </div>

                            <div className="ud--right">
                              <Checkbox
                                className="checkbox-primary rounded m-0"
                                name="connections"
                                id={`connect_${connection.connectId}`}
                                value={connection.partner.userId}
                                onChange={this.handleCheck.bind(
                                  this,
                                  connection.partner.userId
                                )}
                              >
                                <span className="check" />
                              </Checkbox>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                : ''}
            </ul>

            {this.state.connectionLoader === true ? (
              <div className="loading-wrapper">
                <img
                  className="ml-1"
                  src="../assets/img/svg-loaders/three-dots.svg"
                  width="40"
                  alt="loader"
                />
              </div>
            ) : (
              ''
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="primary"
              className="no-bold no-round"
              onClick={this.likeModal.bind(this, '')}
            >
              OK
            </Button>

            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.likeModal.bind(this, '')}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Tag Modal */}
        <Modal show={this.state.tagModal} onHide={this.tagModal.bind(this, 1)}>
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              My Connections
            </Modal.Title>
            <form
              className={`animated-serachbar ${
                this.state.clicked === true ? 'open' : ''
              }`}
            >
              <input
                className="form-control animated-serachbar--input"
                autoComplete="off"
                type="text"
                name="searchText"
                value={this.state.searchText}
                placeholder="Search"
                onChange={this.filterList}
                onKeyPress={this.filterList}
                onClick={this.searchBoxClick.bind(this, 1)}
              />
              <button
                type="button"
                className="close"
                onClick={this.searchBoxClick.bind(this, 2)}
              >
                <span aria-hidden="true">×</span>
                <span className="sr-only">Close</span>
              </button>
              <input
                className="form-control animated-serachbar--input"
                type="submit"
              />
            </form>
          </Modal.Header>
          <Modal.Body className="height--425">
            <ul className="likedBy--user">
              {!this.props.groupId
                ? this.state.myConnections &&
                  this.state.myConnections.length > 0
                  ? this.state.myConnections.map((connection, index) => {
                      let checkbox = false;
                      let tagConnection = this.tagConnection;
                      let checkboxIndex = tagConnection.findIndex(
                        tag => tag.userId == connection.partner.userId
                      );
                      if (checkboxIndex !== -1) checkbox = true;
                      else checkbox = false;
                      return (
                        <li key={index}>
                          <div className="u--topDetails">
                            <div className="user-icon">
                              {connection.partner.profilePicture ? (
                                <img
                                  className="object-fit-cover"
                                  src={getThumbImage(
                                    'small',
                                    connection.partner.profilePicture
                                  )}
                                  alt=""
                                />
                              ) : (
                                <span className="icon-user_default2" />
                              )}
                            </div>
                            <div className="user-details">
                              <div className="ud--wrapper">
                                <div>
                                  {connection.partner.roleId === 1 ? (
                                    <Link
                                      to={{
                                        pathname:
                                          '/student/profile/' +
                                          connection.partner.userId
                                      }}
                                    >
                                      <div className="u--name">
                                        {connection.partner.firstName || ''}{' '}
                                        {connection.partner.lastName || ''}
                                      </div>
                                    </Link>
                                  ) : (
                                    <Link
                                      to={{
                                        pathname:
                                          '/parent/profile/' +
                                          connection.partner.userId
                                      }}
                                    >
                                      <div className="u--name">
                                        {connection.partner.firstName || ''}{' '}
                                        {connection.partner.lastName || ''}
                                      </div>
                                    </Link>
                                  )}

                                  <div className="u--designation">
                                    {connection.partner.title || ''}
                                  </div>
                                </div>
                                <div className="ud--right">
                                  <Checkbox
                                    className="checkbox-primary rounded m-0"
                                    name="connections"
                                    id={`connect_${connection.connectId}`}
                                    value={connection.partner.userId}
                                    onChange={this.handleTagConnection.bind(
                                      this,
                                      connection.partner.userId,
                                      index
                                    )}
                                    checked={checkbox}
                                  >
                                    <span className="check" />
                                  </Checkbox>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  : ''
                : this.state.groupMemberList &&
                  this.state.groupMemberList.length > 0
                  ? this.state.groupMemberList.map((connection, index) => {
                      let checkbox = false;
                      let tagConnection = this.tagConnection;
                      let checkboxIndex = tagConnection.findIndex(
                        tag => tag.userId == connection.userId
                      );
                      if (checkboxIndex !== -1) {
                        checkbox = true;
                      } else checkbox = false;
                      return connection.status ===
                        CONSTANTS.groupStatus.ACCEPTED ? (
                        <li key={index}>
                          <div className="u--topDetails">
                            <div className="user-icon">
                              {connection.profilePicture ? (
                                <img
                                  className="object-fit-cover"
                                  src={getThumbImage(
                                    'small',
                                    connection.profilePicture
                                  )}
                                  alt=""
                                />
                              ) : (
                                <span className="icon-user_default2" />
                              )}
                            </div>
                            <div className="user-details">
                              <div className="ud--wrapper">
                                {connection.roleId === 1 ? (
                                  <Link
                                    to={{
                                      pathname:
                                        '/student/profile/' + connection.userId
                                    }}
                                  >
                                    <div className="u--name">
                                      {connection.firstName || ''}{' '}
                                      {connection.lastName || ''}
                                    </div>
                                  </Link>
                                ) : (
                                  <Link
                                    to={{
                                      pathname:
                                        '/parent/profile/' + connection.userId
                                    }}
                                  >
                                    <div className="u--name">
                                      {connection.firstName || ''}{' '}
                                      {connection.lastName || ''}
                                    </div>
                                  </Link>
                                )}

                                <div className="u--designation">
                                  {connection.title || ''}
                                </div>

                                <div className="ud--right">
                                  <Checkbox
                                    className="checkbox-primary rounded m-0"
                                    name="connections"
                                    checked={connection.checked ? true : false}
                                    id={`connect_${connection.connectId}`}
                                    value={connection.userId}
                                    onChange={this.selectMember.bind(
                                      this,
                                      connection.userId,
                                      index
                                    )}
                                    checked={checkbox}
                                  >
                                    <span className="check" />
                                  </Checkbox>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ) : null;
                    })
                  : ''}
            </ul>

            {this.state.connectionLoader === true ? (
              <div className="loading-wrapper">
                <img
                  className="ml-1"
                  src="../assets/img/svg-loaders/three-dots.svg"
                  width="40"
                  alt="loader"
                />
              </div>
            ) : (
              ''
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="primary"
              className="no-bold no-round"
              onClick={this.tagModal.bind(this, '')}
            >
              OK
            </Button>

            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.tagModal.bind(this, 1)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default AddFeed;
