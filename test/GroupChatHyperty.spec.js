import { expect } from 'chai'
//import rethink from '../.well-known/runtime/rethink'
import RuntimeLoader from 'service-framework/dist/RuntimeLoader';
import InstallerFactory from '../resources/factories/InstallerFactory';

describe('Group Chat Hyperty', () => {
    let domain = 'hybroker.rethink.ptinovacao.pt'
    let hypertyName = 'GroupChat'
    let groupChat = 'hyperty-catalogue://' + domain + '/.well-known/hyperties/' + hypertyName;
    describe('create chat', () => {
        xit('should return a new chat instance', (done) => {
            let runtime = 'https://catalogue.' + domain + '/.well-known/runtime/Runtime';
            let installerFactory = new InstallerFactory();
            let runtimeLoader = new RuntimeLoader(installerFactory, runtime);

            runtimeLoader.install()//{domain: 'localhost', development: true})
                .then(()=> { //}(runtime) =>{
                    runtimeLoader.requireHyperty(groupChat).then((result) => {
                        let chat = result.instance.create('test', [])
                        expect(chat).to.exist
                        done()
                    }) 
                })
        })
    })

    describe('create chat with a list of participants', () => {
        xit('should return a new chat instance', (done) => {
            let runtime = 'https://catalogue.' + domain + '/.well-known/runtime/Runtime';

            let installerFactory = new InstallerFactory();
            let runtimeLoader = new RuntimeLoader(installerFactory, runtime);

            runtimeLoader.install()//{domain: 'localhost', development: true})
                .then(()=> { //}(runtime) =>{
                    runtimeLoader.requireHyperty(groupChat).then((result) => {
                        result.instance.create('test', [{email: 'openidtest10@gmail.com', domain: domain}])
                            .then((chat)=>{
                                expect(chat).to.exist
                                done()
                            })
                    }) 
                })
        })

        xit('should notify to all subscribed participants', (done) => {
            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        let guestGroupChat = result
                        guestGroupChat.instance.onInvite((chat)=>{
                            expect(chat).to.exist
                            done()
                        })
                        rethink.install({domain: 'localhost', development: true})
                            .then((runtime) =>{
                                runtime.requireHyperty(groupChat).then((result) => {
                                    result.instance.create('test', [{email: 'openidtest10@gmail.com', domain: domain }])
                                })
                            })
                    }) 
                })
        })
    })
})
