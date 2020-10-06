const axios = require("axios");

const fs = require("fs");
const yaml = require("js-yaml");
const { resolve } = require("path");
const {
  automation,
  sensorCreator,
  switchCreator,
  coverCreator,
  lightCreator,
} = require("./deviceCreators");

// autheticate using username and password
const username = process.argv[2];
const password = process.argv[3];
const gatewayId = process.argv[4];
console.log(username, password, gatewayId);

// get integrations belongs to the gatewayId
// authentication
const url = "https://us-central1-bdas-middle.cloudfunctions.net/api/login";

const authenticate = (username, password) => {
  return new Promise(async (resolve, reject) => {
    const userData = {
      email: username,
      password: password,
    };
    try {
      const authResponse = await axios.post(url, userData);
      // console.log(authResponse);
      const authToken = `Bearer ${authResponse.data.token}`;
      //   console.log(authToken);
      console.log("Logged in Successfully");

      resolve(authToken);
    } catch (error) {
      reject(error);
    }
  });
};

const getIntegrations = (authToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      axios.defaults.headers.common = { Authorization: `${authToken}` };
      const integrationsResponse = await axios.get(
        `https://us-central1-bdas-middle.cloudfunctions.net/api/integrations/${gatewayId}`
      );
      const integrations = integrationsResponse.data;
      //   console.log(integrations);
      console.log("Get the Devices Successfully");
      resolve(integrations);
    } catch (error) {
      reject(error);
    }
  });
};

const main = async () => {
  const binary_sensor = [];
  const switches = []; // different name because of reserved keyword switch
  const light = [];
  const cover = [];

  const authToken = await authenticate(username, password);
  const integrations = await getIntegrations(authToken);
  const mainObj = yaml.safeLoad(
    fs.readFileSync("/home/pi/bdas-middle/base.yaml", "utf8")
  );
  integrations.forEach((device) => {
    if (
      device.type === "Door Window Sensor" ||
      device.type === "Motion Sensor" ||
      device.type === "Smoke Sensor"
    ) {
      const newDevice = sensorCreator(device);
      binary_sensor.push(newDevice);
    } else if (
      device.type === "Normal Light" ||
      device.type === "Switch" ||
      device.type === "Outlet"
    ) {
      const newDevice = switchCreator(device);
      switches.push(newDevice);
    } else if (device.type === "Dimmer") {
      const newDevice = lightCreator(device);
      light.push(newDevice);
    } else if (device.type === "Curtain") {
      const newDevice = coverCreator(device);
      cover.push(newDevice);
    }
  });

  mainObj.automation = automation;
  mainObj.binary_sensor = binary_sensor;
  mainObj.switch = switches;
  mainObj.light = light;
  mainObj.cover = cover;

  const yamlStr = yaml.safeDump(mainObj);
  fs.writeFileSync(
    "/home/pi/.homeassistant/configuration.yaml",
    yamlStr,
    "utf8"
  );
  console.log(
    new Date().toUTCString(),
    ": You are connected & BDAS Integrations has been updated."
  );
};

main();
