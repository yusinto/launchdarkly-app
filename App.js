import React, {Component} from 'react';
import {ScrollView, StyleSheet, View, Text} from 'react-native';
import {createDrawerNavigator, createAppContainer, DrawerItems, SafeAreaView} from 'react-navigation';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {HttpLink} from 'apollo-link-http';
import {ApolloProvider} from 'react-apollo';
import styled from 'styled-components';
import Dashboard from './screens/Dashboard';
import colors from './constants/Colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const DrawerHeaderRoot = styled.View`
  justify-content: center;
  padding-left: 14px;
  height: 100px;
  background-color: ${colors.secondary};
`;
const Project = styled.Text`
  font-size: 14px;
`;
const Environment = styled.Text`
  margin-top: 5px;
  font-size: 18px;
`;
CustomDrawerContentComponent = (props) => (
  <ScrollView>
    <DrawerHeaderRoot>
      <Project>string</Project>
      <Environment>Production</Environment>
    </DrawerHeaderRoot>
    <SafeAreaView style={styles.container} forceInset={{top: 'always', horizontal: 'never'}}>
      <DrawerItems {...props} />
    </SafeAreaView>
  </ScrollView>
);

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
  contentComponent: CustomDrawerContentComponent,
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