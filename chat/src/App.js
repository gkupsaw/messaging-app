import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Room from './molecules/Room';
import Login from './molecules/Login';
import Register from './molecules/Register';

class App extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path='/room' component={Room} />
                    <Route exact path='/login' component={Login} />
                    <Route exact path='/register' component={Register} />
                    <Route exact path='*' component={Login} />
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
