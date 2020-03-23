import React, { Component } from 'react';
import { Nav, Navbar, NavItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';

class Header extends Component {
  render() {
    return (
      <Navbar className="myHeader">
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/login">Spike View</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav className="navigation">
            <NavItem
              eventKey={1}
              onClick={() => this.props.history.push('/login')}
            >
              SIGN IN
            </NavItem>
            <NavItem
              eventKey={1}
              onClick={() => this.props.history.push('/signup')}
            >
              SIGN UP
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
export default Header;
