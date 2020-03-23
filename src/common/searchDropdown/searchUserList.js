import React from 'react';

import userDefaultImage from '../../assets/img/default-img.PNG';
import { limitCharacter, getThumbImage } from '../commonFunctions';

const SearchUserList = ({ user }) => (
  <div>
    <img
      alt={userDefaultImage}
      src={
        user.picture ? getThumbImage('small', user.picture) : userDefaultImage
      }
      style={{
        height: '24px',
        marginRight: '10px',
        width: '24px'
      }}
    />
    <span className="wrap-long-words" title={user.label}>
      {limitCharacter(user.label, 12)}
    </span>
  </div>
);

export default SearchUserList;
