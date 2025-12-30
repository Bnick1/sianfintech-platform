/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* User login
*
* authLoginPostRequest AuthLoginPostRequest 
* returns _auth_login_post_200_response
* */
const authLoginPOST = ({ authLoginPostRequest }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        authLoginPostRequest,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  authLoginPOST,
};
