import React from 'react';
import { toast } from 'react-toastify';
import Transition from 'react-transition-group/Transition';
import 'react-toastify/dist/ReactToastify.css';
//import crypto from 'crypto';
import CONSTANTS from './core/config/appConfig';
import Cryptr from 'cryptr';
import moment from 'moment';
const ENCRYPTION_KEY = 'sd5b75nb7577#^%$%*&G#CGF*&%@#%*&';

var cryptlib = require('cryptlib'),
  iv = 'F@$%^*GD$*(*#!12', //16 bytes = 128 bit
  key = cryptlib.getHashSha256(ENCRYPTION_KEY, 32); //32 bytes = 256 bits

let azureURL = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}`;
let azureThumbURL = `${CONSTANTS.azureBlobURI}/${
  CONSTANTS.azureThumbContainer
}`;

const cryptr = new Cryptr(CONSTANTS.CRYPTER_KEY);
let toastId = '';

//used to encryption of localstorage data
export const encryptedData = data => {
  return cryptr.encrypt(data);
};

//used to decrypt localstorage data
export const decryptedData = data => {
  return cryptr.decrypt(data);
};

// used to set localstorage item
export const setLocalStorage = (key, value) => {
  value = JSON.stringify(value);
  const encodedData = encryptedData(value);
  localStorage.setItem(key, encodedData);
};

// used to get localstorage item
export const getLocalStorage = key => {
  if (key) {
    let data = localStorage.getItem(key);
    if (data) {
      data = JSON.parse(decryptedData(data));
      return data;
    }
  }

  return null;
};

// used to remove localstorage item
export const removeLocalStorage = key => {
  localStorage.removeItem(key);
};

// used to clear localstorage
export const clearLocalStorage = () => {
  localStorage.clear();
};

// toastr messages for error
export const showErrorToast = (errorMessage, event) => {
  if (!toast.isActive(toastId)) {
    toastId = toast.error(errorMessage, {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true
    });
  }
};

// toastr messages for success
export const showSuccessToast = message => {
  if (!toast.isActive(toastId)) {
    toastId = toast.success(message, {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true
    });
  }
};

// toastr messages for warning
export const showWarningToast = message => {
  if (!toast.isActive(toastId)) {
    toastId = toast.warn(message, {
      position: toast.POSITION.TOP_RIGHT,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true
    });
  }
};

// used zoomin and zoomout of toastr messages
export const ZoomInAndOut = ({ children, position, ...props }) => (
  <Transition
    {...props}
    timeout={200}
    onEnter={node => node.classList.add('zoomIn', 'animate')}
    onExit={node => {
      node.classList.remove('zoomIn', 'animate');
      node.classList.add('zoomOut', 'animate');
    }}
  >
    {children}
  </Transition>
);

// used to render validation message
export const renderMessage = message => {
  return <span className="error">{message}</span>;
};

export const encrypt = text => {
  let cryptText = cryptlib.encrypt(text, key, iv);
  return cryptText.replace(/\//g, '_spike_');
};
//  let buff = new Buffer(text);
//  return buff.toString('base64');
//return cryptlib.encrypt(text, key, iv);
//return text;
//};

export const decrypt = text => {
  let decrptText = text.replace(/_spike_/g, '/');
  return cryptlib.decrypt(decrptText, key, iv);
  // let buff = new Buffer(text, 'base64');
  //return buff.toString('ascii');
  // return cryptlib.decrypt(text, key, iv);
  //return text;
};

// export const encrypt = text => {
//   let buff = new Buffer(text);
//   let base64data = buff.toString('base64');
//   return base64data;
// };

// export const decrypt = text => {
//   let buff = new Buffer(text, 'base64');
//   text = buff.toString('ascii');
//   return text;
// };

// used to get apiurl for different servers
export function getAPIURL() {
  let returnUrl = {
    APIURL: '',
    azureContainer: '',
    azureThumbContainer: '',
    httpServer: '',
    APIPort: ''
  };
  switch (window.location.hostname) {
    case '104.42.51.157':
      returnUrl.APIURL = '104.42.51.157';
      returnUrl.azureContainer = 'spikeview-media-production';
      returnUrl.azureThumbContainer = 'spikeview-media-production-thumbnails';
      returnUrl.httpServer = 'https://';
      returnUrl.APIPort = '3002';
      break;

    case 'spikeview.com':
      returnUrl.APIURL = 'spikeview.com';
      returnUrl.azureContainer = 'spikeview-media-production';
      returnUrl.azureThumbContainer = 'spikeview-media-production-thumbnails';
      returnUrl.httpServer = 'https://';
      returnUrl.APIPort = '3002';
      break;

    case 'app.spikeview.com':
      returnUrl.APIURL = 'app.spikeview.com';
      returnUrl.azureContainer = 'spikeview-media-production';
      returnUrl.azureThumbContainer = 'spikeview-media-production-thumbnails';
      returnUrl.httpServer = 'https://';
   //   returnUrl.APIPort = '3002';
      break;

    case '103.76.253.131':
      returnUrl.APIURL = '103.76.253.131';
      returnUrl.azureContainer = 'spikeview-media-development';
      returnUrl.azureThumbContainer = 'spikeview-media-development-thumbnails';
      returnUrl.httpServer = 'http://';
      returnUrl.APIPort = '3002';
      break;

    default:
      returnUrl.APIURL = 'localhost'; //:'172.16.0.131';
      returnUrl.azureContainer = 'spikeview-media-development';
      returnUrl.azureThumbContainer = 'spikeview-media-development-thumbnails';
      returnUrl.httpServer = 'http://';
      returnUrl.APIPort = '3002';
      break;
  }
  return returnUrl;
}

// used to convert timestamp to date
export const timeStampToDate = timestamp => {
  timestamp = timestamp.toString();
  timestamp = timestamp.slice(0, -3);
  timestamp = parseInt(timestamp, 10);
  let momentDate = moment.unix(timestamp);
  return momentDate;
};

export const uploadToAzure = (type, userId, file, sasToken, callback) => {
  if (file !== '') {
    let AzureStorage = window.AzureStorage;
    let folderName = type === 1 ? CONSTANTS.profileAlbum : CONSTANTS.coverAlbum;
    let fileName = generateTimestamp(file.name);
    let uploadPath = `sv_${userId}/${folderName}/${fileName}`;

    const blobService = AzureStorage.Blob.createBlobServiceWithSas(
      CONSTANTS.azureBlobURI,
      sasToken
    );

    blobService.createBlockBlobFromBrowserFile(
      CONSTANTS.azureContainer,
      uploadPath,
      file,
      (error, result) => {
        if (callback) callback(error, result, uploadPath, fileName);
        if (error) {
          console.log('error ', error);
        }
      }
    );
  }
};

export const isValidURL = URL => {
  var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  return regexp.test(URL);
};

export const limitCharacter = (text, count) => {
  if (text && count) {
    return text.slice(0, count) + (text.length > count ? '...' : '');
  } else {
    return false;
  }
};

export const SampleNextArrow = props => {
  const { arrow, onClick } = props;
  return (
    <span
      className={`icon-right_carousel custom-next  next${arrow}`}
      onClick={onClick}
    />
  );
};

export const SamplePrevArrow = props => {
  const { arrow, onClick } = props;
  return (
    <span
      className={`icon-left_carousel custom-prev prev ${arrow}`}
      onClick={onClick}
    />
  );
};

const generateRandomString = () => {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

export const generateTimestamp = fileName => {
  let extension = fileName.split('.').pop();
  let newFileName =
    moment().valueOf() + generateRandomString() + '.' + extension;
  return newFileName;
};

const fileExists = image_url => {
  var http = new XMLHttpRequest();
  http.open('HEAD', image_url, false);
  http.send();
  return http.status != 404;
};

export const getThumbImage = (imageType, imagePath) => {
  if (imagePath) {
    // let newArray = imagePath.split('/');
    // if (newArray.length > 0) {
    //   if (getAPIURL().APIURL !== '103.76.253.131') {
    //     if (imageType === 'small') {
    //       let imageName = imagePath.replace(
    //         newArray[2],
    //         CONSTANTS.smallThumb + newArray[2]
    //       );
    //       imageName = `${azureThumbURL}/${imageName}`;
    //       if (fileExists(imageName)) {
    //         return imageName;
    //       } else {
    //         let imageName = `${azureURL}/${imagePath}`;
    //         return imageName;
    //       }
    //     }

    //     if (imageType === 'medium') {
    //       let imageName = imagePath.replace(
    //         newArray[2],
    //         CONSTANTS.mediumThumb + newArray[2]
    //       );
    //       imageName = `${azureThumbURL}/${imageName}`;
    //       if (fileExists(imageName)) {
    //         return imageName;
    //       } else {
    //         let imageName = `${azureURL}/${imagePath}`;
    //         return imageName;
    //       }
    //     }
    //   }

    if (
      imageType === 'original' ||
      imageType === 'medium' ||
      imageType === 'small'
    ) {
      let imageName = `${azureURL}/${imagePath}`;
      return imageName;
    }
  }
  //}
};

export const getIPAddress = onNewIP => {
  //compatibility for firefox and chrome
  var myPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;
  var pc = new myPeerConnection({
      iceServers: []
    }),
    noop = function() {},
    localIPs = {},
    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
    key;

  function iterateIP(ip) {
    if (!localIPs[ip]) onNewIP(ip);
    localIPs[ip] = true;
  }

  //create a bogus data channel
  pc.createDataChannel('');

  // create offer and set local description
  pc.createOffer()
    .then(function(sdp) {
      sdp.sdp.split('\n').forEach(function(line) {
        if (line.indexOf('candidate') < 0) return;
        line.match(ipRegex).forEach(iterateIP);
      });

      pc.setLocalDescription(sdp, noop, noop);
    })
    .catch(function(reason) {
      // An error occurred, so handle the failure to connect
    });

  //listen for candidate events
  pc.onicecandidate = function(ice) {
    if (
      !ice ||
      !ice.candidate ||
      !ice.candidate.candidate ||
      !ice.candidate.candidate.match(ipRegex)
    )
      return;
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
  };
};

// function callbackToPromise(method, ...args) {
//   return new Promise(function(resolve, reject) {
//       return method(...args, function(err, result) {
//           return err ? reject(err) : resolve(result);
//       });
//   });
// }
