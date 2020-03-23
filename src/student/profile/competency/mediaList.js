import React, { Component } from 'react';
import CONSTANTS from '../../../common/core/config/appConfig';

class MediaList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageArray: [],
      uploadType: ''
    };
  }

  componentDidMount() {
    if (this.props.imageArray) {
      this.setState({
        imageArray: this.props.imageArray,
        uploadType: this.props.uploadType
      });
    }
  }

  removeImage = (index, tag) => {
    // 1 for badges
    // if (this.state.uploadType === 1 && tag === CONSTANTS.badgeAlbum) {
    //   this.props.deleteBadge(index);
    // }

    // // 2 for certificates
    // if (this.state.uploadType === 2 && tag === CONSTANTS.certificateAlbum) {
    //   this.props.deleteCertificate(index, imageIndex);
    // }

    // 3 for media

    this.props.deleteMedia(index);
  };

  render() {
    return (
      <div className="add-more-boxes--wrapper">
        <div className="amb--item amb--item--images photo-gallery">
          {this.state.imageArray.length > 0
            ? this.state.imageArray.map((image, index) => (
                <div className="amb-item--item" key={index}>
                  <a className="remove--item">
                    <span
                      className="icon-delete icon"
                      onClick={this.removeImage.bind(this, index)}
                    />
                  </a>
                  {image.type === 'image' ? (
                    <img className="img-responsive" src={image.file} alt="" />
                  ) : (
                    <div>
                      <span class="icon-video_tag icon lg-icon" />
                    </div>
                  )}
                  <div className="caption_img">
                    {image.tag === CONSTANTS.mediaAlbum ? 'General' : image.tag}
                    {image.tag === CONSTANTS.certificateAlbum &&
                    image.type === 'image' ? (
                      <span className="icon-certificate" />
                    ) : image.tag === CONSTANTS.badgeAlbum &&
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
              ))
            : ''}
        </div>
      </div>
    );
  }
}

export default MediaList;
