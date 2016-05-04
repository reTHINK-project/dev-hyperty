var proxyquire = require('proxyquire')
import { assert } from 'chai'
import MessageBus from 'runtime-core/src/bus/MessageBus'
import sinon from 'sinon'
import HypertyDiscovery from 'service-framework/src/hyperty-discovery/HypertyDiscovery'
import SyncherManager from 'runtime-core/src/syncher/SyncherManager'
import RuntimeCatalogue from 'service-framework/src/runtime-catalogue/RuntimeCatalogue-Local'
import Registry from 'runtime-core/src/registry/Registry'

var dataSchema = JSON.stringify(
       {
  "FakeDataSchema": {
    "sourcePackage": {
      "sourceCode": "ewoJIiRzY2hlbWEiOiAiaHR0cDovL2pzb24tc2NoZW1hLm9yZy9kcmFmdC0wNC9zY2hlbWEjIiwKCSJpZCI6ICJGYWtlT2JqZWN0IiwKCSJ0eXBlIjogIm9iamVjdCIsCgkicmVxdWlyZWQiOiBbInNjaGVtZSJdLAoJImFkZGl0aW9uYWxQcm9wZXJ0aWVzIjogZmFsc2UsCiAgInByb3BlcnRpZXMiOiB7CgkJInNjaGVtZSI6IHsKCQkJImNvbnN0YW50IjogImZha2UiCgkJfSwKCQkiY2hpbGRyZW4iOiB7CgkJCSJjb25zdGFudCI6IFsibWVzc2FnZSJdCgkJfQoJfQp9Cg==",
      "sourceCodeClassname": "FakeDataSchema",
      "encoding": "base64",
      "signature": ""
    },
    "cguid": 1,
    "type": "DataSchemas",
    "version": "0.1",
    "description": "Description of FakeDataSchema",
    "objectName": "FakeDataSchema",
    "configuration": {},
    "sourcePackageURL": "/sourcePackage",
    "language": "JSON-Schema",
    "signature": "",
    "messageSchemas": "",
    "dataObjects": [],
    "accessControlPolicy": "somePolicy"
  },
  "HelloWorldDataSchema": {
    "sourcePackage": {
      "sourceCode": "ew0KCSIkc2NoZW1hIjogImh0dHA6Ly9qc29uLXNjaGVtYS5vcmcvZHJhZnQtMDQvc2NoZW1hIyIsDQoJImlkIjogIkhlbGxvT2JqZWN0IiwNCgkidHlwZSI6ICJvYmplY3QiLA0KCSJyZXF1aXJlZCI6IFsiaGVsbG8iXSwNCgkiYWRkaXRpb25hbFByb3BlcnRpZXMiOiBmYWxzZSwNCiAgInByb3BlcnRpZXMiOiB7DQoJCSJzY2hlbWUiOiB7DQoJCQkiY29uc3RhbnQiOiAiaGVsbG8iDQoJCX0sDQoJCSJoZWxsbyI6IHsNCgkJCSJ0eXBlIjogInN0cmluZyINCgkJfQ0KCX0NCn0NCg==",
      "sourceCodeClassname": "HelloWorldDataSchema",
      "encoding": "base64",
      "signature": ""
    },
    "cguid": 1,
    "type": "DataSchemas",
    "version": "0.1",
    "description": "Description of HelloWorldDataSchema",
    "objectName": "HelloWorldDataSchema",
    "configuration": {},
    "sourcePackageURL": "/sourcePackage",
    "language": "JSON-Schema",
    "signature": "",
    "messageSchemas": "",
    "dataObjects": [],
    "accessControlPolicy": "somePolicy"
  }
       } 
        )
var httpRequest = {};
httpRequest.get = sinon.stub();
httpRequest.get
    .withArgs('hyperty-catalogue://localhost/resources/descriptors/DataSchemas.json')
    .returns(new Promise((resolve, reject)=>{ 
        resolve(dataSchema)
    }));

var runtimeFactory = {};
runtimeFactory.createHttpRequest = sinon.stub();
runtimeFactory.createHttpRequest.returns(httpRequest);

var hdMock = sinon.spy(function(){
    let stub = sinon.createStubInstance(HypertyDiscovery)
    stub.discoverHypertyPerUser
        .returns(new Promise((resolve, reject) =>{
            resolve({
                hypertyURL:"hyperty://localhost/e1b25389-1234-482e-b340-673be37eb3fc"
            })
        }))

    return stub})
var activate = proxyquire('../src', 
        {'service-framework/src/hyperty-discovery/HypertyDiscovery': hdMock}).default

describe('Group Chat Hyperty', () => {
    describe('create chat', () => {
        it('should return a new chat instance', (done) => {
            let name = 'test chat'
            let configuration = {runtimeURL: "runtime://localhost/2484"}
            let registry = new Registry(configuration.runtimeURL, {}, {})
            let bus = new MessageBus(registry)
            let hypertyURL = "hyperty://localhost/e1b25389-2189-482e-b340-673be37eb3fc"
            let groupChatHy_main = activate(hypertyURL, bus, configuration).instance
            let catalog = new RuntimeCatalogue(runtimeFactory)
            let syncherManager = new SyncherManager(configuration.runtimeURL, bus, undefined, catalog)
            groupChatHy_main.create(name, [])
                .then((chat) => {
                    assert.isDefined(chat)
                    done()
                })

        })
    })

    describe('create chat with a list of participants', () => {
        xit('should return a new chat instance', (done) => {
            let name = 'test chat'
            let bus = new MessageBus()
            let configuration = {runtimeURL: "runtime://localhost/2484"}
            let hypertyURL_main = "hyperty://localhost/e1b25389-2189-482e-b340-673be37eb3fc"
            let hypertyURL_guest = "hyperty://localhost/e1b25389-1234-482e-b340-673be37eb3fc"
            let groupChatHy_main = activate(hypertyURL_main, bus, configuration).instance
            let groupChatHy_guest = activate(hypertyURL_guest, bus, configuration).instance
            let new_chat = undefined
            let new_participant = 'test@test.com'

            //groupChatHy_guest.onAdd((chat) => {
            //    new_chat = chat
            //}) 

            groupChatHy_main.create(name, [{email: 'test@test.com', domain: 'test.com'}]).then((chat)=>{
                assert.include(chat.participants, new_participant)
                assert.isDefined(new_chat)
                done()
            })
        })
    })
})
