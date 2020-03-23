import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import { Button, FormGroup, InputGroup, FormControl } from 'react-bootstrap';

//import HeaderBeforeLogin from './headerBeforeLogin';
import spikeViewApiService from '../core/api/apiService';
import { ZoomInAndOut, renderMessage } from '../commonFunctions';
import CONSTANTS from '../core/config/appConfig';
import Sidebar from '../authorization/sideBar';

let validationMessages = CONSTANTS.validationMessages;

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: ''
    };

    this.handleButtonState = this.handleButtonState.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);

    this.validatorTypes = strategy.createSchema(
      {
        email: 'required|email'
      },
      {
        'required.email': validationMessages.email.required,
        'email.email': validationMessages.email.invalid
      }
    );
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

  submitData = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleButtonState();
    }
  };

  handleButtonState() {
    let self = this;
    self.props.validate(function(error) {
      if (!error) {
        self.setState({ isLoading: true });
        self.handleSubmit();
      }
    });
  }

  handleSubmit() {
    let self = this;
    let email = self.state.email.toLowerCase().trim();
    spikeViewApiService('forgotPassword', { email })
      .then(response => {
        if (response.data.status === 'Success') {
          self.setState({ email: '', isLoading: false });
          setTimeout(() => {
            self.props.history.push('/');
          }, 4000);
        } else {
          self.setState({ isLoading: false });
        }
      })
      .catch(err => {
        self.setState({ isLoading: false });
        console.log(err);
      });
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div className="innerWrapper fullHeight">
        <Sidebar />
        <ToastContainer
          autoClose={5000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        />
        <div className="formContent">
          <div className="centeredBox p-5">
            <form className="forgotPasswordForm bg-transparent">
              <FormGroup>
                {/* <legend className="color-blue">
                  <Link to="/login">
                    <span className="icon-edit_pencil icon icon-shift" />
                  </Link>{' '}
                  Forgot Password
                </legend> */}

                <div className="flex align-center mb-1">
                  <Link to="/login" className="md-icon mr-1">
                    <span className="icon-back_arrow2" />
                  </Link>
                  <legend className="color-blue mb-0">Forgot Password</legend>
                </div>

                <p className="lead mb-50">
                  <strong>
                    Reset your password by filling in your email address. You
                    will then receive an email with new password.
                  </strong>
                </p>
              </FormGroup>
              <FormGroup className={this.getClasses('email')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-email" />
                  </InputGroup.Addon>
                  <FormControl
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={this.state.email}
                    onChange={this.handleChange}
                    autoComplete="off"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('email'))}
              </FormGroup>
              <FormGroup>
                <Button
                  bsStyle="primary"
                  className="centeredBtn btn-lg"
                  disabled={isLoading}
                  onClick={!isLoading ? this.handleButtonState : null}
                >
                  {isLoading ? 'In Progress...' : 'Reset'}
                </Button>
              </FormGroup>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ResetPassword = validation(strategy)(ResetPassword);
export default ResetPassword;
