export default {
  alphaOnly: '/^[A-Za-z\\s]+$/',
  // passwordPattern:
  //   '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&#])[A-Za-z\\d$@$!%*?&#]{8,20}/'

  passwordPattern:
    '/^(?=\\S*[a-z])(?=\\S*[A-Z])(?=\\S*\\d)(?=\\S*[^\\w\\s])\\S{8,}$/'
};
