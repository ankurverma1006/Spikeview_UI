import React, { Component } from 'react';
import {
  Button,
  FormGroup,
  InputGroup,
  FormControl,
  Modal,
  ButtonToolbar,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import classnames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import spikeViewApiService from '../core/api/apiService';
import {
  renderMessage,
  encrypt,
  decrypt,
  setLocalStorage
} from '../commonFunctions';
import CONSTANTS from '../core/config/appConfig';
import { actionChangePasswordStatus } from '../../common/core/redux/actions';
let validationMessages = CONSTANTS.validationMessages;
let regExpressions = CONSTANTS.regExpressions;

class changePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      cpModal: true
    };

    this.initialState = this.state;

    this.handleButtonState = this.handleButtonState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);

    this.validatorTypes = strategy.createSchema(
      {
        oldPassword: 'required',
        newPassword: ['required', 'regex:' + regExpressions.passwordPattern],
        confirmNewPassword: 'required|same:newPassword'
      },
      {
        'required.oldPassword': validationMessages.password.oldPassword,
        'required.newPassword': validationMessages.password.newPassword,
        'regex.newPassword': validationMessages.password.passwordPattern,
        'required.confirmNewPassword':
          validationMessages.password.confirmNewPassword,
        'same.confirmNewPassword': validationMessages.password.same
      }
    );
  }

  componentDidMount() {
    console.log(this.props);
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.pass
    ) {
      let password = decrypt(this.props.location.state.pass);
      console.log(password);
      if (password) {
        this.setState({
          oldPassword: password
        });
      }
    }
  }

  closeCPModal = () => {
    this.setState({ cpModal: false });
    this.props.closeCPComponent();
    setLocalStorage('isPasswordPopupClose', true);
  };

  submitData = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleButtonState();
    }
  };

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

  handleResetForm = () => {
    this.setState(this.initialState);
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
    let oldPassword = encrypt(this.state.oldPassword.trim());
    let newPassword = encrypt(this.state.newPassword.trim());

    let data = {
      oldPassword,
      newPassword
    };

    spikeViewApiService('changePassword', data)
      .then(response => {
        if (response.data.status === 'Success') {
          self.props.closeCPComponent();
          self.props.actionChangePasswordStatus();
          self.handleResetForm();
          self.setState({ cpModal: false });
        } else {
          self.handleResetForm();
        }
      })
      .catch(err => {
        self.handleResetForm();
        console.log(err);
      });
  }

  render() {
    const { isLoading, show, target } = this.state;

    return (
      <Modal
        className="change-p-popUp"
        show={this.state.cpModal}
        onHide={this.closeCPModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Body>
          <div className="centeredBox">
            <form className="forgotPasswordForm p-5 p-relative">
              {/* <span className="icon-info once-info"> */}
              <ButtonToolbar>
                <OverlayTrigger
                  key="bottom"
                  placement="bottom"
                  overlay={
                    <Tooltip id="bottom">
                      {validationMessages.passwordPattern}
                    </Tooltip>
                  }
                >
                  <span className="icon-info once-info" variant="secondary" />
                </OverlayTrigger>
              </ButtonToolbar>

              <div className="formIcon">
                <span className="icon-change_password">
                  <span className="path1" />
                  <span className="path2" />
                </span>
              </div>
              <FormGroup>
                <legend className="text-center">Change Password</legend>
              </FormGroup>
              <FormGroup className={this.getClasses('oldPassword')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-password" />
                  </InputGroup.Addon>
                  <FormControl
                    type="password"
                    placeholder="Current password"
                    name="oldPassword"
                    value={this.state.oldPassword}
                    onChange={this.handleChange}
                    maxLength="20"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('oldPassword'))}
              </FormGroup>

              <FormGroup className={this.getClasses('newPassword')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-password" />
                  </InputGroup.Addon>
                  <FormControl
                    type="password"
                    placeholder="New password"
                    name="newPassword"
                    value={this.state.newPassword}
                    onChange={this.handleChange}
                    maxLength="20"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(this.props.getValidationMessages('newPassword'))}
              </FormGroup>

              <FormGroup className={this.getClasses('confirmNewPassword')}>
                <InputGroup>
                  <InputGroup.Addon>
                    <span className="icon-password" />
                  </InputGroup.Addon>
                  <FormControl
                    type="password"
                    placeholder="Confirm new password"
                    name="confirmNewPassword"
                    value={this.state.confirmNewPassword}
                    onChange={this.handleChange}
                    maxLength="20"
                    onKeyPress={this.submitData}
                  />
                </InputGroup>
                {renderMessage(
                  this.props.getValidationMessages('confirmNewPassword')
                )}
              </FormGroup>
              <FormGroup className="centeredBox">
                <Button
                  bsStyle="primary"
                  className="no-bold no-round btn btn-primary "
                  disabled={isLoading}
                  onClick={!isLoading ? this.handleButtonState : null}
                >
                  {isLoading ? 'In Progress...' : 'Save'}
                </Button>{' '}
                &nbsp;&nbsp;
                <Button
                  bsStyle="default"
                  // disabled={
                  //   this.props.isPasswordChanged === false ? true : false
                  // }
                  className="no-bold no-round btn btn-primary"
                  onClick={this.closeCPModal}
                >
                  Cancel
                </Button>
              </FormGroup>
            </form>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

changePassword = validation(strategy)(changePassword);

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionChangePasswordStatus
    },
    dispatch
  );
};

export default connect(
  null,
  mapDispatchToProps
)(changePassword);
