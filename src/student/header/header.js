import React, { Component } from 'react';
import {
  Nav,
  Navbar,
  NavItem,
  NavDropdown,
  MenuItem,
  FormGroup,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ToastContainer } from 'react-toastify';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import _ from 'lodash';

import spikeViewApiService from '../../common/core/api/apiService';
import {
  ZoomInAndOut,
  getThumbImage,
  getLocalStorage,
  limitCharacter
} from '../../common/commonFunctions';
import SearchUserList from '../../common/searchDropdown/searchUserList';
import ChangePassword from '../../common/changePassword/changePassword';
import {
  actionUserLogout,
  actionGetHeaderCount,
  actionUpdateHeaderCount,
  actionChangePasswordStatus
} from '../../common/core/redux/actions';
import userDefaultImage from '../../assets/img/default-img.PNG';

let AsyncTypeahead = asyncContainer(Typeahead);
var keyCheck=false,renderChangeMenu=false;
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      access_token: '',
      firstName: '',
      fullName: '',
      showCPComponent: false,
      searchKey: '',
      searchOptions: [],
      isLoading: false,
      focused: false,
      headerCount: {},
      isPasswordChanged: false,
      connectionCount: '',
      messagingCount: '',
      notificationCount: '',
      profileImage: ''
    };
    this.routeMessage = this.routeMessage.bind(this);

    if (this.props.headerCount) {
      this.state = {
        connectionCount:
          this.props.headerCount && this.props.headerCount.connectionCount
            ? this.props.headerCount.connectionCount
            : '',
        messagingCount:
          this.props.headerCount && this.props.headerCount.messagingCount
            ? this.props.headerCount.messagingCount
            : '',
        notificationCount:
          this.props.headerCount && this.props.headerCount.notificationCount
            ? this.props.headerCount.notificationCount
            : ''
      };
    } else {
      this.getHeaderCount();
    }
  }

  componentWillReceiveProps(nextProps) {
    try {
      let searchKey = nextProps.props.location.state.searchKey;
      this.setState({ searchKey });
    } catch (error) {}

    let userInfo = nextProps.user;
    // if (userInfo && (userInfo.roleId === 2 || userInfo.roleId === 1)) {
    if (userInfo.token) {
      let access_token = userInfo.token;
      if (userInfo.firstName) {
        let firstName = userInfo.firstName;
        let lastName = userInfo.lastName ? userInfo.lastName.charAt(0) : '';
        let fullName = userInfo.firstName.charAt(0) + lastName;
        let roleId = userInfo.roleId;
        let isPasswordChanged = userInfo.isPasswordChanged;
        let profileImage = userInfo.profilePicture;
        if (profileImage) {
          profileImage = getThumbImage('small', profileImage);
        }
        this.setState({
          firstName,
          fullName,
          profileImage,
          roleId,
          isPasswordChanged
        });
      }
      this.setState({ access_token: access_token });
    }
    // } else {
    //   this.props.history.push('/');
    // }
  }

  componentWillMount() {
    let userInfo = this.props.user;
    // if (userInfo && (userInfo.roleId === 2 || userInfo.roleId === 1)) {
    if (userInfo.token) {
      let access_token = userInfo.token;
      if (userInfo.firstName) {
        let firstName = userInfo.firstName;
        let lastName = userInfo.lastName ? userInfo.lastName.charAt(0) : '';
        let fullName = userInfo.firstName.charAt(0) + lastName;
        let roleId = userInfo.roleId;
        let userId = userInfo.userId;
        let isPasswordChanged = userInfo.isPasswordChanged;
        let profileImage = userInfo.profilePicture;
        if (profileImage) {
          profileImage = getThumbImage('small', profileImage);
        }
        this.setState({
          userId,
          firstName,
          fullName,
          profileImage,
          roleId,
          isPasswordChanged
        });
      }
      this.setState({ access_token: access_token });
    }
    // } else {
    //   this.props.history.push('/');
    // }
  }

  getHeaderCount() {
    let userId = this.props.user.userId;
    this.props.actionGetHeaderCount(userId).then(response => {
      if (
        response.payload &&
        response.payload.data &&
        response.payload.data.result[0]
      ) {
        let headerCount = response.payload.data.result[0];
        this.setState({
          connectionCount: headerCount.connectionCount,
          messagingCount: headerCount.messagingCount,
          notificationCount: headerCount.notificationCount
        });
      }
    });
  }

  componentDidMount() {
    if (this.props && this.props.location && this.props.location.state) {
      let searchKey = this.props.location.state.searchKey;
      if (searchKey) {
        this.setState({ searchKey });
      }
    }

    //window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = event => {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 100
    ) {
      document.getElementById('header').className = 'myHeader navbar-fixed-top';
    } else {
      document.getElementById('header').className = 'myHeader';
    }
  };

  logout = () => {
    this.props.actionUserLogout();
    this.props.history.push('/');
  };

  showCPComponent = () => {
    // this.props.actionChangePasswordStatus();
    this.setState({
      showCPComponent: !this.state.showCPComponent
    });
  };


  
  handleSearch = name => {
    var filter = /^[A-Za-z\s]+$/;
    if (!filter.test(name.trim())) return false;
    let self = this;
    self.setState({ searchText: 'Searching..', searchKey: name.trim() });
    spikeViewApiService('searchProfile', { name })
      .then(response => {
        if (response.data.status === 'Success') {
          let profileOptions = response.data.result;

          if (profileOptions.length > 0) {
            profileOptions = _.filter(profileOptions, function(o) {
              return o.userId !== self.props.user.userId;
            });
            console.log(profileOptions);
            profileOptions = profileOptions.map(function(item) {
              let name = item.firstName
                ? item.firstName + ' ' + (item.lastName ? item.lastName : '')
                : item.groupName;
              return {
                value: item.userId
                  ? item.userId
                  : item.groupId
                    ? item.groupId
                    : '',
                label: name,
                email: item.email ? item.email : '',
                summary: item.summary ? item.summary : '',
                picture: item.profilePicture
                  ? item.profilePicture
                  : item.groupImage
                    ? item.groupImage
                    : '',
                roleId: item.roleId,
                groupDetail: item.groupId ? item : null
              };
            });

            self.setState({ profileOptions: profileOptions, isLoading: false });
          } else {
            self.setState({
              searchText: 'No matches found',
              profileOptions: [],
              isLoading: false
            });
          }
        }
      })
      .catch(err => {
        self.setState({
          searchText: 'No matches found',
          profileOptions: [],
          isLoading: false
        });
        console.log(err);
      });
  };

  handleChangeRenderMenu = value => {  
    if (value.length > 0) {
      this.showProfileDashboard(value);
    }
    renderChangeMenu=true;        
  }; 

    showProfileDashboard(value){
      let userId = value[0].value;
      let name = value[0].label;
      let roleId = value[0].roleId;
      if (userId && !roleId) {
        this.props.history.push({
          pathname: '/student/groupFeed',
          state: {
            groupId: value[0].groupDetail ? value[0].groupDetail.groupId : ''
          }
        });
      }

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



  onFocus = () => {
    this.setState({
      focused: true
    });
  };

  onBlur = () => {
    this.setState({
      focused: false
    });
  };

  handleChange = value => {
    if (value.length > 0) {
      this.showProfileDashboard(value);
    }   
    if(renderChangeMenu==false)
                keyCheck= true;      
  };

  searchData = event => {   
    let _this = this;
    if (
      event.key === 'Enter' &&
      this.state.searchKey &&
      this.state.searchKey.length >= 3
    ) {
      setTimeout(function() {
         if(keyCheck!==true) {
           _this.props.history.push({
          pathname: '/search/user',
          state: {
            profileOptions: _this.state.profileOptions
          }
        });
      }
      keyCheck=false;
      }, 800);
    }
  };

  routeMessage = link => {
    let data = {};
    if (link === 'connections') {
      data = this.props.headerCount;
      data['connectionCount'] = '0';
      this.props.actionUpdateHeaderCount(data);
      this.props.history.push('/student/connections');
    } else if (link === 'messages') {
      data = this.props.headerCount;
      data['messagingCount'] = '0';
      this.props.actionUpdateHeaderCount(data);
      this.props.history.push('/student/messages');
    } else {
      data = this.props.headerCount;
      let notificationBellCount = this.props.headerCount.notificationCount;
      data['notificationCount'] = '0';
      this.props.actionUpdateHeaderCount(data);
      this.props.history.push({
        pathname: '/student/notifications',
        state: { notificationBellCount: notificationBellCount }
      });
    }
  };

  searchInputChange = name => {
    var filter = /^[A-Za-z\s]+$/;
    if (!filter.test(name)) return false;
    this.setState({
      searchKey: name
    });
  };

  render() {
    return (
      <Navbar className="myHeader" id="header">
        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
          closeOnClick={true}
        />
        <Navbar.Header>
          <Navbar.Brand>
            {this.props.parent ? (
              <Link to="/parent/dashboard">Spike View </Link>
            ) : this.state.roleId !== 3 ? (
              <Link to="/student/profile">Spike View </Link>
            ) : (
              'Spike View'
            )}
          </Navbar.Brand>
        </Navbar.Header>

        <Navbar.Toggle />

        <div className="header-inner--wrapper">
          <FormGroup
            className={
              this.state.focused === true
                ? 'searchBox rounded open'
                : 'searchBox rounded'
            }
          >
            {this.state.roleId !== 3 ? (
              <InputGroup>
                <InputGroup.Addon>
                  <span className="icon-search" />
                </InputGroup.Addon>
                <AsyncTypeahead
                  minLength={3}
                  isLoading={false}
                  labelKey={'label'}
                  placeholder="Search"
                  onSearch={this.handleSearch}
                  options={this.state.profileOptions}
                  name="searchKey"
                  value={this.state.searchKey}
                  onChange={this.handleChange}
                  searchText={this.state.searchText}
                  className="form-control"
                  defaultInputValue={this.state.searchKey}
                  onFocus={this.onFocus}
                  onBlur={this.onBlur}
                  onKeyDown={this.searchData}
                  renderMenuItemChildren={(option, props) => (
                    <div  onClick={this.handleChangeRenderMenu}>
                     {(option.groupDetail 
                       && !option.picture) ? <span className="icon-all_connections s-p-icon"></span>                       
                       :
                     <img
                        alt={userDefaultImage}
                        src={
                          option.picture ? getThumbImage('small', option.picture) : 
                           userDefaultImage
                        }
                        style={{
                          height: '24px',
                          marginRight: '10px',
                          width: '24px'
                        }}
                      />                   
                     }
                       <OverlayTrigger
                          key="bottom"
                          placement="bottom"
                          overlay={
                            <Tooltip id="bottom">
                              {option.label}
                            </Tooltip>
                          }
                        >  
                      
                        <span className="wrap-long-words">                 
                        {limitCharacter(option.label, 12)}   </span>
                        </OverlayTrigger>    
                      
                  </div>                  
                   //   <SearchUserList user={option} />
                  )}
                />
              </InputGroup>
            ) : null}
          </FormGroup>
          {this.state.roleId !== 3 ? (
            <Navbar.Collapse className="navigation--wrapper">
              <Nav className="navigation">
                <NavItem
                  eventKey={1}
                  //   href="/student/feed"
                  onClick={() => this.props.history.push('/student/feed')}
                  title="Home"
                  target="_blank"
                >
                  <span className="icon-home2" />
                  <span className="link--text">Feeds</span>
                  {/* <span className="noti--count">1</span> */}
                </NavItem>

                <NavItem
                  eventKey={1}
                  onClick={() => this.routeMessage('connections')}
                  title="Connections"
                >
                  <span className="icon-connections2" />
                  <span className="link--text">Connections</span>
                  {this.state.connectionCount ? (
                    <span className="noti--count">
                      {this.state.connectionCount}
                    </span>
                  ) : null}
                </NavItem>

                <NavItem
                  eventKey={1}
                  onClick={() => this.routeMessage('messages')}
                  title="Messaging"
                >
                  <span className="icon-message" />
                  <span className="link--text">messaging</span>
                  {this.state.messagingCount ? (
                    <span className="noti--count">
                      {this.state.messagingCount}
                    </span>
                  ) : null}
                </NavItem>

                <NavItem
                  eventKey={1}
                  onClick={() => this.routeMessage('notifications')}
                  title="Notifications"
                >
                  <span className="icon-noti" />
                  <span className="link--text">notifications</span>
                  {this.state.notificationCount ? (
                    <span className="noti--count">
                      {this.state.notificationCount}
                    </span>
                  ) : null}
                </NavItem>

                {this.props.parent ? (
                  <NavItem
                    eventKey={1}
                    className="dropdown--right"
                    title={
                      <div className="dp">
                        {!this.state.profileImage ? (
                          <img
                            className="object-fit-cover"
                            src={this.state.profileImage}
                            alt=""
                          />
                        ) : this.state.fullName !== '' ? (
                          this.state.fullName
                        ) : (
                          'SV'
                        )}
                      </div>
                    }
                    id="basic-nav-dropdown"
                  />
                ) : (
                  <NavDropdown
                    className="dropdown--right"
                    title={
                      <div className="dp">
                        {this.state.profileImage ? (
                          <img
                            className="object-fit-cover"
                            src={this.state.profileImage}
                            alt=""
                          />
                        ) : this.state.fullName !== '' ? (
                          this.state.fullName
                        ) : (
                          'SV'
                        )}
                      </div>
                    }
                    eventKey={3}
                    id="basic-nav-dropdown"
                  >
                    <MenuItem
                      eventKey={3.1}
                      onClick={() =>
                        this.props.history.push('/student/personalinfo')
                      }
                    >
                      <span className="icon-edit_pencil icon" /> Edit Profile
                    </MenuItem>

                    <MenuItem
                      eventKey={3.1}
                      onClick={() =>
                        this.props.history.push('/student/profile')
                      }
                    >
                      <span className="icon-user icon" /> View Profile
                    </MenuItem>

                    <MenuItem
                      eventKey={3.1}
                      onClick={
                        () =>
                          this.props.history.push({
                            pathname: '/student/profilelog',
                            state: { profileOwner: this.state.userId }
                          })
                        //</NavDropdown>this.props.history.push('/student/profilelog')
                      }
                    >
                      <i className="m-ico icon-profile-sharing" /> Profile
                      Sharing Log
                    </MenuItem>

                    <MenuItem eventKey={3.1} onClick={this.showCPComponent}>
                      <span className="icon-password icon" /> Change Password
                    </MenuItem>

                    {this.state.showCPComponent ||
                    (this.state.isPasswordChanged === false &&
                      getLocalStorage('isPasswordPopupClose') !== true) ? (
                      <ChangePassword
                        closeCPComponent={this.showCPComponent}
                        isPasswordChanged={this.state.isPasswordChanged}
                        {...this.props}
                      />
                    ) : null}
                    <MenuItem eventKey={3.4} onClick={this.logout}>
                      <span className="icon-logout icon" /> Logout
                    </MenuItem>
                  </NavDropdown>
                )}
              </Nav>
            </Navbar.Collapse>
          ) : null}
        </div>
      </Navbar>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    parent: state.User.parentData,
    headerCount: state.User.headerCount
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionUserLogout,
      actionGetHeaderCount,
      actionUpdateHeaderCount,
      actionChangePasswordStatus
    },
    dispatch
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
