export let hypertyDescriptor = {
  "name": "UserAvailabilityReporter",
  "configuration": { "expires": 3600 },
  "hypertyType": [
    "availability_context"
  ],
  "constraints": {
    "browser": true
  },
  "language": "javascript",
  "signature": "",
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/ContextReporter"
  ]
}
