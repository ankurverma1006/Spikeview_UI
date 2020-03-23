import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import { getThumbImage } from '../../../../common/commonFunctions';

class competencyWiseRecommendations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recommendationListModal: true,
      recommandationData: [],
      competencyName: ''
    };
  }

  componentDidMount() {
    console.log(this.props);
    if (this.props.recommandationData) {
      console.log(this.props.recommandationData);
      this.setState({
        recommandationData: this.props.recommandationData,
        competencyName: this.props.competencyName
      });
    }
  }

  closerecommendationListModal = () => {
    this.setState({ recommendationListModal: false });
    this.props.closeRecommendationComponent();
  };

  render() {
    // const firstName = this.state.recommandationData.recommender.firstName || '';
    return (
      <Modal
        className=""
        show={this.state.recommendationListModal}
        onHide={this.closerecommendationListModal}
      >
        <Modal.Header className="text-center" closeButton>
          {this.state.competencyName === '' ? (
            <Modal.Title>Recommendation</Modal.Title>
          ) : (
            <Modal.Title>
              Recommendations for {this.state.competencyName} (
              {this.state.recommandationData.length})
            </Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body>
          <div className="recomm-wrapper">
            {this.state.recommandationData.length > 0 ? (
              this.state.recommandationData.map((recommendation, index) => (
                <div className="flex mb-20 recomm-wrapper--item" key={index}>
                  <div className="a-r-img">
                    {recommendation.recommender.profilePicture ? (
                      <img
                        src={getThumbImage(
                          'medium',
                          recommendation.recommender.profilePicture
                        )}
                        className="object-fit-cover img-responsive"
                        alt=""
                      />
                    ) : (
                      <span className="icon-user_default2 default-icon centeredBox" />
                    )}
                  </div>

                  <div className="show-hide-text wrapper">
                    {/* <a id="show-more" className="show-less" href="#show-less">
                        Less
                      </a>
                      <a id="show-less" className="show-more" href="#show-more">
                        More
                      </a> */}
                    <h5 className="u-title">
                      {' '}
                      {recommendation.recommender.firstName}
                    </h5>
                    <p>
                      {recommendation.stage === 'Requested'
                        ? recommendation.request
                        : recommendation.recommendation}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex mb-20">
                <div className="a-r-img">
                  <span className="icon-user_default2 default-icon centeredBox" />
                  {/* <img
                  src="assets/img/profile--pic.jpg"
                  className="object-fit-cover img-responsive"
                  alt=""
                /> */}
                </div>

                {/* <div className="show-hide-text wrapper"> */}
                <div className="flex-1">
                  {/* <a id="show-more" className="show-less" href="#show-less">
                  Less
                </a>
                <a id="show-less" className="show-more" href="#show-more">
                  More
                </a> */}
                  <h5 className="u-title">
                    {this.state.recommandationData &&
                    this.state.recommandationData.recommender
                      ? this.state.recommandationData.recommender.firstName
                      : ''}
                  </h5>
                  {/* <p>{this.state.recommandationData.recommendation}</p> */}
                  <p>
                    {this.state.recommandationData.stage === 'Requested'
                      ? this.state.recommandationData.title
                      : this.state.recommandationData.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default competencyWiseRecommendations;
