"use strict";

const API_URL = 'http://ewnt.schneidereit-trac.com/api';
const MAX_RETRIES = 10;
let ROOM;
// include the node.js native http package
let http = require('http');
let https = require('https');
let request = require('request-promise');

module.exports = {
  getRoom: async function getRoom(roomNr, result){
    if (!roomNr)
    {
      result(new Error(`No Room provided`))
    }
    ROOM = roomNr
    try{
      let data = await this.getData();
      result(null, data)
    }
    catch (error){
      result(error)
    }
  },
  getData: async function getData() {

    //Get Login Data

    let token, data;

    //Password seems to be static
    const password = "wdfbjkh78326z3rejknfdeqcw89uz3r2adsjoi"
    await (httpPostRequest(
        API_URL,
        '{"request":{"head":{"credentials":{"user":"api","pass":"' + password + '"},"requesttype":"authentication"}}}'
      )
      .then(function (body){
        token = JSON.parse(body)['result']['head']['credentials']['token']
      }));

    //Get Data
    //Token is not imedialtely valid
    data = await machineJSON(token);
    return data;

  }
}


function wait (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}


async function httpPostRequest(url, data) {
  let options = {
    method: 'POST',
    uri: url,
    body: data,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  return request(options);
}

async function machineJSON(token) {
  for(let i = 0; i < MAX_RETRIES; i++)
  {
    try {
      let jsonData;
      await (httpPostRequest(
        API_URL,
        JSON.stringify({"request":{"head":{"credentials":{"token":token},"requesttype":"getRaum","api":"0.0.1"},"body":{"parameter":{"raumnr": ROOM}}}})
        )
        .then( (body) => {
          jsonData = JSON.parse(body)
        }));
        return jsonData
    } catch (err) {
      console.log("Error, wait before retry");
      await wait(200);
      console.log("Retrying");
    }
  }
  throw "Failed after " + MAX_RETRIES + "tries";
}
