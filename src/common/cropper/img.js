import React, { Component } from 'react';

class Img extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      counter: 0,
      src: '',
      default: ''
    };
    this.renderImage = this.renderImage.bind(this);
  }

  componentDidMount() {
    // load image and check if it's broken
    // this.renderImage();
    this.setState({
      src: this.props.src,
      default: this.props.default
    });

    let intervalRef = setInterval(() => {
      if (this.myImgContainer) {
        this.renderImage();
        clearInterval(intervalRef);
      }
    }, 200);
    // setTimeout(() => this.renderImage(), 200);
  }

  componentWillReceiveProps(nextProps) {
    let count = 0;
    if (nextProps.src && this.state.src !== nextProps.src) {
      this.setState({
        src: nextProps.src,
        loading: true,
        error: false
      });
      count++;
    }
    if (nextProps.default && this.state.default !== nextProps.default) {
      this.setState({
        default: nextProps.default,
        loading: true,
        error: false
      });
      count++;
    }

    if (count) {
      // setTimeout(() => this.renderImage(), 1000);
      let intervalRef = setInterval(() => {
        if (this.myImgContainer) {
          this.renderImage();
          clearInterval(intervalRef);
        }
      }, 1000);
    }
  }

  renderImage() {
    let img = this.myImgContainer;
    let _this = this;
    img.onload = () => {
      this.setState({
        loading: false,
        error: false
      });
    };
    img.onerror = () => {
      this.setState({
        loading: false,
        error: true
      });
      img.src = this.state.default;
      setTimeout(() => {
        if (_this.state.counter < 5) {
          img.src = _this.props.src;
          _this.setState({
            counter: _this.state.counter + 1,
            loading: true,
            error: false
          });
        }
      }, 10000);
    };
    img.src = this.state.src;
  }

  render() {
    return (
      <div
        style={{
          width: 100 + '%',
          height: 100 + '%',
          textAlign: 'center',
          verticalAlign: 'middle'
        }}
      >
        <img
          className={this.state.loading ? 'hide' : ''}
          ref={img => {
            this.myImgContainer = img;
          }}
          alt=""
        />
        <div
          className={`animated-background ${this.state.loading ? '' : 'hide'}`}
        />
      </div>
    );
  }
}

export default Img;
