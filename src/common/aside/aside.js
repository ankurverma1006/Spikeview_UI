import React, { Component } from 'react';
class Aisde extends Component {
  render() {
    return (
      <div className="profile-sidebar">
        <div className="profile-pic--wrapper">
          <div className="profile-pic">
            <img src="assets/img/profile--pic.jpg" alt="" />
            <div className="editProfile--wrapper">
              <div className="editProfile">
                <input type="file" />
                <span class="icon-camera icon" />
              </div>
            </div>
          </div>
        </div>
        <div className="profile-analytical--data profile-sidebar--box">
          <div className="table-responsive  profile-analytical-table--wrapper">
            <table className="table profile-analytical-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Accomplishments</strong>
                  </td>
                  <td className="tableValue">8</td>
                </tr>
                <tr>
                  <td>
                    <strong>Endorsments</strong>
                  </td>
                  <td className="tableValue">458</td>
                </tr>
                <tr>
                  <td>
                    <strong>Recommendations</strong>
                  </td>
                  <td className="tableValue">25</td>
                </tr>
              </tbody>
            </table>
          </div>

          <img className="centeredImg" src="assets/img/charts.jpg" alt="" />
        </div>
      </div>
    );
  }
}
export default Aisde;
