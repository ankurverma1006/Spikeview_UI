import React from 'react';
import { Media } from 'react-bootstrap';
import { limitCharacter, getThumbImage } from '../../common/commonFunctions';

const StudentEducation = props => {
  return (
    <li className="myProfileInfo--item">
      <div className="flex">
        <div className="title--with--border">
          <p>Education</p>
        </div>
      </div>

      <div className="myProfileInfo--item--box">
        {props.educationData && props.educationData.length > 0 ? (
          props.educationData.map((data, index) => (
            <div className="content-box p-2" key={index}>
              <Media className="school-info--wrapper">
                <Media.Left>
                  {data.logo !== '' ? (
                    <img src={getThumbImage('small', data.logo)} alt="" />
                  ) : (
                    <span className="icon-school icon lg-icon" />
                  )}
                </Media.Left>
                <Media.Body>
                  <Media.Heading className="s--name">
                    {data.institute}
                  </Media.Heading>
                  <p className="s--duration">
                    {data.fromGrade} to {data.toGrade}{' '}
                    <span className="s--year">
                      {data.fromYear} to {data.toYear}{' '}
                    </span>
                  </p>
                  <p className="s--summary" title={data.description}>
                    {data.description
                      ? limitCharacter(data.description, 165)
                      : ''}
                  </p>
                </Media.Body>
              </Media>
            </div>
          ))
        ) : (
          <div className="content-box p-2">No Data Available</div>
        )}
      </div>
    </li>
  );
};

export default StudentEducation;
