export default {
  login: {
    url: '/app/login',
    method: 'POST',
    data: {
      email: '',
      password: '',
      deviceId: ''
    },
    showResultMessage: false,
    showErrorMessage: true
  },

  signupStudent: {
    url: '/app/signup',
    method: 'POST',
    data: {
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      parentFirstName: '',
      parentLastName: '',
      roleId: '',
      dob: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  signupParent: {
    url: '/app/signup',
    method: 'POST',
    data: {
      firstName: '',
      lastName: '',
      email: '',
      roleId: '',
      students: []
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  roleType: {
    url: '/app/roleType',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  forgotPassword: {
    url: '/app/reset/password?email=:email',
    method: 'POST',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  resetPassword: {
    url: '/app/signup',
    method: 'POST',
    data: {
      firstName: '',
      lastName: '',
      email: '',
      parentEmail: '',
      roleId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  logout: {
    url: '/ui/logout',
    method: 'post',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  changePassword: {
    url: '/ui/update/password',
    method: 'POST',
    data: {
      oldPassword: '',
      newPassword: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getStudentPersonalInfo: {
    url: '/ui/personalInfo/:userId/false',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  updateStudentPersonalInfo: {
    url: '/ui/personalInfo',
    method: 'PUT',
    data: {
      userId: '',
      roleId: '',
      firstName: '',
      lastName: '',
      gender: '',
      genderAtBirth: '',
      dob: '',
      usCitizenOrPR: '',
      parents: [],
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      requireParentApproval: '',
      ccToParents: '',
      summary: '',
      tagline: '',
      mobileNo: '',
      title: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  addEducation: {
    url: '/ui/education',
    method: 'POST',
    data: {
      userId: '',
      organizationId: '',
      logo: '',
      institute: '',
      city: '',
      fromYear: '',
      toYear: '',
      fromGrade: '',
      toGrade: '',
      //fieldOfStudy: '',
      //grade: '',
      //fromDate: '',
      //toDate: '',
      description: '',
      isActive: '',
      type: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  editEducation: {
    url: '/ui/education',
    method: 'PUT',
    data: {
      educationId: '',
      userId: '',
      logo: '',
      organizationId: '',
      institute: '',
      city: '',
      fromYear: '',
      toYear: '',
      fromGrade: '',
      toGrade: '',
      //fieldOfStudy: '',
      //grade: '',
      //fromDate: '',
      //toDate: '',
      description: '',
      isActive: '',
      type: 'School'
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getEducation: {
    url: '/ui/education?educationId=:educationId',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  deleteEducation: {
    url: '/ui/education',
    method: 'DELETE',
    data: {
      educationId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  ListOragnization: {
    url: '/ui/organization',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  getAllEducation: {
    url: '/ui/education?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  updateProfileImage: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      profilePicture: '',
      userId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  updateUserSummary: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      summary: '',
      userId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  updateCoverImage: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      coverImage: '',
      userId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  updateUserTagline: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      tagline: '',
      userId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  updateName: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      firstName: '',
      lastName: '',
      userId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  getSASToken: {
    url: 'ui/azure/sas',
    method: 'POST',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getAllCompetency: {
    url: 'ui/competencyAllLevel',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getCompetencyById: {
    url: '/ui/competencyType?competencyTypeId=:competencyTypeId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getSkills: {
    url: 'ui/skills',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getImportance: {
    url: 'ui/importance',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  addAchievement: {
    url: '/ui/achievement',
    method: 'POST',
    data: {
      achievementId: '',
      competencyTypeId: '',
      level2Competency: '',
      level3Competency: '',
      userId: '',
      badge: [],
      certificate: [],
      asset: [],
      skills: [],
      title: '',
      description: '',
      fromDate: '',
      toDate: '',
      importance: '',
      guide: [],
      stories: '',
      isActive: 'true'
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  editAchievement: {
    url: '/ui/achievement',
    method: 'PUT',
    data: {
      achievementId: '',
      competencyTypeId: '',
      level2Competency: '',
      level3Competency: '',
      userId: '',
      badge: [],
      certificate: [],
      asset: [],
      skills: [],
      title: '',
      description: '',
      fromDate: '',
      toDate: '',
      importance: '',
      guide: [],
      stories: '',
      isActive: 'true'
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  listAchievementByUser1: {
    url: '/ui/achievementByLevel2/:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  listAchievementByUser: {
    url: '/ui/narratives/:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getAchievementById: {
    url: '/ui/achievement?achievementId=:achievementId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteAchievement: {
    url: '/ui/achievement',
    method: 'DELETE',
    data: {
      achievementId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  spiderGraph: {
    url: '/ui/spider/chart/:userId/:sharedId',
    method: 'GET',
    data: {},
    showErrorMessage: false,
    showResultMessage: false
  },

  getStudentsByParentProfile: {
    url: '/ui/user/studentsbyparent/:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  updateUserProfile: {
    url: '/ui/personalInfo',
    method: 'PUT',
    data: {
      userId: '',
      firstName: '',
      lastName: '',
      students: [],
      roleId: '',
      isActive: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      }
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  listRecommendationByUser: {
    url: '/ui/user/recommendations?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  updateRecommendation: {
    url: '/ui/recommendation',
    method: 'PUT',
    data: {
      recommendationId: '',
      recommendation: '',
      competencyTypeId: '',
      level3Competency: '',
      title: '',
      skills: [],
      stage: '',
      badge: [],
      certificate: [],
      asset: [],
      recommenderId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  getRecommendationById: {
    url: '/ui/recommendation?recommendationId=:recommendationId',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  addRecommendation: {
    url: '/ui/recommendation',
    method: 'POST',
    data: {
      userId: '',
      competencyTypeId: '',
      level2Competency: '',
      level3Competency: '',
      badge: [],
      certificate: [],
      asset: [],
      skills: [],
      title: '',
      request: '',
      interactionStartDate: '',
      interactionEndDate: '',
      firstName: '',
      lastName: '',
      email: '',
      recommendation: '',
      recommenderId: '',
      stage: '',
      name: '',
      profileImage: '',
      requesterEmail: '',
      recommenderTitle: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  deleteRecommendation: {
    url: '/ui/recommendation',
    method: 'DELETE',
    data: {
      recommendationId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  searchProfile: {
    url: 'ui/search?name=:name&like=true',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  addConnection: {
    url: 'ui/connect',
    method: 'POST',
    data: {
      userId: '',
      partnerId: '',
      dateTime: '',
      status: '',
      isActive: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateConnection: {
    url: 'ui/connect',
    method: 'PUT',
    data: {
      connectId: '',
      // userId: '',
      //partnerId: '',
      dateTime: '',
      status: '',
      isActive: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  deleteConnection: {
    url: 'ui/connect',
    method: 'DELETE',
    data: {
      connectId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getCount: {
    url: 'ui/counts/:userId/:sharedId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  addToProfileRecommendation: {
    url: 'ui/recommendation ',
    method: 'PUT',
    data: {
      recommendationId: '',
      stage: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getConnectionStatus: {
    url: 'ui/connect/status?userId=:userId&partnerId=:partnerId ',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  connectionList: {
    url: 'ui/connect/list?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getChatConnections: {
    url: 'ui/connect/chatList?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getChatFriendList: {
    url: 'ui/message/friendList/info?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getChatMessage: {
    url: 'ui/message?connectorId=:connectorId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  sendMessage: {
    url: '/ui/message',
    method: 'POST',
    data: {
      connectorId: '',
      sender: '',
      receiver: '',
      time: '',
      text: '',
      type: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  subscribeRequest: {
    url: 'ui/subscription',
    method: 'POST',
    data: {
      userId: '',
      followerId: '',
      followerName: '',
      dateTime: '',
      isActive: '',
      status: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  unsubscribeRequest: {
    url: 'ui/subscription',
    method: 'PUT',
    data: {
      subscribeId: '',
      userId: '',
      followerId: '',
      followerName: '',
      dateTime: '',
      isActive: '',
      status: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getSubscriptionStatus: {
    url: 'ui/subscription?userId=:userId&followerId=:followerId ',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  getSubscribersCount: {
    url: 'ui/subscription?followerId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  updateUserStatus: {
    url: '/ui/user/updateUserStatus',
    method: 'PUT',
    data: {
      userId: '',
      isActive: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  createFeed: {
    url: '/ui/feed',
    method: 'POST',
    data: {
      post: {
        text: '',
        images: [],
        media: ''
      },
      postedBy: '',
      dateTime: '',
      status: '',
      visibility: '',
      scope: [],
      isActive: '',
      tags: [],
      groupId: '',
      lastActivityTime: '',
      lastActivityType: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateFeed: {
    url: '/ui/feed/update',
    method: 'PUT',
    data: {
      feedId: '',     
      visibility: '',
      scope: []
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateLastActivityTime: {
    url: '/ui/feed/update',
    method: 'PUT',
    data: {
      feedId: '',
      lastActivityTime: '',
      lastActivityType: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  listFeed: {
    url: '/ui/feed/postList?userId=:userId&skip=:skip',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  addFeedComment: {
    url: 'ui/feed/addComment',
    method: 'PUT',
    data: {
      feedId: '',
      userId: '',
      comment: '',
      dateTime: '',
      name: '',
      title: '',
      profilePicture: '',
      lastActivityTime: '',
      lastActivityType: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteFeed: {
    url: 'ui/feed',
    method: 'DELETE',
    data: {
      feedId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteComment: {
    url: '/ui/remove/comment',
    method: 'POST',
    data: {
      feedId: '',
      commentId: '',
      dateTime: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  likeFeed: {
    url: 'ui/feed/addLike',
    method: 'PUT',
    data: {
      feedId: '',
      userId: '',
      isLike: '',
      lastActivityTime: '',
      lastActivityType: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  likeOnComment: {
    url: 'ui/feed/addLike',
    method: 'PUT',
    data: {
      feedId: '',
      userId: '',
      isLike: '',
      commentId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  shareFeed: {
    url: '/ui/share/feed',
    method: 'POST',
    data: {
      feedId: '',
      postedBy: '',
      postOwner: '',
      visibility: '',
      scope: [],
      shareTime: '',
      shareText: '',
      isActive: '',
      lastActivityTime: '',
      lastActivityType: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateHeaderCount: {
    url: '/ui/header',
    method: 'PUT',
    data: {
      userId: '',
      connectionCount: 0,
      messagingCount: 0,
      notificationCount: 0
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  getHeaderCount: {
    url: 'ui/header?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: true,
    showErrorMessage: true
  },

  createHeaderCount: {
    url: '/ui/header',
    method: 'POST',
    data: {
      userId: '',
      connectionCount: 0,
      messagingCount: 0,
      notificationCount: 0
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  mutualFriendList: {
    url: '/ui/mutual/friendlist?userId=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  notificationList: {
    url: '/ui/notification?userId=:userId&skip=:skip',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  postNotification: {
    url: '/ui/notification',
    method: 'POST',
    data: {
      userId: '',
      actedBy: '',
      postId: '',
      profilePicture: '',
      text: '',
      dateTime: 0,
      isRead: false
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteNotification: {
    url: '/ui/notification',
    method: 'DELETE',
    data: {
      notificationId: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteAllNotification: {
    url: '/ui/notification',
    method: 'DELETE',
    data: {
      userId: ''
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  getSkillsCount: {
    url: '/ui/skills/counts/:userId/:sharedId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  shareStudentProfile: {
    url: '/ui/share/profile',
    method: 'POST',
    data: {
      sharedType: '',
      profileOwner: '',
      firstName: '',
      lastName: '',
      email: '',
      shareTime: '',
      shareConfiguration: [],
      sharedView: '',
      isActive: '',
      theme: '',
      soundtrack: []
    },
    showErrorMessage: false,
    showResultMessage: false
  },

  updateShareMessageProfile: {
    url: '/ui/share/profile',
    method: 'PUT',
    data: {
      sharedId: '',
      shareTo: ''
    },
    showErrorMessage: false,
    showResultMessage: false
  },

  isShareProfileViewed: {
    url: '/ui/share/profile',
    method: 'PUT',
    data: {
      sharedId: '',
      isViewed: '',
      lastViewedTime: ''
    },
    showErrorMessage: false,
    showResultMessage: false
  },

  getSharedProfileConfiguration: {
    url: '/ui/share/profile?sharedId=:sharedId',
    method: 'GET',
    data: {},
    showErrorMessage: false,
    showResultMessage: false
  },

  addParentProfile: {
    url: '/ui/add/parent',
    method: 'POST',
    data: {
      roleId: '',
      firstName: '',
      lastName: '',
      email: '',
      parentId: '',
      studentId: '',
      parentName: ''
    },
    showErrorMessage: false,
    showResultMessage: false
  },

  removeStudentUser: {
    url: '/ui/user/detach',
    method: 'PUT',
    data: {
      studentId: '',
      parentId: ''
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  updateParentUserProfile: {
    url: '/ui/user',
    method: 'PUT',
    data: {
      userId: '',
      firstName: '',
      lastName: '',
      roleId: '',
      isActive: '',
      address: {
        street1: '',
        street2: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      }
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  getSharingProfileLog: {
    url: '/ui/share/profile/list?profileOwner=:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  revokeShareProfile: {
    url: '/ui/share/profile',
    method: 'PUT',
    data: {
      sharedId: '',
      isActive: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  createGroups: {
    url: '/ui/group',
    method: 'POST',
    data: {
      groupName: '',
      type: '',
      creationDate: '',
      createdBy: '',
      isActive: true,
      members: [],
      aboutGroup: '',
      otherInfo: '',
      groupImage: ''
    },
    showErrorMessage: true,
    showResultMessage: true
  },

  getGroupListByUser: {
    url: '/ui/group/mygroups/:userId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  getGroupMemberListByGroupId: {
    url: '/ui/group/members/:groupId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  deleteGroupByGroupId: {
    url: '/ui/group',
    method: 'DELETE',
    data: {
      groupId: ''
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  revokeGroupByGroupId: {
    url: '/ui/group/leave',
    method: 'POST',
    data: {
      userId: '',
      groupId: ''
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  listFeedByGroupId: {
    url: '/ui/feed/postListByGroupId?groupId=:groupId&skip=:skip',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  inviteGroupMember: {
    url: '/ui/group/inviteMembers',
    method: 'POST',
    data: {
      members: [],
      groupId: '',
      firstName: '',
      lastName: '',
      email: '',
      invitedBy: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateMemberStatus: {
    url: '/ui/group/updateMemberStatus',
    method: 'PUT',
    data: {
      groupId: '',
      userId: '',
      status: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  getUserListByRole: {
    url: 'ui/user?roleId=1&isActive=true',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  updateGroupInfo: {
    url: '/ui/group/updateGroupInfo',
    method: 'PUT',
    data: {
      groupId: '',
      groupName: '',
      aboutGroup: '',
      otherInfo: '',
      type: ''
    },
    showResultMessage: true,
    showErrorMessage: false
  },

  updateGroupImage: {
    url: '/ui/group',
    method: 'PUT',
    data: {
      groupId: '',
      groupImage: ''
    },
    showResultMessage: false,
    showErrorMessage: false
  },

  getGroupDetailByGroupId: {
    url: '/ui/group?groupId=:groupId',
    method: 'GET',
    data: {},
    showResultMessage: false,
    showErrorMessage: false
  },

  joinMemberInGroup: {
    url: '/ui/group/join',
    method: 'POST',
    data: {
      groupId: '',
      userId: ''
    },
    showResultMessage: true,
    showErrorMessage: true
  },

  updateSoundTrack: {
    url: '/ui/share/profile',
    method: 'PUT',
    data: {
      sharedId: '',
      soundtrack: []
    },
    showErrorMessage: false,
    showResultMessage: false
  }
};
