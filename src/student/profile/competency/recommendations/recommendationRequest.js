import React, { Component } from 'react';
import Header from '../../../../common/header/recommendedHeader';
import Select from 'react-select';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import validation from 'react-validation-mixin';
import strategy from 'react-validatorjs-strategy';
import {
  renderMessage,
  isValidURL,
  SampleNextArrow,
  SamplePrevArrow,
  generateTimestamp,
  getThumbImage
} from '../../../../common/commonFunctions';
import spikeViewApiService from '../../../../common/core/api/apiService';
import CONSTANTS from '../../../../common/core/config/appConfig';
import classnames from 'classnames';
import { actionGetAllCompetency } from '../../../../common/core/redux/actions';
import {
  Row,
  Col,
  Button,
  FormGroup,
  FormControl,
  Modal
} from 'react-bootstrap';
import Slider from 'react-slick/lib/index';
import ImageCropper from '../../../../common/cropper/imageCropper';
import blobStorageJS from '../../../../assets/js/azure-storage.blob';
//import Script from 'react-load-script';

//import '../../../../assets/js/azure-storage.common';

let photoGallery = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  swipeToSlide: true,
  nextArrow: <SampleNextArrow props={this.props} />,
  prevArrow: <SamplePrevArrow props={this.props} />
};
let validationMessages = CONSTANTS.validationMessages;
function PathLoader(el) {
  this.el = el;
  this.strokeLength = el.getTotalLength();

  // set dash offset to 0
  this.el.style.strokeDasharray = this.el.style.strokeDashoffset = this.strokeLength;
}

PathLoader.prototype._draw = function(val) {
  this.el.style.strokeDashoffset = this.strokeLength * (1 - val);
};

PathLoader.prototype.setProgress = function(val, cb) {
  this._draw(val);
  if (cb && typeof cb === 'function') cb();
};

PathLoader.prototype.setProgressFn = function(fn) {
  if (typeof fn === 'function') fn(this);
};

var body = document.body,
  svg = document.querySelector('svg path');
if (svg !== null) {
  svg = new PathLoader(svg);
  setTimeout(function() {
    document.body.classList.add('active');
    svg.setProgress(1);
  }, 200);
}

let badgeImgArray = [];
let badgeImgPreview = [];
let certificateImgArray = [];
let certificateImgPreview = [];
let mediaImgArray = [];
let mediaImgPreview = [];

class RecommendationRequest extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      recommendationsPopup: false,
      recommendation: '',
      skills: [],
      competencyData: [],
      titleIcon: false,
      competencyIcon: false,
      skillsIcon: false,
      messageRecieved: false,
      badgePreview: '',
      badgeImgArray: [],
      badgesData: [],
      certificatesData: [],
      mediaData: [],
      badgeImgPreview: [],
      certificateImgArray: [],
      certificateImgPreview: [],
      mediaImgArray: [],
      mediaImgPreview: [],
      sasToken: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSkillChange = this.handleSkillChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getValidatorData = this.getValidatorData.bind(this);
    this.getClasses = this.getClasses.bind(this);
    this.validatorTypes = strategy.createSchema(
      {
        recommendation: 'required',
        skills: 'required',
        title: 'required',
        level3Competency: 'required'
      },
      {
        'required.recommendation': validationMessages.recommendation.required,
        'required.title': validationMessages.title.required,
        'required.level3Competency': validationMessages.competency.required,
        'required.skills': validationMessages.skills.required
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

  validateData = () => {
    let self = this;
    this.props.validate(function(error) {
      let imageObject = {
        //badge: self.state.badgeImgArray || [],
        //certificate: self.state.certificateImgArray || [],
        media: self.state.mediaImgArray || []
      };
      if (!error) {
        self.setState({ isLoading: true });
        if (self.state.mediaImgArray.length > 0) {
          self.uploadAchievementData(imageObject);
          setTimeout(function() {
            self.handleSubmit();
          }, 5000);
        } else {
          self.handleSubmit();
        }
      }
      // if (!error) {
      //   self.setState({ isLoading: true });
      //   self.handleSubmit();
      // }
    });
  };

  componentWillMount() {
    if (this.props.user) {
      let user = this.props.user;
      this.setState({
        username: user.firstName
          ? user.firstName
          : '' + '' + user.lastName
            ? user.lastName
            : '',
        email: user.email,
        userId: user.userId
      });
    }

    console.log(this.props.user);
    if (
      this.props.location.state &&
      this.props.location.state.userId &&
      this.props.user &&
      parseInt(this.props.location.state.requestRecommendedId, 10) &&
      (parseInt(this.props.location.state.userId, 10) ===
        parseInt(this.props.user.userId, 10) ||
        parseInt(this.props.location.state.userId, 10) ===
          parseInt(this.props.parent.userId, 10))
    ) {
      console.log(this.props.location.state.requestRecommendedId);
      this.setRecommendtion(this.props.location.state.requestRecommendedId);
    } else {
      this.props.history.push('/profile');
      // this.setState({
      //   messageRecieved: true,
      //   messageSent: 'This link recommendation is not assigned to You.'
      // });
    }
    this.getAllSkills();
    document.body.classList.add('white-theme');
  }

  componentDidMount() {
    this.generateSASToken();
  }

  generateSASToken() {
    spikeViewApiService('getSASToken')
      .then(response => {
        if (response.data.status === 'Success') {
          let sasToken = response.data.result.sasToken;
          this.setState({ sasToken });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  getAllSkills() {
    spikeViewApiService('getSkills')
      .then(response => {
        if (response.data.status === 'Success') {
          let skillsList = response.data.result || [];
          let skillOptions = skillsList.map(function(skillObj) {
            return {
              value: skillObj.skillId,
              label: skillObj.title
            };
          });
          this.setState({ skillList: skillOptions });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSkillChange = newValue => {
    this.setState({
      skills: newValue
    });
  };

  actionGetAllCompetency(competencyTypeId) {
    spikeViewApiService('getCompetencyById', { competencyTypeId })
      .then(response => {
        if (response && response.data.status === 'Success') {
          console.log(response.data.result);
          let level2CompetnecyData = response.data.result[0];
          this.setState({ competencyData: level2CompetnecyData.level3 });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  setRecommendtion(recommendationId) {
    //let self = this;
    spikeViewApiService('getRecommendationById', {
      recommendationId
    })
      .then(response => {
        console.log(response);
        if (response && response.data.status === 'Success') {
          let result = response.data.result[0];
          if (result.stage === 'Requested') {
            console.log(result);

            // if (result.badge && result.badge.length > 0) {
            //   badgeImgPreview = result.badge.map(function(badge) {
            //     let badgeName = `${CONSTANTS.azureBlobURI}/${
            //       CONSTANTS.azureContainer
            //     }/${badge}`;
            //     return badgeName;
            //   });

            //   // badgeImgArray = result.badge.map(function(badge) {
            //   //   let badgeName = `${CONSTANTS.azureBlobURI}/${
            //   //     CONSTANTS.azureContainer
            //   //   }/${badge}`;
            //   //   return badgeName;
            //   // });
            // }

            // if (result.certificate && result.certificate.length > 0) {
            //   certificateImgPreview = result.certificate.map(function(
            //     certificate
            //   ) {
            //     let certificateName = `${CONSTANTS.azureBlobURI}/${
            //       CONSTANTS.azureContainer
            //     }/${certificate}`;
            //     return certificateName;
            //   });

            //   // certificateImgArray = result.certificate.map(function(
            //   //   certificate
            //   // ) {
            //   //   let certificateName = `${CONSTANTS.azureBlobURI}/${
            //   //     CONSTANTS.azureContainer
            //   //   }/${certificate}`;
            //   //   return certificateName;
            //   // });
            // }

            // if (result.asset && result.asset.length > 0) {
            //   mediaImgPreview = result.asset.map(function(asset) {
            //     let mediaName = `${CONSTANTS.azureBlobURI}/${
            //       CONSTANTS.azureContainer
            //     }/${asset}`;
            //     return mediaName;
            //   });

            //   // mediaImgArray = result.asset.map(function(asset) {
            //   //   let mediaName = `${CONSTANTS.azureBlobURI}/${
            //   //     CONSTANTS.azureContainer
            //   //   }/${asset}`;
            //   //   return mediaName;
            //   // });
            // }

            if (result.asset && result.asset.length > 0) {
              result.asset.map(function(asset) {
                let mediaName = `${CONSTANTS.azureBlobURI}/${
                  CONSTANTS.azureContainer
                }/${asset.file}`;

                mediaImgArray.push({
                  file: mediaName,
                  tag: asset.tag,
                  type: asset.type
                });
              });

              result.asset.map(function(asset) {
                let mediaName = `${CONSTANTS.azureBlobURI}/${
                  CONSTANTS.azureContainer
                }/${asset.file}`;

                mediaImgPreview.push({
                  file: mediaName,
                  tag: asset.tag,
                  type: asset.type
                });
              });
            }

            this.setState({
              recommenderId: result.recommenderId,
              recommendationId: result.recommendationId,
              request: result.request,
              title: result.title,
              skills: result.skills,
              recommendation: result.recommendation,
              endDate: result.interactionEndDate
                ? result.interactionEndDate
                : null,
              startDate: result.interactionStartDate,
              badgeImgPreview,
              // badgeImgArray,
              certificateImgPreview,
              //  certificateImgArray,
              mediaImgPreview,
              mediaImgArray,
              //certificate: result.certificate,
              //badge: result.badge,
              requestedBy: result.userId,
              competencyTypeId: result.competencyTypeId,
              level3Competency: result.level3Competency
            });

            let userId = result.userId;
            spikeViewApiService('getStudentPersonalInfo', {
              userId: userId
            })
              .then(response => {
                if (response && response.data.status === 'Success') {
                  let result = response.data.result;
                  this.setState({
                    recommendUserName: result.firstName,
                    recommendUserEmail: result.email,
                    recommendProfilePicture: result.profilePicture
                  });
                }
              })
              .catch(err => {
                console.log(err);
              });
            this.actionGetAllCompetency(result.competencyTypeId);
          } else {
            this.setState({
              messageSent: 'Recommendation Already Submitted Successfully',
              messageRecieved: true
            });
          }
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleSubmit() {
    let recommendationId = this.state.recommendationId;
    let recommendation = this.state.recommendation;
    let competencyTypeId = this.state.competencyTypeId;
    let level3Competency = this.state.level3Competency;
    let title = this.state.title;
    let stage = 'Replied';
    let skills = [];
    if (this.state.skills.length > 0) {
      skills = this.state.skills.map(function(skill) {
        return { skillId: skill.value, label: skill.label };
      });
    }

    let badge = this.state.badgesData.length > 0 ? this.state.badgesData : [];
    let certificate =
      this.state.certificatesData.length > 0 ? this.state.certificatesData : [];
    let asset = this.state.mediaData.length > 0 ? this.state.mediaData : [];
    let recommenderId = this.state.recommenderId;

    let data = {
      recommendationId,
      recommendation,
      competencyTypeId,
      level3Competency,
      title,
      skills,
      stage,
      badge,
      certificate,
      asset,
      recommenderId
    };

    console.log(data);
    spikeViewApiService('updateRecommendation', data)
      .then(response => {
        if (response && response.data.status === 'Success') {
          this.setState({
            isLoading: false,
            messageRecieved: true,
            messageSent: 'Recommendation Submitted Successfully'
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleChange = event => {
    const { name } = event.target;
    const { value } = event.target;
    this.setState({ [name]: value });
  };

  // handleBadgeChange = event => {
  //   let badgeImgArray = this.state.badgeImgArray;
  //   let badgeImgPreview = this.state.badgeImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       badgeImgArray.push(file);
  //       badgeImgPreview.push(event.target.result);
  //       this.setState({
  //         badgeImgPreview,
  //         badgeImgArray
  //       });
  //     };
  //     if (badgeImgPreview.length === 3) {
  //       document.getElementById('badge_2').classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  // handleCertificateChange = event => {
  //   let certificateImgArray = this.state.certificateImgArray;
  //   let certificateImgPreview = this.state.certificateImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       certificateImgArray.push(file);
  //       certificateImgPreview.push(event.target.result);
  //       this.setState({
  //         certificateImgArray,
  //         certificateImgPreview
  //       });
  //     };

  //     if (certificateImgPreview.length === 3) {
  //       document
  //         .getElementById('certificate_2')
  //         .classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  // handleMediaChange = event => {
  //   let mediaImgArray = this.state.mediaImgArray;
  //   let mediaImgPreview = this.state.mediaImgPreview;
  //   let file = event.target.files[0];
  //   if (file) {
  //     let reader = new FileReader();
  //     reader.readAsDataURL(event.target.files[0]);
  //     reader.onload = event => {
  //       mediaImgArray.push(file);
  //       mediaImgPreview.push(event.target.result);
  //       this.setState({
  //         mediaImgArray,
  //         mediaImgPreview
  //       });
  //     };

  //     if (mediaImgPreview.length === 3) {
  //       document.getElementById('media_2').classList.add('img-count--wrapper');
  //     }
  //   }
  // };

  deleteBadge = index => {
    let badgeImgArray = this.state.badgeImgArray;
    let badgeImgPreview = this.state.badgeImgPreview;
    badgeImgPreview.splice(index, 1);
    badgeImgArray.splice(index, 1);
    this.setState({
      badgeImgArray,
      badgeImgPreview
    });
    if (badgeImgPreview.length === 0) {
      this.closeImageModal();
    }
  };

  deleteCertificate = index => {
    let certificateImgArray = this.state.certificateImgArray;
    let certificateImgPreview = this.state.certificateImgPreview;
    certificateImgPreview.splice(index, 1);
    certificateImgArray.splice(index, 1);
    this.setState({
      certificateImgArray,
      certificateImgPreview
    });
    if (certificateImgPreview.length === 0) {
      this.closeImageModal();
    }
  };

  deleteMedia = index => {
    let mediaImgArray = this.state.mediaImgArray;
    let mediaImgPreview = this.state.mediaImgPreview;
    mediaImgPreview.splice(index, 1);
    mediaImgArray.splice(index, 1);
    this.setState({
      mediaImgArray,
      mediaImgPreview
    });
    if (mediaImgPreview.length === 0) {
      this.closeImageModal();
    }
  };

  uploadAchievementData(mediaObject) {
    let blobService;
    let AzureStorage;
    let sasToken = this.state.sasToken;
    let userId = this.state.userId;
    if (!window.AzureStorage) {
      console.log('setting object to window object');
      window.AzureStorage = blobStorageJS;
      AzureStorage = window.AzureStorage;
      blobService = AzureStorage.createBlobServiceWithSas(
        CONSTANTS.azureBlobURI,
        sasToken
      );
    } else {
      AzureStorage = window.AzureStorage;
      blobService = AzureStorage.Blob.createBlobServiceWithSas(
        CONSTANTS.azureBlobURI,
        sasToken
      );
    }
    // if (window.AzureStorage) {
    // AzureStorage = blobStorageJS;
    // console.log('in blob undefined condition', blobStorageJS);
    // var my_awesome_script = document.createElement('script');
    // my_awesome_script.setAttribute('src', blobStorageJS);
    // document.head.appendChild(my_awesome_script);
    // }

    // let badgesData = [];
    //  let certificatesData = [];
    let mediaData = [];
    let self = this;

    // const blobService = AzureStorage.Blob.createBlobServiceWithSas(
    //   CONSTANTS.azureBlobURI,
    //   sasToken
    // );

    function uploadFiles(uploadArray, albumName) {
      console.log(uploadArray);
      for (var index = 0; index < uploadArray.length; index++) {
        if (isValidURL(uploadArray[index].file) === true) {
          console.log('ss');
          let path = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/`;
          // if (albumName === CONSTANTS.badgeAlbum) {
          //   let imageName = uploadArray[index].replace(path, '');
          //   badgesData.push(imageName);
          // }

          // if (albumName === CONSTANTS.certificateAlbum) {
          //   let imageName = uploadArray[index].replace(path, '');
          //   certificatesData.push(imageName);
          // }

          if (albumName === CONSTANTS.mediaAlbum) {
            let imageName = uploadArray[index].file.replace(path, '');

            mediaData.push({
              file: imageName,
              tag: uploadArray[index].tag,
              type: uploadArray[index].type
            });
          }
        } else {
          console.log('fffffff');
          let fileName = generateTimestamp(uploadArray[index].file.name);
          let uploadPath = `sv_${userId}/${albumName}/${fileName}`;
          // if (albumName === CONSTANTS.badgeAlbum) {
          //   badgesData.push(uploadPath);
          // }

          // if (albumName === CONSTANTS.certificateAlbum) {
          //   certificatesData.push(uploadPath);
          // }

          if (albumName === CONSTANTS.mediaAlbum) {
            mediaData.push({
              file: uploadPath,
              tag: uploadArray[index].tag,
              type: uploadArray[index].type
            });
          }

          blobService.createBlockBlobFromBrowserFile(
            CONSTANTS.azureContainer,
            uploadPath,
            uploadArray[index].file,
            (error, result) => {
              if (result) {
                console.log(result);
              }
              if (error) {
                console.log('error ', error);
              }
            }
          );
        }
      }

      // if (albumName === CONSTANTS.badgeAlbum) {
      //   self.setState({ badgesData: badgesData });
      // }

      // if (albumName === CONSTANTS.certificateAlbum) {
      //   self.setState({ certificatesData });
      // }

      if (albumName === CONSTANTS.mediaAlbum) {
        self.setState({ mediaData });
      }
    }
    //uploadFiles(mediaObject.badge, CONSTANTS.badgeAlbum);
    //uploadFiles(mediaObject.certificate, CONSTANTS.certificateAlbum);
    uploadFiles(mediaObject.media, CONSTANTS.mediaAlbum);
  }

  // uploadAchievementData(mediaObject) {
  //   let AzureStorage = window.AzureStorage;
  //   let sasToken = this.state.sasToken;
  //   let userId = this.state.requestedBy;
  //   let badgesData = [];
  //   let certificatesData = [];
  //   let mediaData = [];
  //   let self = this;
  //   const blobService =
  //     AzureStorage &&
  //     AzureStorage.Blob.createBlobServiceWithSas(
  //       CONSTANTS.azureBlobURI,
  //       sasToken
  //     );

  //   function uploadFiles(uploadArray, albumName) {
  //     console.log(uploadArray);
  //     for (var index = 0; index < uploadArray.length; index++) {
  //       if (isValidURL(uploadArray[index]) === true) {
  //         let path = `${CONSTANTS.azureBlobURI}/${CONSTANTS.azureContainer}/`;
  //         if (albumName === CONSTANTS.badgeAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           badgesData.push(imageName);
  //         }

  //         if (albumName === CONSTANTS.certificateAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           certificatesData.push(imageName);
  //         }

  //         if (albumName === CONSTANTS.mediaAlbum) {
  //           let imageName = uploadArray[index].replace(path, '');
  //           mediaData.push(imageName);
  //         }
  //       } else {
  //         let fileName = generateTimestamp(uploadArray[index].name);
  //         let uploadPath = `sv_${userId}/${albumName}/${fileName}`;
  //         if (albumName === CONSTANTS.badgeAlbum) {
  //           badgesData.push(uploadPath);
  //         }

  //         if (albumName === CONSTANTS.certificateAlbum) {
  //           certificatesData.push(uploadPath);
  //         }

  //         if (albumName === CONSTANTS.mediaAlbum) {
  //           mediaData.push(uploadPath);
  //         }

  //         blobService &&
  //           blobService.createBlockBlobFromBrowserFile(
  //             CONSTANTS.azureContainer,
  //             uploadPath,
  //             uploadArray[index],
  //             (error, result) => {
  //               if (result) {
  //                 console.log(result);
  //               }
  //               if (error) {
  //                 console.log('error ', error);
  //               }
  //             }
  //           );
  //       }
  //     }

  //     if (albumName === CONSTANTS.badgeAlbum) {
  //       console.log(badgesData);
  //       self.setState({ badgesData: badgesData });
  //     }

  //     if (albumName === CONSTANTS.certificateAlbum) {
  //       console.log(certificatesData);
  //       self.setState({ certificatesData });
  //     }

  //     if (albumName === CONSTANTS.mediaAlbum) {
  //       console.log(mediaData);
  //       self.setState({ mediaData });
  //     }
  //   }
  //   uploadFiles(mediaObject.badge, CONSTANTS.badgeAlbum);
  //   uploadFiles(mediaObject.certificate, CONSTANTS.certificateAlbum);
  //   uploadFiles(mediaObject.media, CONSTANTS.mediaAlbum);
  // }

  imagesPopup = type => {
    this.setState({ imagesPopup: !this.state.imagesPopup });
    if (type === 3) {
      this.setState({
        sliderImages: this.state.mediaImgPreview
      });
    }
    // else if (type === 2) {
    //   this.setState({
    //     sliderImages: this.state.certificateImgPreview
    //   });
    // } else if (type === 1) {
    //   console.log(this.state.badgeImgPreview);
    //   this.setState({
    //     sliderImages: this.state.badgeImgPreview
    //   });
    // }
  };

  handleImageChange = (action, event) => {
    this.setState({ imageSource: '' });
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
    if (file) {
      var Type = fileType.split('/');
      if (Type[0] === 'image') {
        let reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = event => {
          this.setState({
            imageSource: event.target.result,
            imageName: fileName,
            imageType: fileType,
            action: action
          });
        };
      }

      if (Type[0] === 'video') {
        this.handleMediaChange(file, CONSTANTS.mediaAlbum);
      }
    }
  };

  handleMediaChange = (event, imageTag) => {
    let mediaImgArray = this.state.mediaImgArray;
    let mediaImgPreview = this.state.mediaImgPreview;
    let file = event;

    if (file) {
      var fileType = file.type.split('/');
      let reader = new FileReader();
      reader.readAsDataURL(event);
      reader.onload = event => {
        if (fileType[0] === 'image') {
          mediaImgArray.push({ file: file, tag: imageTag, type: 'image' });
          mediaImgPreview.push({
            file: event.target.result,
            type: 'image',
            tag: imageTag
          });
        } else if (fileType[0] === 'video') {
          mediaImgArray.push({ file: file, tag: imageTag, type: 'video' });
          mediaImgPreview.push({
            file: '',
            type: 'video',
            tag: imageTag
          });
        }

        this.setState({
          mediaImgArray,
          mediaImgPreview
        });
      };

      if (mediaImgPreview.length === 6) {
        document.getElementById('media_5').classList.add('img-count--wrapper');
      }
    }
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div className="innerWrapper">
        {this.state.imageSource ? (
          <ImageCropper
            imageSource={this.state.imageSource}
            imageName={this.state.imageName}
            imageType={this.state.imageType}
            aspectRatio={this.state.action === 1 ? 1 / 1 : 16 / 9}
            modalSize={'medium'}
            cropBoxWidth={this.state.action === 1 ? '200' : '700'}
            cropBoxHeight={this.state.action === 1 ? '200' : '700'}
            uploadImageToAzure={this.handleMediaChange.bind(this)}
            labelName={'ADD_MEDIA'}
          />
        ) : null}
        <div className="container" />
        <Header {...this.props} />

        {!this.state.messageRecieved ? (
          <div className="profileBox">
            <div className="container main">
              <div className="mt-1 fullWidth">
                <ul className="myProfileInfo--wrapper">
                  <li>
                    <div className="">
                      <div className="flex align-center justify-content-between primary-text">
                        <div className="section-main-title with-icon primary-text mb-0">
                          Recommendation Request
                        </div>
                        {/* <a
                          className="flex align-center"
                          disabled={isLoading}
                          onClick={!isLoading ? this.validateData : null}
                        >
                          <span className="icon-send icon" />
                          {isLoading ? 'Sending...' : 'Send'}
                        </a> */}
                      </div>

                      <div className="well mt-1">
                        <div className="flex">
                          <div className="pic--wrapper with--seperator">
                            {this.state.recommendProfilePicture ? (
                              <img
                                className="img-responsive"
                                src={getThumbImage(
                                  'medium',
                                  this.state.recommendProfilePicture
                                )}
                                alt=""
                              />
                            ) : (
                              <span class="icon-user_default2 default-icon centeredBox ma" />
                            )}
                            <div className="pw--details">
                              <div className="pw--name">
                                {' '}
                                {this.state.recommendUserName}
                              </div>
                              <div className="pw--email">
                                {this.state.recommendUserEmail}
                              </div>
                            </div>
                          </div>

                          <div className="content--box flex-1">
                            <p style={{ whiteSpace: 'pre-wrap' }}>
                              {this.state.request}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="section-main mb-mb-">
                        <FormGroup>
                          <div className="flex align-center">
                            <div className="section-main-title secondaryTitle">
                              Title
                              <span />
                            </div>
                            {/* <span
                            className="icon-edit_pencil icon"
                            onClick={() =>
                              this.setState({
                                titleIcon: !this.state.titleIcon
                              })
                            }
                          /> */}
                          </div>
                          {/* onClick={() =>
                              this.setState({
                                titleIcon: !this.state.titleIcon
                              })
                            }{!this.state.titleIcon ? (
                          <p>{this.state.title}</p>
                        ) : (
                          <FormControl
                            componentClass="textarea"
                            placeholder="Enter Title"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleChange}
                            autoComplete="off"
                            maxLength="100"
                          />
                        )} */}

                          <FormControl
                            placeholder="Enter Title"
                            name="title"
                            value={this.state.title}
                            onChange={this.handleChange}
                            autoComplete="off"
                            maxLength="100"
                          />
                        </FormGroup>
                      </div>

                      <div className="section-main mb-3">
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Competency
                            <span />
                          </div>
                          {/* <span
                            className="icon-edit_pencil icon"
                            onClick={() =>
                              this.setState({
                                competencyIcon: !this.state.competencyIcon
                              })
                            }
                          /> */}
                        </div>
                        {/*!this.state.competencyIcon ? (
                          <p>{this.state.level3Competency}</p>
                        ) : ( */}
                        <FormControl
                          componentClass="select"
                          placeholder="Select Competency"
                          name="level3Competency"
                          value={this.state.level3Competency}
                          onChange={this.handleChange}
                        >
                          <option value="">Select Competency</option>
                          {this.state.competencyData.length > 0
                            ? this.state.competencyData.map((item, index) => (
                                <option
                                  value={item._id || item.key}
                                  key={index}
                                >
                                  {item.name}
                                </option>
                              ))
                            : ''}
                        </FormControl>
                        {/* )} */}
                      </div>

                      <div
                        className={`section-main mb-3 ${this.getClasses(
                          'skills'
                        )}`}
                      >
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Skills
                            <span />
                          </div>
                          {/* <span
                            className="icon-edit_pencil icon"
                            onClick={() =>
                              this.setState({
                                skillsIcon: !this.state.skillsIcon
                              })
                            }
                          /> */}
                        </div>
                        {/* {!this.state.skillsIcon ? (
                          <p>
                            {this.state.skills.map(function(item) {
                              return item.label;
                            })}
                          </p>
                        ) : ( */}
                        <Select
                          className="form-control"
                          multi
                          name="skills"
                          value={this.state.skills}
                          onChange={this.handleSkillChange}
                          options={this.state.skillList}
                          placeholder="Select Skills"
                        />
                        {/* )} */}
                        {renderMessage(
                          this.props.getValidationMessages('skills')
                        )}
                      </div>
                      {this.state.startDate ? (
                        <div className="section-main mb-3">
                          <div className="flex align-center">
                            <div className="section-main-title secondaryTitle">
                              Interaction Date
                              <span />
                            </div>
                          </div>
                          <p>
                            {moment(this.state.startDate).format('LL')} -&nbsp;
                            {this.state.endDate
                              ? moment(this.state.endDate).format('LL')
                              : 'Present'}
                            {/* {this.state.startDate
                            ? moment(this.state.startDate).format('DD-MMM-YYYY')
                            : null}
                          &nbsp; - &nbsp;{' '}
                          {this.state.endDate
                            ? moment(this.state.endDate).format('DD-MMM-YYYY')
                            : 'Present'} */}
                          </p>
                        </div>
                      ) : (
                        ''
                      )}

                      <Row className="mt-1">
                        {/* <Col sm={4}>
                          <div className="section-main-title with-icon">
                            Badges
                          </div>

                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {this.state.badgeImgPreview.length > 0
                                ? this.state.badgeImgPreview.map(
                                    (image, index) => (
                                      <div
                                        className={`amb-item--item ${
                                          index === 4 &&
                                          this.state.badgeImgPreview.length > 5
                                            ? 'img-count--wrapper'
                                            : ''
                                        }`}
                                        id={`badge_${index}`}
                                        key={index}
                                        style={
                                          index > 4
                                            ? { display: 'none' }
                                            : { display: 'block' }
                                        }
                                        onClick={this.imagesPopup.bind(this, 1)}
                                      >
                                        <img
                                          className="img-responsive"
                                          src={image}
                                          alt={index}
                                        />

                                        <a
                                          className="img-count--value"
                                          onClick={this.imagesPopup.bind(
                                            this,
                                            1
                                          )}
                                        >
                                          {index === 4 &&
                                          this.state.badgeImgPreview.length > 5
                                            ? `+ ${this.state.badgeImgPreview
                                                .length - 5}`
                                            : ''}
                                        </a>
                                      </div>
                                    )
                                  )
                                : ''}

                              <div className="amb--item">
                                <input
                                  type="file"
                                  value=""
                                  onChange={this.handleBadgeChange.bind(this)}
                                />
                                <a class="amb--item--link">
                                  {this.state.badgeImgPreview.length === 0
                                    ? 'Add'
                                    : 'Add More'}
                                </a>
                              </div>
                              {/*this.state.badge &&
                                this.state.badge.map(function(data) {
                                  return (
                                    <div className="amb-item--item">
                                      <img
                                        className="img-responsive"
                                        src={`${azureURL}/${data}`}
                                        alt=""
                                      />
                                    </div>
                                  );
                                })
                            </div>
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="section-main-title with-icon">
                            Certificates
                          </div>

                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {this.state.certificateImgPreview.length > 0
                                ? this.state.certificateImgPreview.map(
                                    (image, index) => (
                                      <div
                                        className={`amb-item--item ${
                                          index === 4 &&
                                          this.state.certificateImgPreview
                                            .length > 5
                                            ? 'img-count--wrapper'
                                            : ''
                                        }`}
                                        id={`certificate_${index}`}
                                        style={
                                          index > 4
                                            ? { display: 'none' }
                                            : { display: 'block' }
                                        }
                                        onClick={this.imagesPopup.bind(this, 2)}
                                        key={index}
                                      >
                                        <img
                                          className="img-responsive"
                                          src={image}
                                          alt={index}
                                        />

                                        <a
                                          className="img-count--value"
                                          onClick={this.imagesPopup.bind(
                                            this,
                                            2
                                          )}
                                        >
                                          {index === 4 &&
                                          this.state.certificateImgPreview
                                            .length > 5
                                            ? `+ ${this.state
                                                .certificateImgPreview.length -
                                                5}`
                                            : ''}
                                        </a>
                                      </div>
                                    )
                                  )
                                : ''}

                              <div className="amb--item">
                                <input
                                  type="file"
                                  value=""
                                  onChange={this.handleCertificateChange.bind(
                                    this
                                  )}
                                />
                                <a class="amb--item--link">
                                  {this.state.certificateImgPreview.length === 0
                                    ? 'Add'
                                    : 'Add More'}
                                </a>
                              </div>
                            </div>
                          </div>
                        </Col> */}

                        <Col sm={4}>
                          <div className="section-main-title with-icon light">
                            Media
                          </div>

                          <div className="add-more-boxes--wrapper">
                            <div className="amb--item amb--item--images photo-gallery">
                              {this.state.mediaImgPreview.length > 0
                                ? this.state.mediaImgPreview.map(
                                    (image, index) => (
                                      <div
                                        className={`amb-item--item ${
                                          index === 4 &&
                                          this.state.mediaImgPreview.length > 5
                                            ? 'img-count--wrapper'
                                            : ''
                                        }`}
                                        id={`media_${index}`}
                                        style={
                                          index > 4
                                            ? { display: 'none' }
                                            : { display: 'block' }
                                        }
                                        onClick={this.imagesPopup.bind(this, 3)}
                                      >
                                        {image.type === 'image' ? (
                                          <img
                                            className="img-responsive"
                                            src={image.file}
                                            alt={index}
                                          />
                                        ) : (
                                          <div>
                                            <span class="icon-video_tag icon lg-icon" />
                                          </div>
                                        )}

                                        <a
                                          className="img-count--value"
                                          onClick={this.imagesPopup.bind(
                                            this,
                                            3
                                          )}
                                        >
                                          {index === 4 &&
                                          this.state.mediaImgPreview.length > 5
                                            ? `+ ${this.state.mediaImgPreview
                                                .length - 5}`
                                            : ''}
                                        </a>
                                        <div className="caption_img">
                                          {image.tag === CONSTANTS.mediaAlbum
                                            ? 'General'
                                            : image.tag}
                                          {image.tag ===
                                            CONSTANTS.certificateAlbum &&
                                          image.type === 'image' ? (
                                            <span className="icon-certificate" />
                                          ) : image.tag ===
                                            CONSTANTS.badgeAlbum &&
                                          image.type === 'image' ? (
                                            <span className="icon-badges" />
                                          ) : (
                                            <span
                                              className={
                                                image.type === 'image'
                                                  ? 'icon-image_tag'
                                                  : 'icon-video_tag'
                                              }
                                            />
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )
                                : ''}

                              <div className="amb--item">
                                <input
                                  accept="image/*"
                                  type="file"
                                  value=""
                                  onChange={this.handleImageChange.bind(
                                    this,
                                    1
                                  )}
                                />
                                <a class="amb--item--link">
                                  {this.state.mediaImgPreview.length === 0
                                    ? 'Add'
                                    : 'Add More'}
                                </a>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <hr />

                      <div
                        className={`section-main ${this.getClasses(
                          'recommendation'
                        )}`}
                      >
                        <div className="flex align-center justify-content-between primary-text mb-1">
                          <div className="section-main-title secondaryTitle mb-0">
                            Recommendation
                          </div>
                          <div className="flex align-center button-group">
                            <Button
                              bsStyle="with-border with-icon smallBtn primary"
                              disabled={isLoading}
                              onClick={!isLoading ? this.validateData : null}
                            >
                              <span class="icon-send icon" /> Send
                            </Button>
                          </div>
                        </div>
                        <FormControl
                          componentClass="textarea"
                          name="recommendation"
                          placeholder="Enter Here"
                          value={this.state.recommendation}
                          onChange={this.handleChange}
                          maxLength="1000"
                        />
                        {renderMessage(
                          this.props.getValidationMessages('recommendation')
                        )}
                      </div>

                      {/* <div
                        className="section-main mb-3"
                        className={this.getClasses('recommendation')}
                      >
                        <div className="flex align-center">
                          <div className="section-main-title secondaryTitle">
                            Recommendations
                            <span />
                          </div>
                        </div>
                        <FormControl
                          componentClass="textarea"
                          name="recommendation"
                          value={this.state.recommendation}
                          onChange={this.handleChange}
                          placeholder="Enter Here"
                        />
                        {renderMessage(
                          this.props.getValidationMessages('recommendation')
                        )}
                      </div> */}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* <Modal
          className=""
          show={this.state.recommendationsPopup}
          onHide={this.recommendationsPopupClose}
        >
          <Modal.Header className="text-center" closeButton>
            <Modal.Title>Recommendations for science (56)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="recomm-wrapper">
              <div className="flex mb-20">
                <div className="a-r-img">
                  <img
                    src="assets/img/profile--pic.jpg"
                    className="object-fit-cover img-responsive"
                  />
                </div>

                <div class="show-hide-text wrapper">
                  <a id="show-more" class="show-less" href="#show-less">
                    Less
                  </a>
                  <a id="show-less" class="show-more" href="#show-more">
                    More
                  </a>
                  <h5 className="u-title">Rebbeca Jonas</h5>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularised in the 1960s with
                    the release of Letraset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              </div>

              <div className="flex mb-20">
                <div className="a-r-img">
                  <img
                    src="assets/img/profile--pic.jpg"
                    className="object-fit-cover img-responsive"
                  />
                </div>

                <div class="show-hide-text wrapper">
                  <a id="show-more1" class="show-less" href="#show-less1">
                    Less
                  </a>
                  <a id="show-less1" class="show-more" href="#show-more1">
                    More
                  </a>
                  <h5 className="u-title">Rebbeca Jonas</h5>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularised in the 1960s with
                    the release of Letraset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              </div>

              <div className="flex mb-20">
                <div className="a-r-img">
                  <img
                    src="assets/img/profile--pic.jpg"
                    className="object-fit-cover img-responsive"
                  />
                </div>

                <div class="show-hide-text wrapper">
                  <a id="show-more2" class="show-less" href="#show-less2">
                    Less
                  </a>
                  <a id="show-less2" class="show-more" href="#show-more2">
                    More
                  </a>
                  <h5 className="u-title">Rebbeca Jonas</h5>
                  <p>
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry. Lorem Ipsum has been the industry's
                    standard dummy text ever since the 1500s, when an unknown
                    printer took a galley of type and scrambled it to make a
                    type specimen book. It has survived not only five centuries,
                    but also the leap into electronic typesetting, remaining
                    essentially unchanged. It was popularised in the 1960s with
                    the release of Letraset sheets containing Lorem Ipsum
                    passages, and more recently with desktop publishing software
                    like Aldus PageMaker including versions of Lorem Ipsum.
                  </p>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal> */
          <div class="success-message">
            <svg
              viewBox="0 0 76 76"
              class="success-message__icon icon-checkmark"
            >
              <circle cx="38" cy="38" r="36" />
              <path
                fill="none"
                stroke="#FFFFFF"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-miterlimit="10"
                d="M17.7,40.9l10.9,10.9l28.7-28.7"
              />
            </svg>
            <h1 class="success-message__title">{this.state.messageSent}</h1>
            <div class="success-message__content" />
          </div>
        )}
        <Modal
          bsSize="large fullPageModal"
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
                      {img.type === 'image' ? (
                        <img
                          className="img-responsive"
                          src={getThumbImage('original', img.file)}
                          alt=""
                        />
                      ) : (
                        <video width="320" height="240" controls>
                          <source
                            src={getThumbImage('original', img.file)}
                            type="video/mp4"
                          />
                        </video>
                      )}
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

const mapStateToProps = state => {
  return {
    user: state.User.userData,
    parent: state.User.parentData
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      actionGetAllCompetency
    },
    dispatch
  );
};

RecommendationRequest = validation(strategy)(RecommendationRequest);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecommendationRequest);
