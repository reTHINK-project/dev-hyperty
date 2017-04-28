import URI from 'urijs'
import HypertyDiscovery from 'service-framework/dist/Discovery'
import { Syncher} from 'service-framework/dist/Syncher'

let Survey = {
    results: [],

    _addResponse(result){
        this.results = this.results.concat([result])
    }
}

const SurveyReporter = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            console.log('participanrt', p)
            return this.hypertyDiscoveryService.discoverHyperties(p.email, ['comm'], ['location'], p.domain)
                .then((hyperties) => {
                    let target = hyperties
                        .sort((a, b) => (new Date(hyperties[a].lastModified) < new Date(hyperties[b].lastModified)) ? 1 : -1)
                        .shift()

                    if (!target)
                        throw new Error('Chat Hyperty not found', p)

                    return target.hypertyID
                })
        }))
    },

    _createSyncher (hyperties){
        const survey = {
            name: 'survey',
            resources: [],
            children: [],
            startingTime: new Date().toJSON(),
            status: 'open',
            participants: hyperties
        }
        return this.syncher.create(this.objectDescURL, hyperties, survey)
    },

    create (survey, participants) {
        return this._getHyFor(participants)
            .then((hyperties) => this.createFromHyperties(survey, hyperties))
    },

    createFromHyperties (survey, hyperties) {
        return this._createSyncher(hyperties)
            .then((dataObjectReporter) => {
                dataObjectReporter.onSubscription((event)=>event.accept())
                dataObjectReporter.onAddChild((dataChild)=>{
                    Survey._addResponse(dataChild.value.response)
                })
                dataObjectReporter.addChild({survey:survey})
                Survey.config = survey
                return Survey
            })
    }
}

const SurveyReporterFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, config.runtimeURL, bus)
    let syncher = new Syncher(hypertyURL, bus, config)
    return Object.assign(Object.create(SurveyReporter), {
        hypertyDiscoveryService: hypertyDiscovery,
        objectDescURL: 'hyperty-catalogue://catalogue.' + uri.hostname() + '/.well-known/dataschema/Communication',
        hypertyURL: hypertyURL,
        syncher: syncher
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'SurveyReporter',
        instance: SurveyReporterFactory(hypertyURL, bus, config)
    }
}
