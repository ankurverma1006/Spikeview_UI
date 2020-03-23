import React, { Component } from 'react';
import { connect } from 'react-redux';
//import { ToastContainer } from 'react-toastify';

import spikeViewApiService from '../../common/core/api/apiService';
//import { ZoomInAndOut } from '../../common/commonFunctions';
import Header from '../header/header';
import FeedLeftSide from './feedLeftSide';
import FeedRightSide from './feedRightSide';
import AddFeed from './addFeed';
import ViewFeed from './viewFeed';
import GroupInfo from './groupInfo';
import _ from 'lodash';

class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      feeds: [],
      pageNo: 0,
      feedName: 'feed',
      selectedGroupFlag: false
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.add('home');
    document.body.classList.add('fixedHeader');
  }

  componentDidMount() {
    this.listFeeds();
  }

  listFeeds = (pageNo, cb, action, deletedFeedIdOrGroupId) => {
    let groupId = this.state.groupId;
    let skip = pageNo ? pageNo : this.state.pageNo;
    let userId = this.props.user.userId || '';
    if (action === 'groupAction') {
      groupId = deletedFeedIdOrGroupId;
      skip = 0;
    }

    spikeViewApiService(
      groupId ? 'listFeedByGroupId' : 'listFeed',
      groupId
        ? {
            groupId,
            skip
          }
        : {
            userId,
            skip
          }
    )
      .then(response => {
        if (response.data.status === 'Success') {
          let feeds = response.data.result;
          // console.log('API Response', feeds);
          //Call back function to increment the page number
          if (cb) cb(feeds.length);
          if (groupId) {
            this.setState((prevState, props) => {
              feeds =
                groupId && action === 'groupAction'
                  ? [...feeds]
                  : [...prevState.feeds, ...feeds];
              //console.log('after set state Response', feeds);
              feeds =
                groupId && action === 'groupAction'
                  ? _.unionBy([], feeds, 'feedId')
                  : _.unionBy(prevState.feeds, feeds, 'feedId');
              // console.log('after unionBy Response', feeds);
              if (action === 'delete') {
                let feedIndex = _.findIndex(feeds, [
                  'feedId',
                  deletedFeedIdOrGroupId
                ]);
                feeds.splice(feedIndex, 1);
                //   console.log('after deletetion feeds', feeds);
              }

              feeds = _.orderBy(feeds, ['feedId'], ['desc']);
              //  console.log('after orderBy Response', feeds);
              return { feeds };
            });
          } else {
            this.setState((prevState, props) => {
              feeds = [...prevState.feeds, ...feeds];

              //console.log('after set state Response', feeds);
              feeds = _.unionBy(prevState.feeds, feeds, 'feedId');
              // console.log('after unionBy Response', feeds);
              if (action === 'delete') {
                let feedIndex = _.findIndex(feeds, [
                  'feedId',
                  deletedFeedIdOrGroupId
                ]);
                feeds.splice(feedIndex, 1);
                //   console.log('after deletetion feeds', feeds);
              }

              feeds = _.orderBy(feeds, ['feedId'], ['desc']);
              //  console.log('after orderBy Response', feeds);
              return { feeds };
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  getGroupInfo = data => {
    this.listFeeds('', '', 'groupAction', data.groupId);
    this.setState({
      groupName: data.groupName,
      aboutGroup: data.aboutGroup,
      groupImage: data.groupImage,
      groupMember: data.myGrp,
      selectedGroup: data,
      selectedGroupFlag: true,
      groupId: data.groupId
    });
  };

  setUploadImage = data => {
    this.child.groupImageUpload();
  };

  render() {
    return (
      <div className="innerWrapper">
        <Header {...this.props} />
        {/* <ToastContainer
          autoClose={5000000000000}
          className="custom-toaster-main-cls"
          toastClassName="custom-toaster-bg"
          transition={ZoomInAndOut}
        /> */}
        <div className="container main home--innerWrapper">
          <FeedLeftSide {...this.props} />

          <div className="hi--main">
            {this.state.selectedGroupFlag ? (
              <GroupInfo
                selectedGroup={this.state.selectedGroup}
                userId={this.props.user.userId}
                setUploadImage={this.setUploadImage}
              />
            ) : null}
            <AddFeed
              userId={this.props.user.userId}
              refreshFeeds={this.listFeeds}
              groupId={this.state.groupId}
              isActive={this.props.user.isActive}
            />

            <ViewFeed
              feeds={this.state.feeds}
              userId={this.props.user.userId || ''}
              isActive={this.props.user.isActive}
              refreshFeeds={this.listFeeds}
              firstName={this.props.user.firstName}
              lastName={this.props.user.lastName}
              groupId={this.state.groupId}
              profilePicture={this.props.user.profilePicture}
              title={this.props.user.title}
            />
          </div>

          <FeedRightSide
            onRef={ref => (this.child = ref)}
            userId={this.props.user.userId || ''}
            groupMember={this.state.groupMember}
            getGroupInfo={this.getGroupInfo}
            feedName={this.state.feedName}
            {...this.props}
          />
        </div>
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
)(Feed);
