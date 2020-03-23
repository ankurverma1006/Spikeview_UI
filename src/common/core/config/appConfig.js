// used for passoword encryption
import validationMessages from '../constants/validationMessages';
import regExpressions from '../constants/regExpressions';
import icons from '../config/competencyIcons';
import moment from 'moment';
import { getAPIURL } from '../../commonFunctions';

const CONSTANTS = {
  IV_LENGTH: 16,
  ENCRYPTION_KEY: 'sd5b75nb7577#^%$%*&G#CGF*&%@#%*&',
  CRYPTER_KEY:
    '0xffffffff,0xffffffff,0xffffffff,0xffffffff,0xffffffff,0xfffffff8',
  regExpressions,
  validationMessages,
  azureStorageAccount: 'spikeviewmediastorage',
  // azureContainer: 'spikeview-media',
  azureContainer: getAPIURL().azureContainer,
  azureThumbContainer: getAPIURL().azureThumbContainer,
  APIPort: ':3002',
  azureBlobURI: 'https://spikeviewmediastorage.blob.core.windows.net',
  profileAlbum: 'profile',
  coverAlbum: 'cover',
  badgeAlbum: 'badges',
  certificateAlbum: 'certificates',
  mediaAlbum: 'media',
  trophieAlbum: 'trophy',
  feedAlbum: 'feeds',
  oragnizationAlbum: 'oragnization',
  audioAlbum: 'soundtrack',
  smallThumb: 's-',
  mediumThumb: 'm-',
  typeSchool: 'School',
  typeUniversity: 'University',
  fromYear: 2000,
  toYear: moment().year(),
  fromGrade: 1,
  toGrade: 12,
  socket: {
    URL: getAPIURL().httpServer + getAPIURL().APIURL + ':' + getAPIURL().APIPort
    //URL: 'http://' + getAPIURL().APIURL + ':3001'
  },
  icons,
  rangeSliderHideValue: 12,
  rangeSliderHideName: 'Hide',
  groupStatus: {
    REQUESTED: 'Requested',
    INVITED: 'Invited',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected'
  },
  feedActivity: {
    CREATEFEED: 'CreateFeed',
    LIKEFEED: 'LikeFeed',
    SHAREFEED: 'ShareFeed',
    COMMENTONFEED: 'CommentOnFeed'
  },
  singleTrack: 'single',
  multipleTrack: 'multiple'
};

export default CONSTANTS;
