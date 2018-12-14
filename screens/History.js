import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {Text, FlatList, Switch, Button, View} from 'react-native';
import {Moment} from 'react-moment';
import moment from 'moment';
import gql from 'graphql-tag';
import {Mutation, Query, graphql} from 'react-apollo';
import styled from 'styled-components/native';
import {Svg} from 'expo';
import {Entypo} from '@expo/vector-icons';
import EnvPicker from "./EnvPicker";
import { MarkdownView } from 'react-native-markdown-view'

const GET_AUDITLOG = gql`
      query GetAuditLog($projKey: String!, $envKey: String) {
          auditlog(projKey: $projKey, envKey: $envKey) {
              _id
              comment
              date
              kind
              description
              shortDescription
              title
              titleVerb
              name
              member {
                email
                firstName
                lastName
              }
          }
      }
`;

const ListItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  margin-left: 20px;
  margin-right: 30px;
`;
const ListItemLeftGroup = styled.View`
  width: 20%;
  flex-direction: row;
`;

const ListItemRightGroup = styled.View`
  flex-direction: row;
  margin-left: 10px;
  margin-right: 50px;
`;

const Separator = styled.View`
  width: 100%;
  background-color: rgba(0,0,0,.1);
  height: 1px;
`;
const Hamburger = styled.View`
  margin-left: 10px;
`;

class HistoryScreen extends Component {
  static navigationOptions = ({navigation}) => {
    const projKey = navigation.getParam('projKey');
    const envKey = navigation.getParam('envKey');
    return {
      title: `${projKey}/${envKey}`,
      headerLeft: <Hamburger>
        <Entypo name="menu" size={32} color="white"
                onPress={navigation.getParam('toggleDrawer')}/>
      </Hamburger>,
      headerRight: <Button
          title="Switch"
          icon={<Entypo name='menu' size={32} color='red' />}
          onPress={() => navigation.navigate('EnvPicker', {
            envKey: navigation.getParam('envKey'),
            projKey: navigation.getParam('projKey'),
          })}
      />,
      headerStyle: {
        backgroundColor: '#3a6073',
      },
      headerTitleStyle: {
        color: '#fff',
      },
    };
  };

  renderItem = (item) => {
    const {title, date, titleVerb, description, shortDescription} = item;
    const when = new Date(date);
    const since = moment(when).fromNow();
    return (
        <ListItem>
          <ListItemLeftGroup><Text>{since}</Text></ListItemLeftGroup>
          <ListItemRightGroup><MarkdownView>{title}</MarkdownView></ListItemRightGroup>
        </ListItem>);
  };

  toggleDrawer = () => this.props.navigation.toggleDrawer();
  selectEnv = (projKey, envKey) => this.props.navigation.navigate('History', {projKey, envKey});

  componentDidMount() {
    const projKey = this.props.navigation.getParam("projKey") || "default";
    const envKey = this.props.navigation.getParam("envKey") || "production";
    this.props.navigation.setParams({
      toggleDrawer: this.toggleDrawer,
      selectEnv: this.selectEnv,
      projKey: projKey,
      envKey: envKey,
    });
  }

  render() {
    const projKey = this.props.navigation.getParam('projKey');
    const envKey = this.props.navigation.getParam('envKey');
    return (
        <Query query={GET_AUDITLOG} variables={{projKey, envKey}}>
          {
            ({loading, error, data, refetch}) => {
              if (error) return <Text>{`Error! ${error.message}`}</Text>;
              return (
                  <FlatList
                      data={data.auditlog}
                      keyExtractor={(item, index) => item._id || index }
                      renderItem={({item}) => this.renderItem(item)}
                      ItemSeparatorComponent={Separator}
                      onRefresh={() => refetch()}
                      refreshing={loading}
                  />
              );
            }
          }
        </Query>
    );
  }
}

export default createStackNavigator({
  Dashboard: HistoryScreen,
  EnvPicker: EnvPicker,
});