import Logo from './Logo'

const Main = React.createClass({

    onUserListChanged() {
      console.log('new user event')
      this.props.hyperty.queryUsers()
        .then(users => {
            console.log('users', users)
            this.setState({users: users})
        })
    },

    getInitialState(){
      console.log('dicoveryH')
      this.props.hyperty.onUserListChanged(this.onUserListChanged)
      this.props.hyperty.queryUsers()
        .then(users => {
            this.setState({users: users})
        })

      return {users:[]};
    },

    render() {
        return (<div className="container-fluid">
                <Logo />
                <div className="row">
                    <div className="col-sm-12">
                        <a href="#">Users <span className="badge">{this.state.users.length}</span></a>
                    </div>
                </div>
        </div>);
    }
});

export default Main
