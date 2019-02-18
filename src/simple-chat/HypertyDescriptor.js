export let hypertyDescriptor = {
  "name": "SimpleChat",
  "language": "javascript",
  "signature": "",
  "configuration": { 
    "domain_registration": false,
    "backup": true,
    "heartBeat": 60,
    "offline": "hyperty://sharing-cities-dsm/offline-sub-mgr"
     },
  "hypertyType": [
    "chat"
  ],
  "constraints": {
    "browser": true
       },
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/Communication"
  ]
}
