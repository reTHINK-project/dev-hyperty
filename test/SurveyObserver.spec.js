import sinon from 'sinon'
import { expect } from 'chai'
//import activate from '../src/notifications/SurveyObserver.hy.js'

function syncher(){} 
syncher.prototype.onNotification = (callback)=>{ 
    syncher.prototype._callback = callback
} 
syncher.prototype.subscribe = ()=>Promise.resolve({onAddChild:(callback)=>callback({})})

describe('Notification Observer', ()=>{
    describe('onNotification', ()=>{
        xit('should receive notifications', (done)=>{
 //           activate.__Rewire__('Syncher', syncher)
 //           let observer =  activate('http://test.com',{},{})
 //           
 //           observer.instance.onNotification((notification)=>{
 //               done()
 //           })
 //           syncher.prototype._callback.bind(observer.instance)({schema: 'hyperty-catalogue://test.com/.well-known/dataschemas/Communication'})
        })
    })
})

