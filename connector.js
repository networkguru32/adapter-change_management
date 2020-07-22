/**
 * Import the Node.js request package.
 * See https://www.npmjs.com/package/request
 */
const request = require('request');

// We'll use this regular expression to verify REST API's HTTP response status code.
const validResponseRegex = /(2\d\d)/;

// Use JSDoc to create a JSDoc data type for an IAP callback.
// Call the new type iapCallback.
// Notice iapCallback is a data-first callback.

/**
 * @callback iapCallback
 * @description A [callback function]{@link
 *   https://developer.mozilla.org/en-US/docs/Glossary/Callback_function}
 *   is a function passed into another function as an argument, which is
 *   then invoked inside the outer function to complete some kind of
 *   routine or action.
 *
 * @param {*} response - When no errors are caught, return data as a
 *   single argument to callback function.
 * @param {error} [errorMessage] - If an error is caught, return error
 *   message in optional second argument to callback function.
 */

/**
 * The ServiceNowConnector class.
 *
 * @summary ServiceNow Change Request Connector
 * @description This class contains properties and methods to execute the
 *   ServiceNow Change Request product's APIs.
 */
class ServiceNowConnector {
    constructor(options) {
    this.options = options;
  }
  
/**
 * @function get
 * @description Call the ServiceNow GET API. Sets the API call's method and query,
 *   then calls sendRequest() using options passed from main.js.
 *
 * @param {object} getCallOptions - Passed call options.
 * @param {string} getCallOptions.method - the method to use for the request
 * @param {string} getCallOptions.query - query for the GET request
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} results - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} error - The error property of callback.
 */
  get(callback) {
    let getCallOptions = { ...this.options };
    getCallOptions.method = 'GET';
    getCallOptions.query = 'sysparm_limit=1';
    this.sendRequest(getCallOptions, (results, error) => callback(results.response, error));
  }
  
/**
 * @function put
 * @description Call the ServiceNow GET API. Sets the API call's method and query,
 *   then calls sendRequest() using options passed from main.js.
 *
 * @param {object} getCallOptions - Passed call options.
 * @param {string} getCallOptions.method - the method to use for the request
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} results - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} error - The error property of callback.
 */
  post(callback) {
    let getCallOptions = { ...this.options };
    getCallOptions.method = 'POST';
    getCallOptions.query = null;
    this.sendRequest(getCallOptions, (results, error) => callback(results.response, error));
  }

/**
 * @function sendRequest
 * @description Builds final options argument for request function
 *   from global const options and parameter callOptions.
 *   Executes request call, then verifies response.
 *
 * @param {object} callOptions - Passed call options.
 * @param {string} callOptions.query - URL query string.
 * @param {string} callOptions.serviceNowTable - The table target of the ServiceNow table API.
 * @param {string} callOptions.uri - the complete URI for the request
 * @param {string} callOptions.method - HTTP API request method.
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} callback.error - The error property of callback.
 */
  sendRequest(callOptions, callback) {
    if (callOptions.query)
      callOptions.uri = this.buildUri(callOptions.serviceNowTable, callOptions.query);
    else
      callOptions.uri = this.buildUri(callOptions.serviceNowTable);
    const requestOptions = {
        method: callOptions.method,
        auth: {
            user: callOptions.username,
            pass: callOptions.password,
        },
        baseUrl: callOptions.url,
        uri: callOptions.uri,
    };
    request(requestOptions, (error, response, body) => {
        this.processRequestResults(error, response, body, (processedResults, processedError) => callback(processedResults, processedError));
    });
  }

  /**
 * @function buildUri
 * @description Build and return the proper URI by appending an optionally passed
 *  former constructUri must have had a naming convention issue
 *   [URL query string]{@link https://en.wikipedia.org/wiki/Query_string}.
 *
 * @param {string} serviceNowTable - The table target of the ServiceNow table API.
 * @param {string} [query] - Optional URL query string.
 *
 * @return {string} uri ServiceNow URL
 */
  buildUri(serviceNowTable, query) {
    let uri = `/api/now/table/${serviceNowTable}`;
    if (query) {
        uri = `/api/now/table/${serviceNowTable}` + '?' + query;
    }
    return uri;
  }

/**
 * @function processRequestResults
 * @description Inspect ServiceNow API response for an error, bad response code, or
 *   a hibernating instance. If any of those conditions are detected, return an error.
 *   Else return the API's response.
 *
 * @param {error} error - The error argument passed by the request function in its callback.
 * @param {object} response - The response argument passed by the request function in its callback.
 * @param {string} body - The HTML body argument passed by the request function in its callback.
 * @param {iapCallback} callback - Callback a function.
 * @param {(object|string)} callback.data - The API's response. Will be an object if sunnyday path.
 *   Will be HTML text if hibernating instance.
 * @param {error} callback.error - The error property of callback.
 */
  processRequestResults(error, response, body, callback) {
      const checkHibernate = {
          body: body,
          response: response,
      };
      if (this.isHibernating(checkHibernate)) {
          console.error('ServiceNow is hibernating - wake it up');
          callback.error = 'ServiceNow is hibernating - wake it up';
      } else  if (error) {
          console.error(callbackError);
          callback.error = 'There was an error in the request';
      } else {
          callback.data = {
              response,
          };
          callback.error = null;
      }
      return callback(callback.data, callback.error);
  }

  /**
 * @function isHibernating
 * @description Checks if request function responded with evidence of
 *   a hibernating ServiceNow instance.
 *
 * @param {object} response - The response argument passed by the request function in its callback.
 *
 * @return {boolean} Returns true if instance is hibernating. Otherwise returns false.
 */
  isHibernating(response) {
      return response.body.includes('hibernating')
      && response.body.includes('<html>')
      && response.response.statusCode === 200;
  }

}

module.exports = ServiceNowConnector;