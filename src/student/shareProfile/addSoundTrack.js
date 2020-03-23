import React, { Component } from 'react';
import {
  Button,
  Checkbox,
  Modal,
  DropdownButton,
  MenuItem,
  Radio
} from 'react-bootstrap';
import Slider from 'react-slick';
import axios from 'axios';
import moment from 'moment';
import Countdown from 'react-countdown-moment';
import { confirmAlert } from 'react-confirm-alert';

import { getAPIURL, showErrorToast } from '../../common/commonFunctions';
import CONSTANTS from '../../common/core/config/appConfig';
import { uploadAudio } from '../../common/audio/audioUtil';
import Sprite from './sprite.svg';
import spikeViewApiService from '../../common/core/api/apiService';
const settings = {
  className: 'center',
  centerMode: false,
  infinite: true,
  centerPadding: '60px',
  slidesToShow: 3,
  speed: 500
};
var Recorder = window.Recorder;
var rec;
var audioContext;
var audioStream;
var analyser;
var bufferLength;
var dataArray;
var canvas;
var canvasCtx;
var Player;
var audioElement;
var audioSrc;

class AddSoundTrack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSoundTrackComponent: true,
      soundTrackModal: true,
      audioFile: '',
      loader: false,
      audioFileName: '',
      sasToken: '',
      canvas: false,
      pauseBtn: false,
      recordBtn: false
    };
  }

  componentDidMount() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia =
        navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();

      console.log('Audio context is ready !');
    } catch (e) {
      alert('No web audio support in this browser!');
    }
  }

  componentDidUpdate() {
    Player = document.getElementById('audioPlayer');
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

  closeSoundTrackModal = () => {
    this.setState({
      soundTrackModal: false,
      audioFile: ''
    });
    if (audioStream) {
      audioStream.getAudioTracks()[0].stop();
    }
    this.props.closeSoundTrackComponent();
  };

  handleselectedFile = event => {
    console.log(this.state.pauseBtn);
    if (this.state.pauseBtn === true) {
      confirmAlert({
        customUI: ({ onClose }) => {
          return (
            <div className="custom-ui">
              <p>
                Are you sure you want to cancel the recording and upload new
                track ?
              </p>
              <button
                onClick={() => {
                  if (audioStream) audioStream.getAudioTracks()[0].stop();
                  this.setState({
                    pauseBtn: false,
                    canvas: false
                  });
                  onClose();
                }}
              >
                Yes
              </button>

              <button
                onClick={() => {
                  onClose();
                }}
              >
                No
              </button>
            </div>
          );
        }
      });
    } else {
      this.setState(
        {
          selectedFile: event.target.files[0],
          loader: true,
          audioFile: '',
          canvas: false,
          pauseBtn: false,
          recordBtn: false
        },
        () => this.audioUploadToAzure()
      );
    }
  };

  audioUploadToAzure = () => {
    const data = new FormData();
    data.append('audioFiles', this.state.selectedFile);
    data.append('userId', this.props.userId);
    data.append('fileName', this.state.selectedFile.name);
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: this.props.token
      }
    };

    let baseURL =
      getAPIURL().httpServer + getAPIURL().APIURL + ':' + getAPIURL().APIPort;
    axios
      .post(baseURL + '/ui/azure/upload', data, config)
      .then(response => {
        if (response && response.data.status === 'Success') {
          let audioFileName = response.data.result;
          let audioFile = '';
          if (audioFileName) {
            audioFile = `${CONSTANTS.azureBlobURI}/${
              CONSTANTS.azureContainer
            }/${audioFileName}`;
          }
          this.setState(
            {
              loader: false,
              audioFile,
              audioFileName,
              canvas: true
            },
            () => this.drawBarGraph()
          );
        } else {
        }
      })
      .catch(error => {
        console.log('err', error);
      });
  };

  addSoundtrack = () => {
    if (this.state.audioFileName !== '') {
      this.props.closeSoundTrackComponent(this.state.audioFileName);
      this.setState({
        soundTrackModal: false
      });
    } else {
      showErrorToast('Please upload or record some audio');
    }
  };

  drawBarGraph = () => {
    Player.play();
    audioElement = document.getElementById('audioPlayer');
    audioSrc = audioContext.createMediaElementSource(audioElement);
    audioSrc.connect(analyser);
    audioSrc.connect(audioContext.destination);
    analyser.fftSize = 512;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    canvas = document.getElementById('oscilloscope');
    canvasCtx = canvas.getContext('2d');

    this.draw();
  };

  trackTimer = () => {
    var duration = moment.duration(60, 'seconds');
    var interval = 1000;
    var timerID = -1;
    let _this = this;

    var timer = setInterval(function() {
      if (duration.asSeconds() <= 0) {
        clearInterval(timerID);
        _this.stopRecording();
      } else {
        duration = moment.duration(
          duration.asMilliseconds() - interval,
          'milliseconds'
        );
      }
    }, interval);
    timerID = timer;
  };

  startRecording = () => {
    this.generateSASToken();
    let _this = this;
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    navigator.getUserMedia(
      { audio: true },
      function(stream) {
        _this.trackTimer();
        _this.setState({
          canvas: true,
          audioFile: '',
          recordBtn: false,
          pauseBtn: true
        });
        audioStream = stream;
        var input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input);
        rec && rec.record();
        input.connect(analyser);
        analyser.fftSize = 512;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        canvas = document.getElementById('oscilloscope');
        canvasCtx = canvas.getContext('2d');
        _this.draw();
      },
      function(e) {
        _this.setState({
          pauseBtn: false
        });
        showErrorToast('No live audio input, please allow microphone access');
        console.error('No live audio input: ' + e);
      }
    );
  };

  stopRecording = () => {
    let _this = this;
    this.setState({
      loader: true,
      pauseBtn: false,
      canvas: false
    });
    rec && rec.stop();

    audioStream.getAudioTracks()[0].stop();
    rec &&
      rec.exportWAV(function(blob) {
        blob.lastModifiedDate = new Date();
        blob.name = 'audioFile.mp3';
        uploadAudio(
          blob,
          _this.props.userId,
          _this.state.sasToken,
          uploadPath => {
            let audioFile = `${CONSTANTS.azureBlobURI}/${
              CONSTANTS.azureContainer
            }/${uploadPath}`;

            _this.setState(
              {
                audioFileName: uploadPath,
                audioFile,
                loader: false,
                canvas: true
              },
              () => _this.drawBarGraph()
            );
          }
        );

        rec.clear();
      }, 'audio/mp3');
  };

  draw = () => {
    requestAnimationFrame(this.draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    var barWidth = (canvas.width / bufferLength) * 2.5;
    var barHeight;
    var x = 0;
    for (var i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;
      canvasCtx.fillStyle = 'rgb(169, 185, 202)';
      canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  playAudioTrack = () => {
    let playPauseBtn = document.getElementById('playPauseBtn');
    if (Player.paused) {
      playPauseBtn.classList.add('playing');
      Player.play();
    } else {
      playPauseBtn.classList.remove('playing');
      Player.pause();
    }
  };

  render() {
    return (
      <Modal
        show={this.state.soundTrackModal}
        onHide={this.closeSoundTrackModal}
      >
        <Modal.Header closeButton>
          <Modal.Title className="subtitle text-center">
            Add Sound Track
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="as--wrapper">
            {/* <div className="flex align-center justify-center sele-type">
              <Radio className="radio-primary" name="type">
                Apply to all
                <span className="check" />
              </Radio>

              <Radio className="radio-primary" name="type">
                Individual
                <span className="check" />
              </Radio>
            </div> */}

            <div
              className={`addTracks ${
                this.state.loader === true ? 'disabled' : ''
              }`}
            >
              {/* <div className="flex-column">
                <Button bsStyle="default" className="n-o-btn">
                  <div className="audio-icon">
                    <svg>
                      <use xlinkHref={`${Sprite}#no-audio`} />
                    </svg>
                  </div>
                  No Audio
                </Button>
              </div>

              <div className="flex-column">
                <div className="d-a-btn">
                  <DropdownButton
                    title={
                      <div className="audio-btn">
                        <div className="audio-icon">
                          <svg>
                            <use xlinkHref={`${Sprite}#default-sound`} />
                          </svg>
                        </div>
                        Default Audio
                      </div>
                    }
                  >
                    <MenuItem href="">
                      {' '}
                      <Radio className="radio-primary" name="type">
                        Default1.mp3
                        <span className="check" />
                      </Radio>
                    </MenuItem>
                    <MenuItem href="">
                      {' '}
                      <Radio className="radio-primary" name="type">
                        Default2.mp3
                        <span className="check" />
                      </Radio>
                    </MenuItem>
                  </DropdownButton>
                </div>
              </div> */}

              <div
                className="flex-column"
                onClick={() =>
                  this.setState({
                    recordBtn: true,
                    canvas: false,
                    audioFile: ''
                  })
                }
              >
                <span className="icon-record_sound addTrack--icon">
                  <span className="path1" />
                  <span className="path2" />
                  <span className="path3" />
                  <span className="path4" />
                  <span className="path5" />
                  <span className="path6" />
                </span>
                Record Audio
              </div>

              {this.state.pauseBtn ? (
                <div
                  className="custom-upload flex-column"
                  onClick={this.handleselectedFile}
                >
                  <span className="icon-upload_sound addTrack--icon">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                    <span className="path4" />
                    <span className="path5" />
                    <span className="path6" />
                    <span className="path7" />
                  </span>{' '}
                  Upload Sound Track
                </div>
              ) : (
                <div className="custom-upload flex-column">
                  <input
                    type={this.state.pauseBtn ? 'hidden' : 'file'}
                    accept="audio/*"
                    value=""
                    onChange={this.handleselectedFile}
                  />
                  <span className="icon-upload_sound addTrack--icon">
                    <span className="path1" />
                    <span className="path2" />
                    <span className="path3" />
                    <span className="path4" />
                    <span className="path5" />
                    <span className="path6" />
                    <span className="path7" />
                  </span>{' '}
                  Upload Audio
                </div>
              )}
            </div>

            {this.state.loader === true ? (
              <div style={{ height: '100px', position: 'relative' }}>
                <div className="loader">
                  <img
                    src="../../assets/img/svg-loaders/three-dots.svg"
                    width="50"
                    alt="loader"
                    style={
                      this.state.loader === true
                        ? { visibility: 'visible' }
                        : { visibility: 'hidden' }
                    }
                  />
                </div>
              </div>
            ) : null}

            {this.state.audioFile ||
            this.state.canvas ||
            this.state.recordBtn ||
            this.state.pauseBtn ? (
              <div className="canvasWrapper">
                {this.state.audioFile ? (
                  <div className="audioPlayer">
                    <div className="audioControls">
                      <a className="btn btn-default btnNext">
                        <svg>
                          <use xlinkHref={`${Sprite}#rewind`} />
                        </svg>
                      </a>

                      <a
                        id="playPauseBtn"
                        className="btn btn-default btnPlayPause playing"
                        onClick={this.playAudioTrack}
                      >
                        <svg>
                          <use xlinkHref={`${Sprite}#play`} />
                        </svg>

                        <svg>
                          <use xlinkHref={`${Sprite}#pause`} />
                        </svg>
                      </a>

                      <a className="btn btn-default btnPrev">
                        <svg>
                          <use xlinkHref={`${Sprite}#forward`} />
                        </svg>
                      </a>
                    </div>

                    <audio
                      id="audioPlayer"
                      src={this.state.audioFile}
                      controls={true}
                      autoPlay={true}
                      loop={true}
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  ''
                )}
                {this.state.canvas ? <canvas id="oscilloscope" /> : null}
                <div className="recordingControls">
                  {this.state.pauseBtn
                    ? [
                        <button
                          className="btn btn-default"
                          onClick={this.stopRecording}
                        >
                          <svg>
                            <use xlinkHref={`${Sprite}#stoprecording`} />
                          </svg>
                        </button>,
                        <span className="timer" id="timer">
                          <Countdown endDate={moment().add(1, 'minutes')} />
                        </span>
                      ]
                    : null}

                  {this.state.recordBtn ? (
                    <button
                      className="mic btn btn-default"
                      onClick={this.startRecording}
                    >
                      <svg>
                        <use xlinkHref={`${Sprite}#mic`} />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            bsStyle="primary"
            className="btn btn-primary"
            onClick={this.addSoundtrack}
          >
            Add
          </Button>

          <Button
            bsStyle="default"
            className="btn-default"
            onClick={this.closeSoundTrackModal.bind(this)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
export default AddSoundTrack;
