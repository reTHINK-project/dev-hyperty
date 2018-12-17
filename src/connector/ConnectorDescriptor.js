export let hypertyDescriptor = {
  "name": "Connector",
  "configuration": {
      "iceServers": [
           {
             "urls": "turn:numb.viagenie.ca",
             "credential": "zJcH3erd9cUv5Zh",
             "username": "luis-t-duarte@telecom.pt"
           },
           {
                  "urls": [
                    "stun:stun.voiparound.com",
                    "stun:stun.voipbuster.com",
                    "stun:stun.voipstunt.com",
                    "stun:stun.voxgratia.org",
                    "stun:stun.ekiga.net",
                    "stun:stun.schlund.de",
                    "stun:stun.iptel.org",
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun.ideasip.com",
                    "stun:stun4.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302"
                  ]
          }
        ],
        "iceTransportPolicy": "all"
  },
  "constraints": {
    "browser":true,"windowSandbox":true,"mic":true,"camera":true
  },
  "hypertyType": ["audio", "video"],
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/Connection"
  ]
};
