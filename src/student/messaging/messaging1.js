import React, { Component } from 'react';
import { FormGroup, InputGroup, FormControl } from 'react-bootstrap';
import Header from '../header/header';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import moment from 'moment';

import { getThumbImage, limitCharacter } from '../../common/commonFunctions';
import spikeViewApiService from '../../common/core/api/apiService';
import CONSTANTS from '../../common/core/config/appConfig';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';

import Wave from '../../common/message/wave';
import NoFriends from '../../common/message/no-friends';
import NoConnection from './/no-connection';

let AsyncTypeahead = asyncContainer(Typeahead);

class Messaging extends Component {
  socket = {};
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      chatUserId: '',
      messages: [],
      loader: false,
      userId:
        this.props.user && this.props.user.userId
          ? this.props.user.userId
          : null,
      sessionStart: false,
      firstName: '',
      lastName: '',
      profilePicture: '',
      shareProfileFlag: false,
      shareProfile: []
    };
    // this.handleEvent = this.handleEvent.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.filterList = this.filterList.bind(this);
    this.onFirstMessage = this.onFirstMessage.bind(this);
    //  this.socket = io(config.api, { query: `username=${props.username}` }).connect();
    console.log('CONSTANTS.socket.URL', CONSTANTS.socket.URL);
    this.socket = io.connect(CONSTANTS.socket.URL);
    let user = this.props.user,
      self = this;

    this.socket.on('connect', function() {
      console.log('inside connect socket ----------');
      self.socket.emit('adduser', user.userId);
    });

    this.socket.on('disconnect', function() {
      console.log('inside disconnect socket ----------');
      self.socket.emit('disconnect1');
    });

    this.socket.on('updatechat', function(data) {
      self.memberListUpdate(data);
      if (
        self.state.partnerUserId == data.sender &&
        self.state.userId == data.receiver
      )
        self.updateChat(data);
    });

    this.socket.on('updateusers', function(data) {
      if (!self.state.sessionStart) {
        self.setState({ loader: true });
        self.setMemberData(data, user ? user.userId : null, 'initiateList');
        self.setState({ sessionStart: true });
      } else self.setOnlineUser(data, self.state.memberList);
    });
    // this.setMemberData(user ? user.userId : null);
  }

  componentDidMount() {
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.profileShare === 1
    ) {
      let userId = this.props.user.userId;
      let firstName = this.props.user.firstName;
      let lastName = this.props.user.lastName;
      let profilePicture = this.props.user.profilePicture;

      // let profileURL =
      //   'http://' + getAPIURL() + ':3000/student/profile/' + userId;

      let profileURL = this.props.location.state.shareLink;
      let shareId = this.props.location.state.shareId;
      this.setState({
        message: profileURL,
        profileShare: 1,
        profileURL: profileURL,
        firstName,
        lastName,
        shareId,
        shareProfileFlag: true,
        profilePicture
      });
    }
  }

  handleChange = value => {
    if (value.length > 0) {
      let userId = value[value.length - 1].value;
      let name = value[0].label;

      if (userId) {
        let memberList = this.state.memberList;
        let index =
          memberList &&
          memberList.findIndex(key => key.partnerId === parseInt(userId, 10));

        if (memberList && index !== -1) {
          let sender = this.state.userId;
          let firstName = this.props.user.firstName
            ? this.props.user.firstName
            : '';
          let lastName =
            this.props.user.lastName || this.props.user.lastName != null
              ? this.props.user.lastName
              : '';
          let profilePicture = this.props.user.profilePicture;
          let text =
            this.state.profileURL +
            '/shareProfile/' +
            firstName +
            ' ' +
            lastName +
            '/shareProfile/' +
            profilePicture;
          let connectorId = memberList[index]['connectId'];
          let receiver = userId;
          let time = new Date().valueOf();
          let shareProfile = this.state.shareProfile;

          let data = {
            connectorId,
            sender,
            receiver,
            text,
            time,
            type: 1
          };
          if (shareProfile.length === 0) this.getChatMessage(connectorId);
          else this.state.messages = [];
          shareProfile.push(data);
          this.setState({
            shareProfile: shareProfile,
            messages: this.state.messages
          });
        }
      }
    }
  };

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('absoluteHeader');
    document.body.classList.remove('fixedHeader');
  }

  componentWillUnmount() {
    this.setEmitFun();
  }

  setEmitFun() {
    this.socket.emit('disconnect', this.state.user);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextState.messages == this.state.messages;
  // }

  handleEvent(event) {
    // debugger;
    console.log(event.target.value, [event.target.name]);
    this.setState({ [event.target.name]: event.target.value });
  }

  setOnlineUser(data, memberList) {
    memberList =
      memberList &&
      memberList.map(function(item) {
        let some =
          data &&
          Object.keys(data).some(key => {
            return parseInt(key, 10) === item.partnerId ? true : false;
          });
        if (some) item['status'] = 'online';
        else item['status'] = 'offline';
        return item;
      });
    this.setState({ memberList });
  }

  setMemberData(data, userId, action) {
    console.log('setMemberData calling --------------- ');
    spikeViewApiService('getChatFriendList', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let memberList = response.data.result;
          memberList.sort(function(a, b) {
            return b.lastTime - a.lastTime;
          });
          this.setState({
            memberList,
            memberListFilter: memberList,
            onlineUsers: data,
            loader: false
          });
          this.setOnlineUser(data, memberList);
          if (action === 'initiateList') {
            if (
              this.props.location &&
              this.props.location.state &&
              this.props.location.state.profileShare === 1
            ) {
            } else if (
              this.props.location &&
              this.props.location.state &&
              this.props.location.state.messageUser
            ) {
              let indexUser = memberList.findIndex(
                todo =>
                  todo.partnerId ===
                  parseInt(this.props.location.state.messageUser, 10)
              );
              this.showChatWindow(memberList[indexUser]);
            } else this.showChatWindow(memberList[0]);
          }
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ loader: false });
      });
  }

  memberListUpdate(data) {
    //  let self = this;
    // let memberList = this.state.memberList;
    // let index =
    //   memberList &&
    //   memberList.findIndex(
    //     key =>
    //       parseInt(key.partnerId, 10) == parseInt(data.sender, 10) &&
    //       self.state.userId == parseInt(data.receiver, 10)
    //   );

    // if (memberList && index !== -1)
    //   memberList[index]['lastMessage'] = data.text;
    // this.setState({ memberList });
    this.setMemberData(
      this.state.onlineUsers,
      this.props.user ? this.props.user.userId : null,
      ''
    );
  }

  showChatWindow = data => {
    if (this.state.partnerUserId === data.partnerId) return false;
    this.setState({ wave: false });
    let messages = this.state.messages;
    messages = [];
    this.setState({ messages });
    let connectorId = data.connectId;
    this.getChatMessage(connectorId);
    let chatConnect = {
      userId: this.state.userId,
      partnerId: data.partnerId,
      screenId: 1
    };
    this.socket.emit('setConnectionList', chatConnect);
    this.setState({
      connectorId: data.connectId,
      partnerName: data.partnerFirstName,
      partnerUserId: data.partnerId,
      status: data.status,
      message: '',
      shareProfileFlag: false,
      partnerUserProfilePicture: data.partnerProfilePicture
    });
    this.memberListMessageUpdate(data);
  };

  memberListMessageUpdate(data) {
    let self = this;
    let memberList = this.state.memberList;
    let index =
      memberList &&
      memberList.findIndex(
        key => parseInt(key.partnerId, 10) == parseInt(data.partnerId, 10)
      );

    if (memberList && index !== -1)
      memberList[index]['lastMessage'] = memberList[index]['lastMessage'];
    this.setState({ memberList });
  }

  getChatMessage(connectorId) {
    let self = this;
    spikeViewApiService('getChatMessage', { connectorId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let resultArray = response.data.result;
          for (var i in resultArray) {
            let messageObject = {
              userId: resultArray[i].receiver,
              text: resultArray[i].text,
              time: new Date(resultArray[i].time).valueOf()
            };
            if (self.state.userId == resultArray[i].sender)
              messageObject.fromMe = true;

            self.updateChat(messageObject);
          }
          self.setState({ wave: true });
          console.log('getChatMessage -- ');
          // this.setMemberData(
          //   this.state.onlineUsers,
          //   this.props.user ? this.props.user.userId : null,
          //   ''
          // );
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSendMessage() {
    if (
      this.props.location &&
      this.props.location.state &&
      this.props.location.state.profileShare === 1 &&
      this.state.shareProfile.length === 0 &&
      this.state.shareProfileFlag
    )
      return false;

    let _this = this;
    let shareProfile = this.state.shareProfile;
    if (shareProfile.length > 0 && this.state.shareProfileFlag) {
      // shareProfile.forEach(function(data, index) {
      for (let i = 0; i < shareProfile.length; i++) {
        let sender = shareProfile[i].sender;
        let text = shareProfile[i].text;
        let connectorId = shareProfile[i].connectorId;
        let receiver = shareProfile[i].receiver;
        let time = new Date().valueOf();
        let messageObject = {
          connectorId,
          sender,
          receiver,
          text,
          type: 1, //for single user,
          time
        };
        if (i === 0) {
          messageObject.fromMe = true;
          _this.updateChat(messageObject);
        }
        _this.sendMessageSubmit(Object.assign({}, messageObject));
        this.updateShareProfile(receiver);
      }

      this.setState({ shareProfile: [], message: '' });
    } else {
      if (!this.state.message.trim()) {
        return false;
      }

      let sender = this.state.userId;
      let text = this.state.message;
      let connectorId = this.state.connectorId;
      let receiver = this.state.partnerUserId;
      let time = new Date().valueOf();
      let messageObject = {
        connectorId,
        sender,
        receiver: receiver,
        text: text.replace(/\n|\r/g, ''),
        type: 1, //for single user,
        time
      };
      this.sendMessageSubmit(messageObject);
      messageObject.fromMe = true;
      this.updateChat(messageObject);
      this.setState({ message: '' });
    }
  }

  updateShareProfile = shareTo => {
    let sharedId = this.state.shareId;
    if (shareTo && sharedId) {
      let data = {
        sharedId,
        shareTo
      };
      spikeViewApiService('updateShareMessageProfile', data);
    }
  };

  onFirstMessage() {
    let sender = this.state.userId;
    let text = 'Hi';
    let connectorId = this.state.connectorId;
    let receiver = this.state.partnerUserId;
    let time = new Date().valueOf();
    let messageObject = {
      connectorId,
      sender,
      receiver,
      text,
      type: 1, //for single user,
      time
    };
    this.sendMessageSubmit(messageObject);
    messageObject.fromMe = true;
    this.updateChat(messageObject);
    this.setState({ message: '' });
  }

  sendMessageSubmit(messageObject) {
    this.setState({ message: '' });
    this.socket.emit('sendchat', messageObject);
    //spikeViewApiService('sendMessage', messageObject);
    this.setHeaderCount(messageObject.receiver);
  }

  setHeaderCount(partnerId) {
    let userId = partnerId;
    let data = {
      userId: userId,
      connectionCount: '',
      messagingCount: 1,
      notificationCount: ''
    };
    spikeViewApiService('updateHeaderCount', data);
  }

  updateChat(data) {
    const messages = this.state.messages;
    messages.push(data);
    this.setState({ messages });
  }

  addMessage = e => {
    if (e.keyCode === 13 && e.shiftKey == false) {
      this.handleSendMessage();
    }
  };

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

  handleSearch = () => {
    let profileOptions = this.state.memberList;
    if (profileOptions.length > 0) {
      profileOptions = profileOptions.map(function(data) {
        let firstName = data.partnerFirstName ? data.partnerFirstName : '';
        let lastName = data.partnerLastName ? data.partnerLastName : '';
        let name = firstName + ' ' + lastName;
        return {
          value: data.partnerId,
          label: name
        };
      });
      this.setState({ profileOptions: profileOptions, isLoading: false });
    }
  };

  filterList = event => {
    var memberListFilter = this.state.memberList;
    memberListFilter = memberListFilter.filter(function(item) {
      return (
        item.partnerFirstName
          .toLowerCase()
          .search(event.target.value.toLowerCase()) !== -1
      );
    });
    this.setState({ memberListFilter: memberListFilter });
  };

  render() {
    let self = this,
      date = '',
      memberListDate = '',
      today = null,
      yesterday = null,
      monthData = null;
    var div = document.getElementById('scroll');
    if (div) {
      div.scrollTop = div.scrollHeight - div.clientHeight;
    }
    return (
      <div className="flex fullHeight">
        <Header {...this.props} />
        {this.state.loader === true ? (
          <div className="centeredBox fullWidth i-fixed">
            <img
              className="ml-1"
              src="../assets/img/svg-loaders/three-dots.svg"
              width="40"
              alt="loader"
            />
          </div>
        ) : null}
        {this.state.memberList && this.state.memberList.length > 0 ? (
          <div className="container">
            <div className="chat-wrapper">
              <div className="cw--chatSidebar">
                <div className="cw--header">
                  <FormGroup className="searchBox rounded focused">
                    <InputGroup>
                      <InputGroup.Addon>
                        <span className="icon-search" />
                      </InputGroup.Addon>
                      <FormControl
                        type="text"
                        placeholder="Search"
                        onChange={this.filterList}
                      />
                    </InputGroup>
                  </FormGroup>
                </div>

                <ul className="cw--chatlist">
                  {this.state.memberListFilter &&
                    this.state.memberListFilter.map(function(data, index) {
                      let today = null,
                        yesterday = null,
                        monthData = null;
                      if (
                        new Date().getDate() -
                          new Date(data.lastTime).getDate() ==
                          0 &&
                        memberListDate !== 'today' &&
                        !today
                      ) {
                        memberListDate = 'today';
                        today = 'today';
                      } else if (
                        new Date().getDate() -
                          new Date(data.lastTime).getDate() ==
                          1 &&
                        memberListDate !== 'yesterday' &&
                        !yesterday
                      ) {
                        (memberListDate = 'yesterday'),
                          (yesterday = 'yesterday');
                      } else if (
                        !yesterday &&
                        !today &&
                        monthData !=
                          new Date(data.lastTime).getDate() +
                            ' ' +
                            moment(new Date(data.lastTime)).format('MMM')
                      ) {
                        memberListDate =
                          new Date(data.lastTime).getDate() +
                          ' ' +
                          moment(new Date(data.lastTime)).format('MMM');
                        monthData =
                          new Date(data.lastTime).getDate() +
                          ' ' +
                          moment(new Date(data.lastTime)).format('MMM');
                      } else memberListDate = 'check';
                      return (
                        <li
                          key={index}
                          className={
                            data.partnerId === self.state.partnerUserId
                              ? 'cw--chatlist--item active'
                              : 'cw--chatlist--item'
                          }
                          onClick={self.showChatWindow.bind(self, data)}
                        >
                          <div
                            className={
                              data.status === 'online'
                                ? 'cw--chatlist--img online'
                                : 'cw--chatlist--img'
                            }
                          >
                            {data.partnerProfilePicture ? (
                              <img
                                src={getThumbImage(
                                  'small',
                                  data.partnerProfilePicture
                                )}
                                alt=""
                                className="img-responsive"
                              />
                            ) : (
                              <span className="icon-user_default2 default-icon centeredBox" />
                            )}
                          </div>

                          <div className="cw--chatlist--userDetails">
                            <p className="cw--chatlist--username wrap-long-words">
                              {data.partnerFirstName
                                ? limitCharacter(data.partnerFirstName, 10) +
                                  ' ' +
                                  (data.partnerLastName
                                    ? limitCharacter(data.partnerLastName, 10)
                                    : '')
                                : null}
                            </p>
                            <p className="cw--chatlist--msg">
                              {data.lastMessage ? data.lastMessage : ''}
                            </p>
                          </div>

                          <div className="cw--chatlist--time">
                            {data.lastMessage && memberListDate !== 'check'
                              ? memberListDate == 'today'
                                ? moment(new Date(data.lastTime)).format(
                                    'HH:mm:ss'
                                  )
                                : memberListDate
                              : null}
                          </div>
                          {data.unreadMessages &&
                          data.partnerId !== self.state.partnerUserId ? (
                            <div className="noti--count">
                              {data.unreadMessages}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className="cw--chatWindow">
                {this.state.shareProfileFlag ? (
                  <div className="cw--header">
                    {/* <FormGroup className="searchBox rounded">
                    <InputGroup>
                      <InputGroup.Addon>
                        <span class="icon-search" />
                      </InputGroup.Addon>
                    </InputGroup>
                  </FormGroup> */}

                    <div className="searchBox rounded form-group">
                      <div className="input-group">
                        <InputGroup.Addon>
                          <span className="icon-search" />
                        </InputGroup.Addon>
                        <AsyncTypeahead
                          minLength={1}
                          autoFocus
                          isLoading={this.state.isLoading}
                          labelKey={'label'}
                          placeholder="Type a name here..."
                          onSearch={this.handleSearch}
                          options={this.state.profileOptions}
                          name="searchKey"
                          value={this.state.searchKey}
                          onChange={this.handleChange}
                          searchText={this.state.searchText}
                          defaultInputValue={this.state.searchKey}
                          //    multiple
                          onFocus={this.onFocus}
                          onBlur={this.onBlur}
                          onKeyDown={this.selectUser}
                        />
                      </div>
                    </div>

                    {/* <div className="searchBox rounded form-group">
                    <div className="input-group">
                        <InputGroup.Addon>
                            <span className="icon-search"/>
                        </InputGroup.Addon>
                        <AsyncTypeahead
                          minLength={1}
                          isLoading={this.state.isLoading}
                          labelKey={'label'}
                          placeholder="Search"
                          onSearch={this.handleSearch}
                          options={this.state.profileOptions}
                          name="searchKey"
                          value={this.state.searchKey}
                          onChange={this.handleChange}
                          searchText={this.state.searchText}
                          defaultInputValue={this.state.searchKey}
                          multiple
                          onFocus={this.onFocus}
                          onBlur={this.onBlur}
                          onKeyDown={this.selectUser}
                        />
                    </div>
                  </div> */}
                  </div>
                ) : (
                  <div className="cw--header">
                    <div className="activeChatUser">
                      <p className="cwh--username">{this.state.partnerName}</p>
                      <p
                        className={
                          this.state.status === 'online' ? 'status' : ''
                        }
                      >
                        {this.state.status === 'online' ? 'Active Now' : null}
                      </p>
                    </div>
                  </div>
                )}
                <div id="scroll" className="cw--body">
                  <ul className="cw--chatlist">
                    {this.state.messages.length > 0 ? (
                      this.state.messages.map((message, i) => {
                        //console.log('test', date);
                        if (
                          new Date().getDate() -
                            new Date(message.time).getDate() ==
                            0 &&
                          date !== 'today' &&
                          !today
                        ) {
                          date = 'today';
                          today = 'today';
                        } else if (
                          new Date().getDate() -
                            new Date(message.time).getDate() ==
                            1 &&
                          date !== 'yesterday' &&
                          !yesterday
                        ) {
                          (date = 'yesterday'), (yesterday = 'yesterday');
                        } else if (
                          !yesterday &&
                          !today &&
                          monthData !=
                            new Date(message.time).getDate() +
                              ' ' +
                              moment(new Date(message.time)).format('MMM')
                        ) {
                          date =
                            new Date(message.time).getDate() +
                            ' ' +
                            moment(new Date(message.time)).format('MMM');
                          monthData =
                            new Date(message.time).getDate() +
                            ' ' +
                            moment(new Date(message.time)).format('MMM');
                        } else date = 'check';

                        // ? "Today" : moment(new Date()).diff(moment(message.time), "days") === 1 ?
                        // "Yesterday" :  moment(message.time).format("MM DD")

                        return message.fromMe ? (
                          <div key={i}>
                            {date !== 'check' ? (
                              <div className="title--with--border">
                                <p className="small">
                                  <small>{date}</small>
                                </p>
                              </div>
                            ) : null}
                            <li className="cw--chatlist--item post">
                              {new RegExp(
                                '(?:((?:https?|ftp)://)|ww)(?:S+(?::S*)?@)?(?:(?!(?:10|127)(?:.d{1,3}){3})(?!(?:169.254|192.168)(?:.d{1,3}){2})(?!172.(?:1[6-9]|2d|3[0-1])(?:.d{1,3}){2})(?:[1-9]d?|1dd|2[01]d|22[0-3])(?:.(?:1?d{1,2}|2[0-4]d|25[0-5])){2}(?:.(?:[1-9]d?|1dd|2[0-4]d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:.(?:[a-z\u00a1-\uffff]{2,})).?)(?::d{2,5})?(?:[/?#]S*)?'
                              ).test(message.text) ? (
                                message.text &&
                                message.text.indexOf('/shareProfile/') >= 0 ? (
                                  <div className="flex flex-dir-column">
                                    <a
                                      href={
                                        message.text.split('/shareProfile/')[0]
                                      }
                                      target="_blank"
                                    >
                                      <strong>
                                        <strong>
                                          {/* {
                                            message.text.split(
                                              '/shareProfile/'
                                            )[0]
                                          } */}
                                        </strong>
                                      </strong>
                                    </a>
                                    <a
                                      href={
                                        message.text.split('/shareProfile/')[0]
                                      }
                                      target="_blank"
                                      className="box-with--image"
                                    >
                                      {message.text.split(
                                        '/shareProfile/'
                                      )[2] &&
                                      message.text.split(
                                        '/shareProfile/'
                                      )[2] === '' ? (
                                        <span className="icon-user_default2 default-icon flat smallPic" />
                                      ) : (
                                        <img
                                          className="img-responsive smallPic"
                                          src={getThumbImage(
                                            'small',
                                            message.text.split(
                                              '/shareProfile/'
                                            )[2]
                                          )}
                                          alt=""
                                        />
                                      )}
                                      <div className="user--details">
                                        <p className="p--name wrap-long-words">
                                          {
                                            message.text.split(
                                              '/shareProfile/'
                                            )[1]
                                          }
                                          <span className="org--name">
                                            Spikeview
                                          </span>
                                        </p>
                                        <p className="p--email">
                                          <a
                                            href={
                                              message.text.split(
                                                '/shareProfile/'
                                              )[0]
                                            }
                                            target="_blank"
                                          >
                                            www.spikeview.com
                                          </a>
                                        </p>
                                      </div>
                                    </a>
                                  </div>
                                ) : (
                                  <div className="cw--chatlist--userDetails">
                                    <p className="cw--chatlist--username wrap-long-words">
                                      <a href={message.text} target="_blank">
                                        {message.text}
                                      </a>
                                    </p>
                                  </div>
                                )
                              ) : (
                                <div className="cw--chatlist--userDetails">
                                  <p className="cw--chatlist--username wrap-long-words">
                                    {message.text}
                                  </p>
                                </div>
                              )}
                              <div className="cw--chatlist--time">
                                {moment(message.time).format('HH:mm:ss')}
                              </div>
                            </li>
                          </div>
                        ) : (
                          <div key={i}>
                            {date !== 'check' ? (
                              <div className="title--with--border">
                                <p className="small">
                                  <small>{date}</small>
                                </p>
                              </div>
                            ) : null}
                            <li className="cw--chatlist--item get">
                              <div className="cw--chatlist--img">
                                {self.state.partnerUserProfilePicture ? (
                                  <img
                                    className="img-responsive"
                                    src={getThumbImage(
                                      'small',
                                      self.state.partnerUserProfilePicture
                                    )}
                                    alt=""
                                  />
                                ) : (
                                  <span className="icon-user_default2 default-icon centeredBox" />
                                )}
                              </div>

                              {new RegExp(
                                '(?:((?:https?|ftp)://)|ww)(?:S+(?::S*)?@)?(?:(?!(?:10|127)(?:.d{1,3}){3})(?!(?:169.254|192.168)(?:.d{1,3}){2})(?!172.(?:1[6-9]|2d|3[0-1])(?:.d{1,3}){2})(?:[1-9]d?|1dd|2[01]d|22[0-3])(?:.(?:1?d{1,2}|2[0-4]d|25[0-5])){2}(?:.(?:[1-9]d?|1dd|2[0-4]d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:.(?:[a-z\u00a1-\uffff]{2,})).?)(?::d{2,5})?(?:[/?#]S*)?'
                              ).test(message.text) ? (
                                message.text &&
                                message.text.indexOf('/shareProfile/') >= 0 ? (
                                  <div className="flex flex-dir-column">
                                    <a
                                      href={
                                        message.text.split('/shareProfile/')[0]
                                      }
                                      target="_blank"
                                    >
                                      <strong>
                                        <strong>
                                          {/* {
                                            message.text.split(
                                              '/shareProfile/'
                                            )[0]
                                          } */}
                                        </strong>
                                      </strong>
                                    </a>
                                    <a
                                      href={
                                        message.text.split('/shareProfile/')[0]
                                      }
                                      target="_blank"
                                      className="box-with--image"
                                    >
                                      {message.text.split(
                                        '/shareProfile/'
                                      )[2] &&
                                      message.text.split(
                                        '/shareProfile/'
                                      )[2] === '' ? (
                                        <span className="icon-user_default2 default-icon flat smallPic" />
                                      ) : (
                                        <img
                                          className="img-responsive smallPic"
                                          src={getThumbImage(
                                            'small',
                                            message.text.split(
                                              '/shareProfile/'
                                            )[2]
                                          )}
                                          alt=""
                                        />
                                      )}
                                      <div className="user--details">
                                        <p className="p--name wrap-long-words">
                                          {
                                            message.text.split(
                                              '/shareProfile/'
                                            )[1]
                                          }
                                          <span className="org--name">
                                            Spikeview
                                          </span>
                                        </p>
                                        <p className="p--email">
                                          <a
                                            href={
                                              message.text.split(
                                                '/shareProfile/'
                                              )[0]
                                            }
                                            target="_blank"
                                          >
                                            www.spikeview.com
                                          </a>
                                        </p>
                                      </div>
                                    </a>
                                  </div>
                                ) : (
                                  <div className="cw--chatlist--userDetails">
                                    <p className="cw--chatlist--username wrap-long-words">
                                      <a href={message.text} target="_blank">
                                        {message.text}
                                      </a>
                                    </p>
                                  </div>
                                )
                              ) : (
                                <div className="cw--chatlist--userDetails">
                                  <p className="cw--chatlist--username wrap-long-words">
                                    {message.text}
                                  </p>
                                </div>
                              )}
                              <div className="cw--chatlist--time">
                                {moment(message.time).format('HH:mm:ss')}
                              </div>
                            </li>
                          </div>
                        );
                      })
                    ) : this.props.location &&
                    this.props.location.state &&
                    this.props.location.state.profileShare === 1 &&
                    !this.state.partnerName ? (
                      <NoConnection />
                    ) : this.state.wave ? (
                      <Wave
                        onFirstMessage={this.onFirstMessage}
                        partnerName={this.state.partnerName}
                      />
                    ) : null}
                  </ul>
                </div>

                <div className="cw--messaging">
                  <FormGroup className="cw--messaging--controls">
                    <InputGroup>
                      <InputGroup.Addon>
                        <span className="icon-email" />
                      </InputGroup.Addon>
                      <FormControl
                        componentClass="textarea"
                        type="Email"
                        placeholder="Type your message here"
                        name="message"
                        onKeyDown={this.addMessage}
                        value={this.state.message}
                        onChange={this.handleEvent.bind(this)}
                        style={{ minHeight: 'auto' }}
                      />
                      {/* 
                      <a
                        className={`flex align-center action--send rounded ${
                          this.state.message ? '' : 'btn disabled'
                        }`}
                      > */}
                      <a className="flex align-center action--send rounded">
                        <span
                          onClick={this.handleSendMessage}
                          className="icon-send icon"
                        />
                      </a>
                    </InputGroup>
                  </FormGroup>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NoFriends memberList={this.state.memberList} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.User.userData
  };
};

export default connect(
  mapStateToProps,
  null
)(Messaging);
