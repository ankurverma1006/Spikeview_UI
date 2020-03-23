import React, { Component } from 'react';
import { Nav, Navbar, NavDropdown, MenuItem } from 'react-bootstrap';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ToastContainer } from 'react-toastify';
import spikeViewApiService from '../core/api/apiService';
import { ZoomInAndOut } from '../commonFunctions';
import { actionUserLogout } from '../core/redux/actions';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      access_token: '',
      firstName: '',
      fullName: '',
      showCPComponent: false,
      searchText: '',
      searchOptions: []
    };
  }

  componentWillMount() {
    let userInfo = this.props.user;
    if (userInfo) {
      if (userInfo.token) {
        let access_token = userInfo.token;
        if (userInfo.firstName) {
          let firstName = userInfo.firstName;
          let lastName = userInfo.lastName ? userInfo.lastName.charAt(0) : '';
          let fullName = userInfo.firstName.charAt(0) + lastName;
          this.setState({ firstName, fullName });
        }

        this.setState({ access_token: access_token });
      }
    }
  }

  componentDidMount() {
    //   window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = event => {
    var value = document.getElementsByClassName('myHeader').scrollTop;
    console.log(value);
  };

  logout = () => {
    this.props.actionUserLogout();
    this.props.history.push('/');
  };

  showCPComponent = () => {
    this.setState({
      showCPComponent: !this.state.showCPComponent
    });
  };

  handleSearch = name => {
    let self = this;
    spikeViewApiService('searchProfile', { name })
      .then(response => {
        if (response.data.status === 'Success') {
          let profileOptions = response.data.result;
          if (profileOptions.length > 0) {
            profileOptions = profileOptions.map(function(item) {
              let name = item.firstName + ' ' + item.lastName;
              return {
                value: item.userId,
                label: name
              };
            });
            console.log(profileOptions);
            self.setState({ profileOptions: profileOptions, isLoading: false });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleChange = value => {
    if (value.length > 0) {
      let userId = value[0].value;
      console.log(userId);
      if (userId) {
        this.props.history.push({
          pathname: '/student/profile',
          state: { userId: userId }
        });
      }
    }
  };

  render() {
    //navbar-fixed-top
    return (
      <Navbar className="myHeader" id="header">
        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        />
        <Navbar.Header>
          <Navbar.Brand>
            {/* <Link to="/student/recommendationrequest">Spike View</Link> */}
            Spike View
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>

        <Navbar.Collapse>
          <Nav className="navigation">
            <NavDropdown
              className="dropdown--right"
              title=""
              eventKey={3}
              fullname={this.state.fullName !== '' ? this.state.fullName : 'SV'}
              id="basic-nav-dropdown"
            >
              <MenuItem eventKey={3.4} onClick={this.logout}>
                Logout
              </MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
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
  return bindActionCreators({ actionUserLogout }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
