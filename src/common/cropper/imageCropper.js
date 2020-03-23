import React, { Component } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button, Modal } from 'react-bootstrap';
import Select from 'react-select';
import CONSTANTS from '../../common/core/config/appConfig';
import _ from 'lodash';
const options = [
  {
    value: CONSTANTS.mediaAlbum,
    label: (
      <div className="adselectIcon">
        General <span className="icon-image_tag" />
      </div>
    )
  },
  {
    value: CONSTANTS.certificateAlbum,
    label: (
      <div className="adselectIcon">
        Certificate <span className="icon-certificate" />
      </div>
    )
  },
  {
    value: CONSTANTS.badgeAlbum,
    label: (
      <div className="adselectIcon">
        Badge <span className="icon-badges" />
      </div>
    )
  },
  {
    value: CONSTANTS.trophieAlbum,
    label: (
      <div className="adselectIcon">
        Trophy <span className="icon-trophy" />
      </div>
    )
  }

  // {
  //   value: 'Videos',
  //   label: (
  //     <div className="adselectIcon">
  //       Videos <span className="icon-video_tag" />
  //     </div>
  //   )
  // }
];
class ImageCropper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cropModal: true,
      cropBoxWidth: '',
      cropBoxHeight: '',
      imageSource: '',
      imageName: '',
      imageType: '',
      modalSize: 'medium',
      aspectRatio: '',
      selectedOption: {
        value: 'media',
        label: (
          <div className="adselectIcon">
            General <span className="icon-image_tag" />
          </div>
        )
      },
      tagValue: ''
    };
  }

  closeCropModal = () => {
    this.setState({ cropModal: false, imageSource: '' });
  };

  componentDidMount() {
    let imageSource = this.props.imageSource;
    let cropBoxWidth = this.props.cropBoxWidth;
    let cropBoxHeight = this.props.cropBoxHeight;
    let imageType = this.props.imageType;
    let imageName = this.props.imageName;
    let modalSize = this.props.modalSize;
    let aspectRatio = this.props.aspectRatio;

    if (imageSource !== '') {
      this.setState({
        imageSource,
        imageName,
        imageType,
        cropBoxWidth,
        cropBoxHeight,
        modalSize,
        aspectRatio
      });
    }
    if (this.props.labelName) {
      this.handleChange(this.state.selectedOption);
    }
  }

  handleImageChange = event => {
    const file = event.target.files[0];
    const fileName = file.name;
    const fileType = file.type;
    if (file) {
      let reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = event => {
        this.setState({
          imageSource: event.target.result,
          imageName: fileName,
          imageType: fileType
        });
      };
    }
  };

  cropImage(action) {
    let cropImageResult = this.refs.cropper && this.refs.cropper
      .getCroppedCanvas({
        fillColor: '#fff',
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'high'
      })
      .toDataURL(this.state.imageType);

    if (cropImageResult !== '') {
      let croppedImage = this.dataURLtoFile(
        cropImageResult,
        this.state.imageName
      );
      if (this.props.labelName === 'ADD_MEDIA') {
        this.props.uploadImageToAzure(croppedImage, this.state.tagValue);
      } else {
        this.props.uploadImageToAzure(croppedImage);
      }

      this.setState({
        cropModal: false
      });
    } else {
      this.props.uploadImageToAzure('');
    }
  }

  dataURLtoFile(dataurl, filename) {
    var arr = dataurl ? dataurl.split(',') : dataurl,
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var blob = new Blob([u8arr], { type: this.state.imageType });
    blob.name = filename;
    return blob;
    // return new File([u8arr], filename, { type: mime });
  }

  handleChange = selectedOption => {
    if (selectedOption) {
      let aspectRatio = 16 / 9;
      let tagValue = selectedOption.value;
      if (tagValue === CONSTANTS.mediaAlbum) {
        aspectRatio = 16 / 9;
      } else {
        aspectRatio = 1 / 1;
      }
      this.setState({ selectedOption, tagValue, aspectRatio });
    }
  };

  render() {
    const { selectedOption } = this.state;
    return (
      <Modal
        bsSize={this.state.modalSize}
        show={this.state.cropModal}
        onHide={this.closeCropModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title
            className={
              this.props.labelName === 'ADD_MEDIA'
                ? 'addMediaTxt'
                : 'subtitle text-center'
            }
          >
            {this.props.labelName === 'ADD_MEDIA' ? 'ADD MEDIA' : 'Crop Photo'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Cropper
            className="img-responsive"
            ref="cropper"
            minCropBoxWidth={this.state.cropBoxWidth}
            minCropBoxHeight={this.state.cropBoxHeight}
            src={this.state.imageSource}
            style={{ height: 400, width: '100%' }}
            aspectRatio={this.state.aspectRatio}
            guides={true}
            viewMode={1}
            background={false}
            zoomable={true}
            cropBoxMovable={false}
            cropBoxResizable={false}
            highlight={false}
            dragMode="move"
            movable={true}
          />
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-content-between align-center">
            <div className="left">
              {this.props.labelName === 'ADD_MEDIA' ? (
                <div className="custom-select selectAddAch">
                  <span className="icon-down_arrow selectIcon" />
                  {/* selectAddAch */}
                  {/* adfigCaption  */}
                  <Select
                    className="form-control adfigCaption"
                    placeholder="Select Media Type"
                    value={selectedOption}
                    onChange={this.handleChange}
                    options={options}
                    clearable={false}
                  />
                </div>
              ) : null}
            </div>
            <div className="right flex align-center">
              <div className="custom-upload mr-1">
                <input
                  type="file"
                  accept="image/*"
                  value=""
                  onChange={this.handleImageChange.bind(this)}
                />

                <Button bstyle="default">Change Photo</Button>
              </div>
              {this.props.labelName ? (
                <Button
                  bsStyle="primary"
                  onClick=
                  {_.debounce((event) => this.cropImage(), 1000)} 
                   disabled={selectedOption ? false : true}
                >
                  Apply
                </Button>
              ) : (
                <Button bsStyle="primary" onClick= {_.debounce((event) => this.cropImage(), 1000)} >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default ImageCropper;
