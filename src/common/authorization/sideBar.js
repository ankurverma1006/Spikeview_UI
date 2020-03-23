import React, { Component } from 'react';
import { Carousel } from 'react-bootstrap';

class Sidebar extends Component {
  render() {
    return (
      <div className="sidebar">
        <div className="overlay" />
        <a className="logo" href="/">
          Spike View
        </a>
        <div className="custom-slider">
          <Carousel>
            <Carousel.Item>
              <h3>SpikeView for Students</h3>
              <p className="carouselTitle">
                Put a Spotlight on Your Life - Tell Your Story{' '}
              </p>
              <p className="carousel-content">
                Help the world discover the incredible person you are and all
                the amazing accomplishments you’ve achieved—and every great
                thing you’re going to do at school or in your community.
              </p>
            </Carousel.Item>
            <Carousel.Item>
              <h3>SpikeView for Parents</h3>
              <p className="carouselTitle">
                Highlight Your Student’s Accomplishments{' '}
              </p>
              <p className="carousel-content">
                Display your student’s excellence and growing skills through a
                secure profile that evolves to match their flourishing talents
                and track their lifelong achievements.
              </p>
            </Carousel.Item>

            <Carousel.Item>
              <h3>Dream It, Do It, Share It! </h3>
              <p className="carouselTitle">
                Tell your story in your style - Security{' '}
              </p>
              <p className="carousel-content">
                Only share what you want, with who you want in with full data
                and privacy control managed by you.
              </p>
            </Carousel.Item>
          </Carousel>
        </div>
      </div>
    );
  }
}
export default Sidebar;
