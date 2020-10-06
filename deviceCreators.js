const sensorCreator = (sensor) => {
  let theType;
  switch (sensor.type) {
    case "Door Window Sensor":
      theType = "opening";
      break;
    case "Motion Sensor":
      theType = "motion";
      break;
    case "Smoke Sensor":
      theType = "smoke";
      break;
    default:
      break;
  }
  return {
    platform: "mqtt",
    name: sensor.name,
    state_topic:
      "/" + sensor.topic_base + "/attributes/" + sensor.uuid + "/value",
    payload_on: true,
    payload_off: false,
    value_template: "{{value_json.value}}",
    device_class: theType,
  };
};

const switchCreator = (aswitch) => {
  return {
    platform: "mqtt",
    name: aswitch.name,
    command_topic:
      "/" +
      aswitch.topic_base +
      "/request/attributes/" +
      aswitch.uuid +
      "/value",
    state_topic:
      "/" + aswitch.topic_base + "/attributes/" + aswitch.uuid + "/value",
    payload_on: '{"value":"true"}',
    payload_off: '{"value":"false"}',
    value_template: "{{value_json.value}}",
    state_on: true,
    state_off: false,
    optimistic: true,
    qos: 0,
    retain: true,
  };
};

const lightCreator = (dimmer) => {
  return {
    platform: "mqtt",
    name: dimmer.name,
    schema: "template",
    command_topic:
      "/" + dimmer.topic_base + "/request/attributes/" + dimmer.uuid + "/value",
    state_topic:
      "/" + dimmer.topic_base + "/attributes/" + dimmer.uuid + "/value",
    command_on_template:
      '{"value":"{{brightness | float | multiply(0.3922) | round(0)}}"}',
    command_off_template: '{"value":"0"}',
    state_template:
      '{% if value_json.value == "0" %}\n  off\n{% else %}\n  on\n{% endif %}\n',
    brightness_template:
      "{{value_json.value | float | multiply(2.55) | round(0) }}",
    optimistic: true,
  };
};

const coverCreator = (window) => {
  return {
    platform: "mqtt",
    name: window.name,
    command_topic:
      "/" + window.topic_base + "/request/attributes/" + window.uuid + "/value",
    set_position_topic:
      "/" + window.topic_base + "/request/attributes/" + window.uuid + "/value",
    position_topic:
      "/" + window.topic_base + "/attributes/" + window.uuid + "/value",
    payload_open: '{"value":"100"}',
    payload_close: '{"value":"0"}',
    payload_stop: '{"value":"100"}',
    position_open: 100,
    position_closed: 0,
    optimistic: true,
    value_template: "{{ value_json.value }}",
    set_position_template: '{"value":"{{position}}"}',
    qos: 0,
    retain: true,
  };
};

const automation = [
  {
    alias: "Start HomeKit",
    trigger: [
      {
        platform: "homeassistant",
        event: "start",
      },
    ],
    action: [
      {
        delay: "00:01",
      },
      {
        service: "homekit.start",
      },
    ],
  },
];

module.exports = {
  sensorCreator,
  switchCreator,
  lightCreator,
  coverCreator,
  automation,
};
