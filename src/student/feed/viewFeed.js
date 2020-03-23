import React, { Component } from 'react';
import {
  Nav,
  InputGroup,
  FormGroup,
  FormControl,
  NavDropdown,
  MenuItem,
  ResponsiveEmbed,
  Modal,
  Checkbox,
  Button
} from 'react-bootstrap';
import moment from 'moment';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import Slider from 'react-slick/lib/index';
// import InfiniteScroll from 'react-infinite-scroller';
import InfiniteScroll from 'react-infinite-scroll-component';
import spikeViewApiService from '../../common/core/api/apiService';
import {
  SampleNextArrow,
  SamplePrevArrow,
  getThumbImage
} from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';
import noFeedImage from '../../assets/img/no-feeds.png';

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
};

class ViewFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feedData: [],
      comment: '',
      commentButton: false,
      firstName: '',
      lastName: '',
      title: '',
      profilePicture: '',
      SVGLoader: false,
      likeModal: false,
      shareModal: false,
      likeList: [],
      sharedPost: '',
      visiblity: 'Public',
      isActive: '',
      connectionLoader: false,
      myConnections: [],
      connectionModal: false,
      feedId: '',
      imagesPopup: false,
      sliderImages: [],
      /**Load more states values  */
      startPage: 1,
      hasMoreData: true,
      display: false,
      commentCount: 2,
      likeFeedClick: true,
      likeCommentClick: true

      /**END Load more states values  */
    };

    this.userIdArr = [];

    this.likeModal = this.likeModal.bind(this);
    this.shareModal = this.shareModal.bind(this);
    this.loadFeeds = this.loadFeeds.bind(this);
    this.incremenetPageNo = this.incremenetPageNo.bind(this);
  }

  componentDidMount() {
    if (this.props.feeds) {
      let feedData = this.props.feeds;
      console.log(' feed view feed data ', feedData);
      this.setState({ feedData });
    }
    let userId = this.props.userId;
    let firstName = this.props.firstName;
    let lastName = this.props.lastName;
    let title = this.props.title;
    let profilePicture = this.props.profilePicture;
    let isActive = this.props.isActive;
    this.setState({
      userId,
      firstName,
      lastName,
      title,
      profilePicture,
      isActive
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.feeds) {
      let feedData = nextProps.feeds;
      this.setState({ feedData });
    }
  }

  renderImages = images => {
    var className = '';
    if (images.length > 0) {
      let imgTotal = images.length;
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
    }

    return (
      <div>
        <div className={className}>
          {images && images.length > 0
            ? images.slice(0, 4).map((image, index) => (
                <a
                  key={index}
                  className={index === 3 ? 'img-count--wrapper' : ''}
                >
                  <img
                    className="object-fit-cover"
                    src={getThumbImage('medium', image)}
                    alt=""
                    onClick={() => this.imagesPopup(images)}
                  />
                  {index === 3 && images.length > 4 ? (
                    <a
                      className="img-count--value"
                      onClick={() => this.imagesPopup(images)}
                    >
                      {`+ ${images.length - 4}`}
                    </a>
                  ) : (
                    ''
                  )}
                </a>
              ))
            : ''}
        </div>
      </div>
    );
  };

  imagesPopup = images => {
    console.log(images);
    this.setState({ imagesPopup: !this.state.imagesPopup });
    this.setState({
      sliderImages: images
    });
  };

  renderVideo = videoFile => {
    if (videoFile) {
      return (
        <div style={{ width: 100 + '%', height: 'auto' }}>
          <ResponsiveEmbed a16by9>
            <video controls controlsList="nodownload">
              <source
                src={getThumbImage('original', videoFile)}
                type="video/mp4"
              />
            </video>
          </ResponsiveEmbed>
        </div>
      );
    } else {
      return;
    }
  };

  submitData = (feed, feedIndex, event) => {
    if (
      event.key === 'Enter' &&
      this.state['comment_' + feedIndex].trim() !== '' &&
      this.state['comment_' + feedIndex] !== undefined
    ) {
      event.preventDefault();
      this.addComment(feed, feedIndex);
    }
  };

  handleChange = (index, event) => {
    console.log(event.target.value);
    this.setState({ [event.target.name + '_' + index]: event.target.value });
    if (event.target.value.trim() !== '') {
      this.setState({
        commentButton: true
      });
    } else {
      this.setState({
        commentButton: false
      });
    }
  };

  likeModal = (likes, action) => {
    this.setState({
      likeModal: !this.state.likeModal,
      likeList: likes,
      action: action
    });
  };

  likeOnComment = (feed, comment, isLike, feedIndex, commentIndex) => {
    this.setState({
      likeCommentClick: false
    });
    let feedId = feed.feedId;
    if (feedId && comment.commentId) {
      let userId = this.state.userId || '';
      let data = {
        feedId,
        userId,
        commentId: comment.commentId,
        isLike
      };

      let feedDataCopy = [...this.state.feedData];

      spikeViewApiService('likeOnComment', data)
        .then(response => {
          if (response.data.status === 'Success') {
            if (isLike === true) {
              _.uniq(
                this.state.feedData[feedIndex].comments[
                  commentIndex
                ].likes.push({
                  userId: userId,
                  name: this.state.firstName + '' + this.state.lastName,
                  profilePicture: this.state.profilePicture,
                  title: this.state.title
                })
              );
              this.setState({ feedData: feedDataCopy, likeCommentClick: true });
            } else {
              _.remove(
                this.state.feedData[feedIndex].comments[commentIndex].likes,
                {
                  userId: userId
                }
              );
              this.setState({ feedData: feedDataCopy, likeCommentClick: true });
            }
          }
        })
        .catch(err => {
          console.log(err);
        });

      if (userId !== parseInt(feed.postedBy, 10)) {
        let text =
          this.state.firstName +
          ' ' +
          (this.state.lastName ? this.state.lastName : '') +
          ' like on Your Comment';
        feed.postedBy = comment.commentedBy;
        this.setNotification(feed, text);
      }
    }
  };

  setNotification(feed, text) {
    let dateTime = new Date().valueOf();
    let post = feed.postedBy;
    let feedId = feed.feedId;
    let flag = false;
    let userId = this.state.userId || '';
    let notificationData = {
      userId: post,
      actedBy: userId,
      profilePicture: this.props.profilePicture,
      postId: feedId,
      text,
      dateTime,
      flag
    };
    spikeViewApiService('postNotification', notificationData);
  }

  renderLikeSection = (likeArray, feed, feedIndex) => {
    let matchUserId = _.filter(likeArray, {
      userId: this.state.userId
    });

    if (likeArray.length > 0) {
      return (
        <li className={matchUserId.length > 0 ? 'active' : ''}>
          <a
            onClick={
              this.state.likeFeedClick === true
                ? this.likeFeed.bind(
                    this,
                    feed,
                    matchUserId.length > 0 ? false : true,
                    feedIndex
                  )
                : ''
            }
          >
            <span className="icon-like" disabled />
          </a>
        </li>
      );
    } else {
      return (
        <li>
          <a
            onClick={
              this.state.likeFeedClick === true
                ? this.likeFeed.bind(this, feed, true, feedIndex)
                : ''
            }
          >
            <span className="icon-like" />
          </a>
        </li>
      );
    }
  };

  likeFeed = (feed, isLike, feedIndex) => {
    this.setState({
      likeFeedClick: false
    });
    if (feed.feedId) {
      let userId = this.state.userId || '';
      let feedId = feed.feedId;
      let lastActivityTime = moment().valueOf();
      let lastActivityType = CONSTANTS.feedActivity.LIKEFEED;
      let data = {
        feedId,
        userId,
        isLike,
        lastActivityTime,
        lastActivityType
      };
      let feedDataCopy = [...this.state.feedData];

      spikeViewApiService('likeFeed', data)
        .then(response => {
          if (response.data.status === 'Success') {
            if (isLike === true) {
              _.uniq(
                this.state.feedData[feedIndex].likes.push({
                  userId: userId,
                  name: this.state.firstName + '' + this.state.lastName,
                  profilePicture: this.state.profilePicture,
                  title: this.state.title
                })
              );
              this.setState({ feedData: feedDataCopy, likeFeedClick: true });
              // this.updateRecentActivityTime(
              //   feedId,
              //   CONSTANTS.feedActivity.LIKEFEED
              // );
            } else {
              _.remove(this.state.feedData[feedIndex].likes, {
                userId: userId
              });
              this.setState({ feedData: feedDataCopy, likeFeedClick: true });
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
      if (isLike && userId !== parseInt(feed.postedBy, 10)) {
        let text =
          this.state.firstName +
          ' ' +
          (this.state.lastName ? this.state.lastName : '') +
          ' liked Your post' +
          (this.props.groupName ? ' in ' + this.props.groupName : '');
        this.setNotification(feed, text);
      }
    }
  };

  renderLikeOnComment = (feed, comment, feedIndex, commentIndex) => {
    let matchUserId = _.filter(comment.likes, {
      userId: this.state.userId
    });

    if (comment.likes && comment.likes.length > 0) {
      return (
        <li className={matchUserId.length > 0 ? 'active' : ''}>
          <a
            onClick={
              this.state.likeCommentClick === true
                ? this.likeOnComment.bind(
                    this,
                    feed,
                    comment,
                    matchUserId.length > 0 ? false : true,
                    feedIndex,
                    commentIndex
                  )
                : ''
            }
          >
            <span className="icon-thumb" /> Like
          </a>
        </li>
      );
    } else {
      return (
        <li>
          <a
            onClick={
              this.state.likeCommentClick === true
                ? this.likeOnComment.bind(
                    this,
                    feed,
                    comment,
                    true,
                    feedIndex,
                    commentIndex
                  )
                : ''
            }
          >
            <span className="icon-thumb" /> Like
          </a>
        </li>
      );
    }
  };

  handleShareChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSelect = eventKey => {
    this.setState({ visiblity: eventKey });
    if (eventKey === 'SelectedConnections') {
      this.setState({
        connectionLoader: true,
        connectionModal: !this.state.connectionModal
      });
      if (this.props.groupId) {
        this.getGroupMemberList(this.props.groupId);
      }else this.getMyConnections();
    }
  };

  getGroupMemberList(groupId) {   
    spikeViewApiService('getGroupMemberListByGroupId', { groupId })
      .then(response => {
        if (
          response &&
          response.data.status === 'Success' &&
          response.data.result
        ) {
          let groupMemberList = response.data.result.members;
          groupMemberList = this.setState({
            groupMemberList,
            connectionLoader: false
          });
        }
      })
      .catch(err => {
        this.setState({ connectionLoader: false });
        console.log(err);
      });
  }

  shareModal = feed => {
    this.setState({
      shareModal: !this.state.shareModal,
      sharedPost: feed,
      visiblity: 'Public',
      postText: ''
    });
  };

  shareFeed = (feedId, postOwner) => {
    if (feedId && postOwner) {
      let visibility = this.state.visiblity;
      let shareTime = moment().valueOf();
      let postedBy = this.state.userId;
      let scope = this.userIdArr;
      let shareText = this.state.postText;
      let isActive = this.state.isActive;
      let lastActivityTime = moment().valueOf();
      let lastActivityType = CONSTANTS.feedActivity.SHAREFEED;
      let _this = this;

      _this.setState({
        SVGLoader: true
      });

      let data = {
        feedId,
        postedBy,
        postOwner,
        visibility,
        scope,
        shareTime,
        shareText,
        isActive,
        lastActivityTime,
        lastActivityType
      };

      spikeViewApiService('shareFeed', data)
        .then(response => {
          if (response.data.status === 'Success') {
            _this.setState({
              SVGLoader: false,
              shareModal: !_this.state.shareModal,
              postText: '',
              visiblity: 'Public'
            });
            if (scope.length > 0) {
              _this.userIdArr = [];
            }
            _this.props.refreshFeeds();
            // _this.updateRecentActivityTime(
            //   response.data.result,
            //   CONSTANTS.feedActivity.SHAREFEED
            // );
          }
        })
        .catch(err => {
          _this.setState({
            SVGLoader: false
          });
          console.log(err);
        });
    }
  };

  addComment = (feed, feedIndex) => {
    if (feed.feedId) {
      let _this = this;

      _this.setState({
        SVGLoader: true
      });

      let userId = this.state.userId || '';
      let comment = this.state['comment_' + feedIndex];
      let name = this.state.firstName + ' ' + this.state.lastName;
      let title = this.state.title;
      let profilePicture = this.state.profilePicture;
      let dateTime = moment().valueOf();
      let lastActivityTime = moment().valueOf();
      let lastActivityType = CONSTANTS.feedActivity.COMMENTONFEED;

      let data = {
        feedId: feed.feedId,
        userId,
        dateTime,
        comment,
        lastActivityTime,
        lastActivityType
      };

      let feedDataCopy = [...this.state.feedData];

      spikeViewApiService('addFeedComment', data)
        .then(response => {
          if (response.data.status === 'Success') {
            let commentId = response.data.result.commentId;
            this.state.feedData[feedIndex].comments.push({
              commentId: commentId,
              comment: comment,
              userId: userId,
              name: name,
              profilePicture: profilePicture,
              title: title,
              likes: [],
              dateTime: moment().valueOf()
            });
            _this.setState({
              feedData: feedDataCopy,
              ['comment_' + feedIndex]: '',
              SVGLoader: false
            });
            // _this.updateRecentActivityTime(
            //   feed.feedId,
            //   CONSTANTS.feedActivity.COMMENTONFEED
            // );
          }
        })
        .catch(err => {
          console.log(err);
        });

      if (userId !== parseInt(feed.postedBy, 10)) {
        let text =
          this.props.firstName +
          ' ' +
          (this.state.lastName ? this.state.lastName : '') +
          ' commented on Your post';
        this.setNotification(feed, text);
      }
    }
  };

  deleteComment = (feedId, commentId, feedIndex) => {
    console.log(feedIndex);
    if (feedId && commentId) {
      let dateTime = moment().valueOf();
      let data = {
        feedId,
        commentId,
        dateTime
      };
      let feedDataCopy = [...this.state.feedData];
      spikeViewApiService('deleteComment', data)
        .then(response => {
          if (response.data.status === 'Success') {
            _.remove(this.state.feedData[feedIndex].comments, {
              commentId: commentId
            });
            this.setState({ feedData: feedDataCopy });
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  deleteFeed = (feedId, feedIndex) => {
    if (feedId) {
      let dateTime = moment().valueOf();
      let data = {
        feedId,
        dateTime
      };
      let feedDataCopy = [...this.state.feedData];
      spikeViewApiService('deleteFeed', data)
        .then(response => {
          if (response.data.status === 'Success') {
            if (feedIndex !== -1) {
              console.log(feedIndex);
              feedDataCopy.splice(feedIndex, 1);
              this.setState({ feedData: feedDataCopy });
            }
            this.props.refreshFeeds('', '', 'delete', feedId);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  updateRecentActivityTime = (feedId, lastActivityType) => {
    if (feedId) {
      let lastActivityTime = moment().valueOf();
      let data = {
        feedId,
        lastActivityTime,
        lastActivityType
      };
      spikeViewApiService('updateLastActivityTime', data)
        .then(response => {
          if (response.data.status === 'Success') {
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  updateFeed = (feedId, visibility, feedIndex) => {
    if (feedId && visibility) {
      let scope = this.userIdArr;
      let data = {
        feedId,
        visibility,
        scope
      };
      let feedDataCopy = [...this.state.feedData];
      let _this = this;
      spikeViewApiService('updateFeed', data)
        .then(response => {
          if (response.data.status === 'Success') {
            this.state.feedData[feedIndex].visibility = visibility;
            _this.setState({
              feedData: feedDataCopy
            });
            //_this.props.refreshFeeds();
            if (scope.length > 0) {
              _this.setState({
                feedId: '',
                connectionModal: !this.state.connectionModal
              });
              _this.userIdArr = [];
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  connectionModal = (feedId, feedIndex) => {
    if (feedId === '') {
      this.setState({
        feedId: '',
        connectionLoader: true,
        connectionModal: !this.state.connectionModal,
        feedIndex: ''
      });
    } else {
      this.setState({
        feedId: feedId,
        connectionLoader: true,
        connectionModal: !this.state.connectionModal,
        feedIndex: feedIndex
      });
    }
    if (this.props.groupId) {
      this.getGroupMemberList(this.props.groupId);
    } else this.getMyConnections();
  };

  getMyConnections = () => {
    let userId = this.state.userId;
    spikeViewApiService('getChatConnections', { userId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          let memberList = response.data.result.Accepted
            ? response.data.result.Accepted
            : [];
          console.log(memberList);
          this.setState({ myConnections: memberList, connectionLoader: false });
        }
      })
      .catch(err => {
        this.setState({ connectionLoader: false });
        console.log(err);
      });
  };

  handleCheck = (connectionId, event) => {
    if (event.target.checked) {
      this.userIdArr.push(connectionId);
    } else {
      var index = this.userIdArr.indexOf(connectionId);
      if (index !== -1) this.userIdArr.splice(index, 1);
    }
  };

  incremenetPageNo = () => {
    this.setState(
      (prevState, props) => {
        const startPage = prevState.startPage + 1;
        return { startPage };
      },
      () => {
        console.log('next page number ', this.state.startPage);
      }
    );
  };

  loadFeeds = () => {
    const pageNo = this.state.startPage;
    this.props.refreshFeeds(pageNo, feedLength => {
      if (feedLength === 0) {
        this.setState({
          hasMoreData: false
        });
      } else {
        this.incremenetPageNo();
      }
    });
  };

  showCommentBox = feedId => {
    if (feedId) {
      this.setState({
        ['comment_' + feedId]: !this.state['comment_' + feedId]
      });
    }
  };

  loadComments = (comments, feedId, feedIndex, feed) => {
    let commentsData = [...comments];
    let dots = <span className="icon-dots" />;
    console.log(this.state.commentCount);
    return (
      <div>
        {comments && comments.length > 0
          ? comments
              .slice(0, this.state.commentCount)
              .map((comment, commentIndex) => (
                <div className="c-wrapper" key={commentIndex}>
                  <div className="c--comments">
                    <div className="user-icon">
                      {comment.profilePicture ? (
                        <img
                          className="object-fit-cover"
                          src={getThumbImage('medium', comment.profilePicture)}
                          alt=""
                        />
                      ) : (
                        <span class="icon-user_default2" />
                      )}
                    </div>
                    <div className="c--parent">
                      <div className="user-details">
                        <div className="ud--wrapper">
                          <Link
                            to={{
                              pathname:
                                this.state.userId === comment.userId
                                  ? '/student/profile/'
                                  : '/student/profile/' + comment.userId
                            }}
                          >
                            <div className="u--name wrap-long-words">
                              {comment.name}
                            </div>
                            <div className="u--designation">
                              {comment.title}
                            </div>
                          </Link>
                          <div className="ud--right">
                            <div className="c--time">
                              <span>{moment(comment.dateTime).fromNow()}</span>
                            </div>
                            {comment.userId === this.state.userId ? (
                              <Nav>
                                <NavDropdown eventKey="3" title={dots} id="">
                                  {/* <MenuItem eventKey="3.1">
                                    <span className="icon-private icon " />
                                    Report
                                  </MenuItem> */}
                                  <MenuItem
                                    eventKey="3.1"
                                    onSelect={this.deleteComment.bind(
                                      this,
                                      feedId,
                                      comment.commentId,
                                      feedIndex
                                    )}
                                  >
                                    <span className="icon-delete icon" />
                                    Delete
                                  </MenuItem>
                                </NavDropdown>
                              </Nav>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                        <div className="u--comment">
                          <p>{comment.comment}</p>
                        </div>
                      </div>
                      <div className="likes-comments--wrapper flex align-center">
                        <ul className="up--control small">
                          {this.renderLikeOnComment(
                            feed,
                            comment,
                            feedIndex,
                            commentIndex
                          )}
                          {/* <li>
                      <a href="">
                        <span className="icon-comment" /> Reply
                      </a>
                    </li> */}
                        </ul>

                        <ul className="up--control small">
                          {comment.likes && comment.likes.length > 0 ? (
                            <li>
                              <a
                                onClick={this.likeModal.bind(
                                  this,
                                  comment.likes,
                                  0
                                )}
                              >
                                <span className="count">
                                  {comment.likes.length}
                                </span>{' '}
                                {comment.likes.length <= 1 ? ' Like' : ' Likes'}
                              </a>
                            </li>
                          ) : (
                            ''
                          )}
                          {/* <li>
                      <a href="">
                        <span>221</span> Replies
                      </a>
                    </li> */}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ))
          : ''}
        {commentsData.length > 2 &&
        commentsData.length > this.state.commentCount ? (
          <a
            className="show-more"
            onClick={this.showMoreComments.bind(
              this,
              comments,
              feedId,
              feedIndex,
              feed
            )}
          >
            <small>Show More</small>
          </a>
        ) : (
          ''
        )}
      </div>
    );
  };

  showMoreComments = (comments, feedId, feedIndex, feed, event) => {
    this.setState(
      {
        commentCount: this.state.commentCount + 5
      },
      () => this.loadComments(comments, feedId, feedIndex, feed)
    );
  };

  render() {
    //let dropdown_bar = <span className="icon-more bigIcon" />;
    let dots = <span className="icon-dots" />;
    let sharedPost = this.state.sharedPost;
    return (
      <div>
        <InfiniteScroll
          //This is important field to render the next data
          dataLength={this.state.feedData.length}
          next={this.loadFeeds}
          hasMore={this.state.hasMoreData}
          loader={
            this.state.loader === true ? (
              <img
                className="ml-1"
                src="../assets/img/svg-loaders/three-dots.svg"
                width="40"
                alt="loader"
              />
            ) : (
              false
            )
          }
          endMessage={
            this.state.feedData.length === 0 ? (
              ''
            ) : (
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            )
          }
        >
          {/* below props only if you need pull down functionality */}
          {/* refreshFunction={this.refresh}
          pullDownToRefresh
          pullDownToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>
              &#8595; Pull down to refresh
            </h3>
          }
          releaseToRefreshContent={
            <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
          } */}
          {/* {items}/ */}

          {this.state.feedData && this.state.feedData.length > 0 ? (
            this.state.feedData.map((feed, index) => (
              <div
                className="postWrapper"
                key={feed.feedId}
                //title={feed.feedId}
              >
                <div className="pw-postHeader">
                  <div className="pw-pc--wrapper">
                    {feed.likes &&
                    feed.likes.length > 0 &&
                    feed.lastActivityType ===
                      CONSTANTS.feedActivity.LIKEFEED ? (
                      <div className="pw-pc--left">
                        <Link
                          to={{
                            pathname:
                              this.state.userId ===
                              feed.likes[feed.likes.length - 1].userId
                                ? '/student/profile/'
                                : '/student/profile/' +
                                  feed.likes[feed.likes.length - 1].userId
                          }}
                        >
                          <span className="liked--by">
                            {feed.likes[feed.likes.length - 1].name}
                          </span>
                        </Link>
                        likes this
                      </div>
                    ) : feed.comments &&
                    feed.comments.length > 0 &&
                    feed.lastActivityType ===
                      CONSTANTS.feedActivity.COMMENTONFEED ? (
                      <div className="pw-pc--left">
                        <Link
                          to={{
                            pathname:
                              this.state.userId ===
                              feed.comments[feed.comments.length - 1]
                                .commentedBy
                                ? '/student/profile/'
                                : '/student/profile/' +
                                  feed.comments[feed.comments.length - 1]
                                    .commentedBy
                          }}
                        >
                          <span className="liked--by">
                            {feed.comments[feed.comments.length - 1].name}
                          </span>
                        </Link>
                        commented on this
                      </div>
                    ) : feed.lastActivityType ===
                    CONSTANTS.feedActivity.SHAREFEED ? (
                      <div className="pw-pc--left">
                        <Link
                          to={{
                            pathname:
                              this.state.userId === feed.postedBy
                                ? '/student/profile/'
                                : '/student/profile/' + feed.postedBy
                          }}
                        >
                          <span className="liked--by">
                            {feed.firstName || ''} {feed.lastName || ''}
                          </span>
                        </Link>
                        shared&nbsp;
                        <Link
                          to={{
                            pathname:
                              this.state.userId === feed.postOwner
                                ? '/student/profile/'
                                : '/student/profile/' + feed.postOwner
                          }}
                        >
                          <a className="liked--by">
                            {feed.postOwnerFirstName && feed.postOwnerLastName
                              ? feed.postOwnerFirstName +
                                ' ' +
                                feed.postOwnerLastName +
                                "'s"
                              : feed.postOwnerFirstName
                                ? feed.postOwnerFirstName + "'s"
                                : ''}
                            {/* {feed.postOwnerFirstName || ''}
                            {feed.postOwnerLastName
                              ? feed.postOwnerLastName + "'s"
                              : ' '} */}
                          </a>
                        </Link>
                        post
                      </div>
                    ) : feed.tags && feed.tags.length > 0 ? (
                      <div className="pw-pc--left">
                        <Link
                          to={{
                            pathname:
                              this.state.userId === feed.postedBy
                                ? '/student/profile/'
                                : '/student/profile/' + feed.postedBy
                          }}
                        >
                          <a className="liked--by">
                            {feed.firstName} {feed.lastName}
                          </a>
                        </Link>
                        is with &nbsp;
                        <a onClick={this.likeModal.bind(this, feed.tags, 1)}>
                          {feed.tags.length} others
                        </a>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </div>

                {/* <div className="pw-pc--right">
                      <Nav>
                        <NavDropdown eventKey="3" title={dropdown_bar} id="">
                          <MenuItem eventKey="3.1">
                            <span className="icon-connections icon" />
                            Delete
                          </MenuItem>
                          <MenuItem eventKey="3.1">
                            <span className="icon-private icon " />
                            Private
                          </MenuItem>
                          <MenuItem eventKey="3.2">
                            <span className="icon-public icon" />
                            Public
                          </MenuItem>
                          <MenuItem eventKey="3.3">
                            <span className="icon-all_connections icon" />
                            All connections
                          </MenuItem>
                          <MenuItem eventKey="3.4">
                            <span className="icon-selected_connections icon">
                              <span className="path1" />
                              <span className="path2" />
                              <span className="path3" />
                            </span>
                            selected connections{' '}
                          </MenuItem>
                        </NavDropdown>
                      </Nav>
                    </div>  */}

                <div className="pw-postBody">
                  <div className="u--topDetails">
                    <div className="user-icon">
                      {feed.profilePicture ? (
                        <img
                          className="object-fit-cover"
                          src={getThumbImage('medium', feed.profilePicture)}
                          alt=""
                        />
                      ) : (
                        <span class="icon-user_default2" />
                      )}
                    </div>
                    <div className="user-details">
                      <div className="ud--wrapper">
                        <Link
                          to={{
                            pathname:
                              this.state.userId === feed.postedBy
                                ? '/student/profile/'
                                : '/student/profile/' + feed.postedBy
                          }}
                        >
                          <div className="u--name wrap-long-words">
                            {feed.firstName} {feed.lastName}
                          </div>
                          <div className="u--designation">
                            {feed.title || ''}
                          </div>
                          <div className="c--time">
                            <span>{moment(feed.dateTime).fromNow()}</span>
                          </div>
                        </Link>
                        {feed.postedBy === this.state.userId ? (
                          <div className="ud--right">
                            <Nav>
                              <NavDropdown eventKey="3" title={dots} id="">
                                <MenuItem
                                  eventKey="3.1"
                                  onSelect={this.deleteFeed.bind(
                                    this,
                                    feed.feedId,
                                    index
                                  )}
                                >
                                  <span className="icon-delete icon" />
                                  Delete Post
                                </MenuItem>
                                {feed.visibility !== 'Private' ? (
                                  <MenuItem
                                    eventKey="3.1"
                                    onSelect={this.updateFeed.bind(
                                      this,
                                      feed.feedId,
                                      'Private',
                                      index
                                    )}
                                  >
                                    <span className="icon-public icon" />
                                    Make it as Private
                                  </MenuItem>
                                ) : (
                                  ''
                                )}

                                {feed.visibility !== 'Public' ? (
                                  <MenuItem
                                    eventKey="3.1"
                                    onSelect={this.updateFeed.bind(
                                      this,
                                      feed.feedId,
                                      'Public',
                                      index
                                    )}
                                  >
                                    <span className="icon-private icon" />
                                    Make it as Public
                                  </MenuItem>
                                ) : (
                                  ''
                                )}

                                {feed.visibility !== 'AllConnections' ? (
                                  <MenuItem
                                    eventKey="3.1"
                                    onSelect={this.updateFeed.bind(
                                      this,
                                      feed.feedId,
                                      'AllConnections',
                                      index
                                    )}
                                  >
                                    <span className="icon-all_connections icon" />
                                    All Connections
                                  </MenuItem>
                                ) : (
                                  ''
                                )}

                                {feed.visibility !== 'SelectedConnections' ? (
                                  <MenuItem
                                    eventKey="3.1"
                                    onSelect={this.connectionModal.bind(
                                      this,
                                      feed.feedId,
                                      index
                                    )}
                                  >
                                    <span className="icon-selected_connections icon">
                                      <span className="path1" />
                                      <span className="path2" />
                                      <span className="path3" />
                                    </span>
                                    selected connections
                                  </MenuItem>
                                ) : (
                                  ''
                                )}
                              </NavDropdown>
                            </Nav>
                          </div>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </div>

                  {feed.postOwner ? (
                    <p className="wrap-long-words">{feed.shareText}</p>
                  ) : feed.post && feed.post.text ? (
                    <p className="wrap-long-words">{feed.post.text}</p>
                  ) : (
                    ''
                  )}

                  {!feed.postOwner &&
                  feed.post &&
                  feed.post.images &&
                  feed.post.images.length > 0
                    ? this.renderImages(feed.post.images)
                    : []}

                  {!feed.postOwner && feed.post && feed.post.media
                    ? this.renderVideo(feed.post.media)
                    : ''}

                  {feed.postOwner ? (
                    <div className="postWrapper card">
                      <div className="pw-postBody">
                        <div className="u--topDetails">
                          <div className="user-icon">
                            {feed.postOwnerProfilePicture ? (
                              <img
                                className="object-fit-cover"
                                src={getThumbImage(
                                  'medium',
                                  feed.postOwnerProfilePicture
                                )}
                                alt=""
                              />
                            ) : (
                              <span class="icon-user_default2" />
                            )}
                          </div>
                          <div className="user-details">
                            <div className="ud--wrapper">
                              <Link
                                to={{
                                  pathname:
                                    this.state.userId === feed.postedBy
                                      ? '/student/profile/'
                                      : '/student/profile/' + feed.postedBy
                                }}
                              >
                                <div className="u--name wrap-long-words">
                                  {feed.postOwnerFirstName || ''}
                                  {feed.postOwnerLastName || ''}
                                </div>
                                <div className="u--designation">
                                  {feed.postOwnerTitle || ''}
                                </div>
                                <div className="c--time">
                                  <span>
                                    {moment(feed.shareTime).fromNow()}
                                  </span>
                                </div>
                              </Link>
                            </div>
                          </div>
                        </div>
                        <p>
                          {feed.post && feed.post.text ? feed.post.text : ''}
                        </p>
                        {feed.post &&
                        feed.post.images &&
                        feed.post.images.length > 0
                          ? this.renderImages(feed.post.images)
                          : []}

                        {feed.post && feed.post.media
                          ? this.renderVideo(feed.post.media)
                          : ''}
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>

                <div className="pw-postControls p-0">
                  <div className="pw-pc--wrapper">
                    <div className="pw-pc--left">
                      <ul className="up--control">
                        {this.renderLikeSection(feed.likes, feed, index)}

                        {/* comment section start */}
                        <li>
                          <a
                            onClick={this.showCommentBox.bind(
                              this,
                              feed.feedId
                            )}
                          >
                            <span className="icon-comment1" />{' '}
                          </a>
                        </li>
                        {/* comment section end */}
                        <li>
                          <a onClick={this.shareModal.bind(this, feed)}>
                            <span className="icon-share1" />
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="pw-pc--right">
                      <ul className="up--control comments-likes">
                        {feed.likes && feed.likes.length > 0 ? (
                          <li>
                            <a
                              onClick={this.likeModal.bind(this, feed.likes, 0)}
                            >
                              <span className="count">{feed.likes.length}</span>
                              {feed.likes.length <= 1 ? ' Like' : ' Likes'}
                            </a>
                          </li>
                        ) : null}
                        {feed.comments && feed.comments.length > 0 ? (
                          <li>
                            <a>
                              <span className="count">
                                {feed.comments.length}
                              </span>{' '}
                              {feed.comments.length <= 1
                                ? ' Comment'
                                : ' Comments'}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                </div>

                {this.state['comment_' + feed.feedId] === true ||
                (feed.comments && feed.comments.length > 0) ? (
                  <div className="comments--wrapper">
                    <div
                      className={`c-wrapper  m--comment ${
                        this.state['comment_' + feed.feedId] === true
                          ? 'active'
                          : ''
                      }`}
                      //id={this.state['comment_' + feed.feedId]}
                      //style={{ display: 'none' }}
                    >
                      <div className="c--comments">
                        {feed.profilePicture ? (
                          <div className="user-icon">
                            <img
                              className="object-fit-cover"
                              src={getThumbImage(
                                'small',
                                this.state.profilePicture
                              )}
                              alt=""
                            />
                          </div>
                        ) : (
                          <div className="user-icon">
                            <span className="icon-user_default2" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="input-group small">
                            <FormGroup
                              controlId="formHorizontalEmail"
                              className="fullWidth"
                            >
                              <FormControl
                                type="text"
                                placeholder="Add Comment"
                                name="comment"
                                value={this.state['comment_' + index]}
                                onChange={this.handleChange.bind(this, index)}
                                onKeyPress={this.submitData.bind(
                                  this,
                                  feed,
                                  index
                                )}
                                maxLength="500"
                              />
                            </FormGroup>
                            <InputGroup.Addon>
                              {this.state.commentButton === true ? (
                                this.state.SVGLoader === false ? (
                                  <a
                                    onClick={this.addComment.bind(
                                      this,
                                      feed,
                                      index
                                    )}
                                  >
                                    <span class="icon-post1" />
                                  </a>
                                ) : (
                                  ''
                                )
                              ) : (
                                ''
                              )}
                            </InputGroup.Addon>
                          </div>
                        </div>
                      </div>
                    </div>

                    {this.loadComments(feed.comments, feed.feedId, index, feed)}
                  </div>
                ) : (
                  ''
                )}
              </div>
            ))
          ) : (
            <div align="center">
              <img src={noFeedImage} alt="feedImage" />
              <p className="alert-msg">No feed yet</p>
              <span style={{ color: '#3b78e0' }}>
                Start posting with people around you
              </span>
            </div>
          )}
        </InfiniteScroll>

        <Modal
          show={this.state.likeModal}
          onHide={this.likeModal.bind(this, [])}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              {this.state.action === 0 ? 'Liked By' : 'Tagged User '}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul className="likedBy--user">
              {this.state.likeList && this.state.likeList.length > 0
                ? this.state.likeList.map((item, index) => (
                    <li key={index}>
                      <div className="u--topDetails">
                        <div className="user-icon">
                          {item.profilePicture ? (
                            <img
                              className="object-fit-cover"
                              src={getThumbImage('medium', item.profilePicture)}
                              alt=""
                            />
                          ) : (
                            <span className="icon-user_default2" />
                          )}
                        </div>
                        <div className="user-details">
                          <div className="ud--wrapper">
                            <Link
                              to={{
                                pathname:
                                  this.state.userId === item.userId
                                    ? '/student/profile/'
                                    : '/student/profile/' + item.userId
                              }}
                            >
                              <div className="u--name wrap-long-words">
                                {item.name}
                              </div>
                              <div className="u--designation">{item.title}</div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                : ''}
            </ul>
          </Modal.Body>
        </Modal>

        {/* See share popup modal window */}
        <Modal
          show={this.state.shareModal}
          onHide={this.shareModal.bind(this, '')}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">Share</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="u--topDetails">
              <div className="user-icon">
                {this.state.profilePicture ? (
                  <img
                    className="object-fit-cover"
                    src={getThumbImage('medium', this.state.profilePicture)}
                    alt=""
                  />
                ) : (
                  <span class="icon-user_default2" />
                )}
              </div>
              <div className="user-details">
                <div className="ud--wrapper">
                  <a>
                    <div className="u--name wrap-long-words">
                      {this.state.firstName} {this.state.lastName}
                    </div>
                    <div className="u--designation">{this.state.title}</div>
                  </a>
                </div>
              </div>
            </div>
            <FormGroup controlId="formControlsTextarea">
              <FormControl
                componentClass="textarea"
                className="small"
                placeholder="What's on your mind?"
                name="postText"
                value={this.state.postText}
                onChange={this.handleShareChange}
                maxLength="2000"
              />
            </FormGroup>

            <div className="flex justify-end mb-1">
              <div className="customDropdownWrapper with-icon mr-1">
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

              <a
                className="btn btn-primary with-icon smallBtn"
                onClick={this.shareFeed.bind(
                  this,
                  sharedPost.feedId,
                  sharedPost.postedBy
                )}
              >
                {this.state.SVGLoader === false ? (
                  <span className="icon-post1 icon"> Post</span>
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
            <div className="postWrapper card">
              <div className="pw-postBody">
                <div className="u--topDetails">
                  <div className="user-icon">
                    {sharedPost.profilePicture ? (
                      <img
                        className="object-fit-cover"
                        src={getThumbImage('medium', sharedPost.profilePicture)}
                        alt=""
                      />
                    ) : (
                      <span class="icon-user_default2" />
                    )}
                  </div>
                  <div className="user-details">
                    <div className="ud--wrapper">
                      <a>
                        <div className="u--name wrap-long-words">
                          {(sharedPost.firstName || '') +
                            ' ' +
                            (sharedPost.lastName || '')}
                        </div>
                        <div className="u--designation">
                          {sharedPost.title || ''}
                        </div>
                        {/* <div className="c--time">
                          <span>{moment(sharedPost.dateTime).fromNow()}</span>
                        </div> */}
                      </a>
                    </div>
                  </div>
                </div>
                <p>{sharedPost.post && sharedPost.post.text}</p>

                {sharedPost.post &&
                sharedPost.post.images &&
                sharedPost.post.images.length > 0
                  ? this.renderImages(sharedPost.post.images)
                  : []}

                {sharedPost.post && sharedPost.post.media
                  ? this.renderVideo(sharedPost.post.media)
                  : ''}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer />
        </Modal>

        <Modal
          show={this.state.connectionModal}
          onHide={this.connectionModal.bind(this, '')}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
            {!this.props.groupId? "My Connections" : "Group Connections"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul className="likedBy--user">
              {!this.props.groupId
                ? this.state.myConnections && this.state.myConnections.length > 0
                ? this.state.myConnections.map((connection, index) => (
                    <li key={index}>
                      <div className="u--topDetails">
                        <div className="user-icon">
                          {connection.partner.profilePicture ? (
                            <img
                              className="object-fit-cover"
                              src={getThumbImage(
                                'medium',
                                connection.partner.profilePicture
                              )}
                              alt=""
                            />
                          ) : (
                            <span class="icon-user_default2" />
                          )}
                        </div>
                        <div className="user-details ">
                          <div className="ud--wrapper">
                            <a>
                              <div className="u--name wrap-long-words">
                                {connection.partner.firstName || ''}{' '}
                                {connection.partner.lastName || ''}
                              </div>
                              <div className="u--designation">
                                {connection.partner.title || ''}
                              </div>
                            </a>
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
                : ''
                : this.state.groupMemberList &&
                this.state.groupMemberList.length > 0
                ? this.state.groupMemberList.map((connection, index) => (                
                  connection.status ===
                  CONSTANTS.groupStatus.ACCEPTED ? <li key={index}>
                    <div className="u--topDetails">
                      <div className="user-icon">
                        {connection.profilePicture ? (
                          <img
                            className="object-fit-cover"
                            src={getThumbImage(
                              'medium',
                              connection.profilePicture
                            )}
                            alt=""
                          />
                        ) : (
                          <span class="icon-user_default2" />
                        )}
                      </div>
                      <div className="user-details ">
                        <div className="ud--wrapper">
                          <a>
                            <div className="u--name wrap-long-words">
                              {connection.firstName || ''}{' '}
                              {connection.lastName || ''}
                            </div>
                            <div className="u--designation">
                              {connection.title || ''}
                            </div>
                          </a>
                          <div className="ud--right">
                            <Checkbox
                              className="checkbox-primary rounded m-0"
                              name="connections"
                              id={`connect_${connection.connectId}`}
                              value={connection.userId}
                              onChange={this.handleCheck.bind(
                                this,
                                connection.userId
                              )}
                            >
                              <span className="check" />
                            </Checkbox>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>:null))
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
            {this.state.feedId === '' ? (
              <Button
                bsStyle="primary"
                className="no-bold no-round"
                onClick={this.connectionModal.bind(this, '')}
              >
                Save
              </Button>
            ) : (
              <Button
                bsStyle="primary"
                className="no-bold no-round"
                onClick={this.updateFeed.bind(
                  this,
                  this.state.feedId,
                  'SelectedConnections',
                  this.state.feedIndex
                )}
              >
                Save
              </Button>
            )}
            <Button
              bsStyle="default"
              className="no-bold no-round"
              onClick={this.connectionModal.bind(this, '')}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/*images popup */}
        <Modal
          bsSize="large"
          className="fullPageModal"
          show={this.state.imagesPopup}
          onHide={this.imagesPopup}
        >
          <Modal.Header closeButton>
            <Modal.Title className="subtitle text-center">
              Photos Gallery
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Slider {...photoGallery} className="slider full-page--slider">
              {this.state.sliderImages && this.state.sliderImages.length > 0
                ? this.state.sliderImages.map((img, index) => (
                    <div className="slider-item">
                      <img
                        className="img-responsive"
                        src={getThumbImage('original', img)}
                        alt=""
                      />
                    </div>
                  ))
                : null}
            </Slider>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default ViewFeed;
