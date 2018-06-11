const userValidator = {};

const isString = string => {
  return typeof string === 'string';
};
const isNumber = number => {
  return typeof number === 'number';
};

userValidator['/wx/login'] = function(data) {
  return isString(data.code);
};

userValidator['/wx/update-user-info'] = function(data) {
  return (
    isString(data.avatarUrl) &&
    isString(data.city) &&
    isString(data.country) &&
    isNumber(data.gender) &&
    isString(data.language) &&
    isString(data.nickName) &&
    isString(data.province)
  );
};

module.exports = userValidator;
