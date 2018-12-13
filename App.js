import React, {Component} from 'react';
import {createDrawerNavigator, createAppContainer} from 'react-navigation';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {ApolloProvider} from 'react-apollo';
import Dashboard from './screens/Dashboard';
import CustomDrawerContent from './components/CustomDrawerContent';

const App = createAppContainer(createDrawerNavigator({
  Dashboard: {
    screen: Dashboard,
    navigationOptions: {
      drawerLabel: 'Feature flags',
    }
  },
  Users: {
    screen: () => '',
    navigationOptions: {
      drawerLabel: 'Users',
    }
  }
}, {
  drawerBackgroundColor: '#333',
  contentComponent: CustomDrawerContent,
  contentOptions: {
    activeTintColor: '#fff',
    activeBackgroundColor: 'rgba(0,0,0,.2)',
    inactiveTintColor: 'hsla(0,0%,100%,.6)',
    itemsContainerStyle: {
      marginVertical: 0,
    },
    iconContainerStyle: {
      opacity: 1
    }
  }
}));

const cache = new InMemoryCache();
const client = new ApolloClient({
  cache,
  link: new HttpLink({
    uri: 'http://192.168.0.15:4000',
  }),
});

export default () => (
  <ApolloProvider client={client}>
    <App/>
  </ApolloProvider>
);