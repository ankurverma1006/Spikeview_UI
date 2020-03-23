import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';

import { getLocalStorage } from './common/commonFunctions';

/******************** Common Routing ****************************/

import Login from './common/authorization/login';
import Signup from './common/authorization/signUp';
import ChangePassword from './common/changePassword/changePassword';
import ForgotPassword from './common/forgotPassword/resetPassword';

/******************** Student Routing ****************************/

import Feed from './student/feed/feed';
import GroupFeed from './student/feed/groupFeed';
import Messaging from './student/messaging/messaging';
import Connections from './student/connections/connections';
import Notification from './student/notifications/notifications';
import StudentProfile from './student/searchProfile/profile';
import StudentEditProfile from './student/profile/editProfile';
import AchievementDetail from './student/profile/competency/achievements/achievementDetail';
import RecommendationList from './student/profile/competency/recommendations/recommendationList';
import RecommendationDetail from './student/profile/competency/recommendations/recommendationDetail';
import RecommendationRequest from './student/profile/competency/recommendations/recommendationRequest';
import SearchUserProfile from './common/searchDropdown/searchResult';
import MutualConnections from './student/common/mutualConnections';
import ShareProfile from './student/shareProfile/shareProfile';
import PreviewSharedProfile from './student/previewSharedProfile/previewProfile';
import PersonalInfo from './student/profile/personalInfo';
import ProfileSharingLog from './student/profileSharingLog/profileLog';
import ManageGroup from './student/group/manageGroup';
import GroupListAll from './student/group/groupListAll';
import GroupMembersList from './student/group/groupMembersList';

/******************** Parent Routing ****************************/
import Dashboard from './parent/dashboard/dashboard';
import ParentConnections from './parent/connections/connections';
import ParentNotification from './parent/notifications/notifications';
import ParentMessaging from './parent/messaging/messaging';
import ParentEditProfile from './parent/profile/editProfile';
import ParentProfile from './parent/searchProfile/profile';
import ParentList from './parent/dashboard/parentList';

// import ReactGA from 'react-ga';

// const history = createHistory();
// ReactGA.initialize('UA-139519546-1');
// history.listen(location => ReactGA.pageview(location.pathname));

class SpikeViewRoute extends Component {
  componentWillMount() {
    this.getUserInfo();
  }

  getUserInfo() {
    let userInfo = getLocalStorage('userInfo');
    if (userInfo) {
      if (userInfo.token) {
        let access_token = userInfo.token;
        this.setState({ access_token: access_token });
        // if(userInfo && this.props.match.params){
        //   if(userInfo.userId == this.props.match.params.userId && this.props.match.params.recommendationId){
        //     this.props.history.push({
        //       pathname: '/recommendationRequest',
        //       state: { requestRecommendedId: this.props.match.params.recommendationId,userId: this.props.match.params.userId}
        //     });
        //   }
        // }else{

        // }
        //this.props.history.push('/home');
      }
    } else {
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <Switch>
        {/* Common routes for parent and student */}
        <Route exact path="/" component={Login} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/forgot" component={ForgotPassword} />
        <Route exact path="/changepassword" component={ChangePassword} />

        {/* Parent Routes */}
        <Route exact path="/student" component={StudentEditProfile} />
        <Route exact path="/student/profile" component={StudentEditProfile} />
        <Route exact path="/student/profile/:id" component={StudentProfile} />
        <Route exact path="/search/user" component={SearchUserProfile} />
        <Route exact path="/student/feed" component={Feed} />
        <Route exact path="/student/groupFeed" component={GroupFeed} />
        <Route exact path="/student/connections" component={Connections} />
        <Route exact path="/student/messages" component={Messaging} />
        <Route exact path="/student/notifications" component={Notification} />
        <Route exact path="/student/shareprofile" component={ShareProfile} />
        <Route exact path="/student/personalinfo" component={PersonalInfo} />
        <Route exact path="/student/profilelog" component={ProfileSharingLog} />

        <Route
          exact
          path="/student/previewprofile/:id"
          component={PreviewSharedProfile}
        />

        <Route
          exact
          path="/student/previewprofile"
          component={PreviewSharedProfile}
        />

        <Route
          exact
          path="/student/previewprofile/:id/:email/:pass"
          component={Login}
        />

        <Route
          exact
          path="/student/achievementdetail"
          component={AchievementDetail}
        />
        <Route
          exact
          path="/student/recommendations"
          component={RecommendationList}
        />
        <Route
          exact
          path="/student/recommendationdetail"
          component={RecommendationDetail}
        />
        <Route
          exact
          path="/student/recommendationrequest"
          component={RecommendationRequest}
        />

        <Route exact path="/student/managegroup" component={ManageGroup} />

        <Route exact path="/student/groupListAll" component={GroupListAll} />

        <Route
          exact
          path="/student/groupMembersList"
          component={GroupMembersList}
        />

        <Route
          exact
          path="/student/mutualconnections/:id"
          component={MutualConnections}
        />

        <Route exact path="/joingroup" component={Login} />
        <Route
          exact
          path="/login/:userId/:recommendationId/:email/:pass"
          component={Login}
        />

        <Route exact path="/autoLogin/:user/:pass" component={Login} />

        <Route
          exact
          path="/recommendation/:userId/:recommendationId/:email/:pass"
          component={Login}
        />

        {/* Parent Routes */}
        <Route exact path="/parent" component={Dashboard} />
        <Route exact path="/parent/dashboard" component={Dashboard} />
        <Route exact path="/parent/connections" component={ParentConnections} />
        <Route exact path="/parent/messaging" component={ParentMessaging} />
        <Route exact path="/parent/notifications" component={ParentNotification} />
        <Route exact path="/parent/profile" component={ParentEditProfile} />
        <Route exact path="/parent/profile/:id" component={ParentProfile} />
        <Route exact path="/parent/list" component={ParentList} />
      </Switch>
    );
  }
}
export default SpikeViewRoute;
