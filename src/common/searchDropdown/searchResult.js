import React, { Component } from 'react';
import { connect } from 'react-redux';

import SearchItem from './searchItem';
import Header from '../../student/header/header';
import ParentHeader from '../../parent/header/header';

class searchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResult: []
    };
  }

  componentWillMount() {
    document.body.classList.add('light-theme');
    document.body.classList.remove('absoluteHeader');
  }

  componentDidMount() {
    if (this.props.location.state) {
      let profileOptions = this.props.location.state.profileOptions;
      this.setState({ searchResult: profileOptions });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.state) {
      let profileOptions = nextProps.location.state.profileOptions;
      this.setState({ searchResult: profileOptions });
    }
  }

  render() {
    return (
      <div className="innerWrapper">
        {this.props.parent ? (
          <ParentHeader {...this.props} />
        ) : (
          <Header {...this.props} />
        )}
        <div className="profileBox">
          <div className="container main">
            <div className="connections-wrapper">
              <div className="connections">
                <div className="title--with--border rightSide">
                  <p>
                    Showing{' '}
                    {this.state.searchResult
                      ? this.state.searchResult.length
                      : ''}{' '}
                    {this.state.searchResult &&
                    this.state.searchResult.length > 1
                      ? 'Results'
                      : 'Result'}
                  </p>
                </div>

                {this.state.searchResult && this.state.searchResult.length > 0
                  ? this.state.searchResult.map((item, index) => (
                      <SearchItem
                        key={index}
                        searchData={item}
                        userId={this.props.user.userId}
                        user={this.props.user}
                      />
                    ))
                  : 'No result found'}
              </div>
            </div>
          </div>
        </div>
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

export default connect(
  mapStateToProps,
  null
)(searchResult);
