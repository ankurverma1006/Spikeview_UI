import CONSTANTS from '../../common/core/config/appConfig';
import { generateTimestamp } from '../../common/commonFunctions';

// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
// const ffmpeg = require('fluent-ffmpeg');

let AzureStorage = window.AzureStorage;

export const uploadAudio = (file, userId, sasToken, cb) => {
  const blobService = AzureStorage.Blob.createBlobServiceWithSas(
    CONSTANTS.azureBlobURI,
    sasToken
  );

  let audioName = generateTimestamp(file.name);
  let uploadPath = `sv_${userId}/${CONSTANTS.audioAlbum}/${audioName}`;

  return blobService.createBlockBlobFromBrowserFile(
    CONSTANTS.azureContainer,
    uploadPath,
    file,
    (error, result) => {
      if (result) {
        console.log('audio uploaded', result);
        cb(uploadPath);
      }
      if (error) {
        console.log('error ', error);
      }
    }
  );
};
