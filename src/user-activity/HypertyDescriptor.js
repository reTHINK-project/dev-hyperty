export let hypertyDescriptor = {
  "name": "UserActivityObserver",
  "configuration": {
    "discoveryProviders": ["fitness.google.com"],
    "domain_registration": false,
    "domain_routing": false
  },
  "hypertyType": [
    "user_activity_context"
  ],
  "description": "Descriptor of UserActivityObserver Hyperty",
  "constraints": {
    "browser": true
  },
  "language": "javascript",
  "signature": "",
  "dataObjects": [
    "https://catalogue.%domain%/.well-known/dataschema/Context"
  ]
}
