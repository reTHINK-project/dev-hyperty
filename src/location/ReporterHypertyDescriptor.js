export let hypertyDescriptor = {
  "name": "LocationReporter",
  "configuration": {
    "domain_registration": false,
    "domain_routing": false
  },
  "hypertyType": [
    "location-context"
  ],
  "constraints": {
    "browser": true
  },
  "language": "javascript",
  "signature": "",
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/Context"
  ]
}
