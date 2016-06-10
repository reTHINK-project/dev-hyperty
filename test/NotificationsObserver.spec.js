var proxyquire = require('proxyquireify')(require)
import sinon from 'sinon'
import { expect } from 'chai'
import { Syncher } from 'service-framework/dist/Syncher'

function syncher(){} 
syncher.prototype.Syncher = function(){}

describe('Notification Observer', ()=>{
    describe('onNotification', ()=>{
        //TODO: proxyquire doesn't work with Syncher, I'll check this later.
        xit('should receive notifications', ()=>{
let activate = proxyquire('../src/notifications/NotificationsObserver.hy.js',
        {'service-framework/dist/Syncher': syncher}).default
            let observer =  activate({},{},{})
            
            observer.onNotification((notification)=>{
                //assert
            })
        })
    })
})

