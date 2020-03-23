import React from 'react';

const StudentSummary = props => {
  return (
    <li className="myProfileInfo--item">
      <div className="title--with--border">
        <p>Summary</p>
      </div>
      <div className="myProfileInfo--item--box">
        <div className="content-box p-2">
          <div className="content-box--edit text-right" />
          <p>{props.summary ? props.summary : 'No Data Available'}</p>
        </div>
      </div>
    </li>
  );
};

export default StudentSummary;
