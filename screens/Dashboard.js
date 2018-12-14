import React, {Component} from 'react';
import {createStackNavigator} from 'react-navigation';
import {Text, FlatList, Switch, Button} from 'react-native';
import gql from 'graphql-tag';
import {Mutation, Query, graphql} from 'react-apollo';
import styled from 'styled-components/native';
import {Svg} from 'expo';
import {Entypo} from '@expo/vector-icons';
import colors from '../constants/Colors';
import { sortBy } from "lodash";
import EnvPicker from "./EnvPicker";

const GET_FLAGS = gql`
      query GetFlags($projKey: String!) {
          flags(projKey: $projKey) {
              name
              key
              version
              kind
              environments {
                  key
                  killSwitch
              }
          }
      }
`;
const TOGGLE_KILLSWITCH = gql`
    mutation ToggleKillSwitch($projKey: String!, $envKey: String!, $flagKey: String!) {
        toggleKillSwitch(projKey: $projKey, envKey: $envKey, flagKey: $flagKey) {
            name
            key
            environments {
                key
                killSwitch
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
  flex-direction: row;
`;
const FlagDisplayName = styled.Text`
  font-size: 18px;
  margin-left: 5px;
`;
const Separator = styled.View`
  width: 100%;
  background-color: rgba(0,0,0,.1);
  height: 1px;
`;
const Hamburger = styled.View`
  margin-left: 10px;
`;

class DashboardScreen extends Component {
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
            // icon={
            // <Icon
            //     name='cards'
            //     size={15}
            //     color='white'
            // />}
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

  renderItem = (item, toggleKillSwitch) => {
    const envKey = this.props.navigation.getParam('envKey');
    const {name, environments} = item;
    const {killSwitch} = environments.find(env => env.key === envKey);
    return (
      <ListItem>
        <ListItemLeftGroup>
          <Svg height={20} width={20}>
            <Svg.Circle
              cx="10"
              cy="12"
              r={5}
              fill={colors.secondary}
            />
          </Svg>
          <FlagDisplayName>{name}</FlagDisplayName>
        </ListItemLeftGroup>
        <Switch
          onValueChange={() => this.handleToggle(item, toggleKillSwitch)}
          value={killSwitch}
          trackColor={{true: colors.secondary}}
        />
      </ListItem>);
  };

  handleToggle = ({key: flagKey, name, version, kind, environments}, toggleKillSwitch) => {
    const projKey = this.props.navigation.getParam('projKey');
    const envKey = this.props.navigation.getParam('envKey');
    toggleKillSwitch({
      variables: {
        projKey: projKey,
        envKey: envKey,
        flagKey,
      },
      optimisticResponse: {
        toggleKillSwitch: {
          __typename: 'Flag',
          key: flagKey,
          name,
          version,
          kind,
          environments: [{
            __typename: 'Environment',
            key: envKey,
            killSwitch: !environments.find(env => env.key === envKey).killSwitch,
          }],
        },
      },
      update: (proxy, {data: {toggleKillSwitch: {environments}}}) => {
        const cachedData = proxy.readQuery({query: GET_FLAGS, variables: {projKey: projKey}});
        const cachedEnv = cachedData.flags.find(f => f.key === flagKey).environments.find(env => env.key === envKey);
        const updatedEnv = environments.find(env => env.key === envKey);
        cachedEnv.killSwitch = updatedEnv.killSwitch;
        proxy.writeQuery({query: GET_FLAGS, variables: {projKey: projKey}, data: cachedData});
      },
    });
  };

  toggleDrawer = () => this.props.navigation.toggleDrawer();
  selectEnv = (projKey, envKey) => this.props.navigation.navigate('Dashboard', {projKey, envKey});

  componentDidMount() {
    const projKey = this.props.navigation.getParam("projKey") || "default";
    const envKey = this.props.navigation.getParam("envKey") || "production";
    console.log(`ProjKey is ${projKey}`);
    this.props.navigation.setParams({
      toggleDrawer: this.toggleDrawer,
      selectEnv: this.selectEnv,
      projKey: projKey,
      envKey: envKey,
    });
  }

  render() {
    const projKey = this.props.navigation.getParam('projKey');
    console.log(`Project key is: ${projKey}`);
    return (
      <Query query={GET_FLAGS} variables={{projKey}}>
        {
          ({loading, error, data, refetch}) => {
            if (error) return <Text>{`Error! ${error.message}`}</Text>;
            return (
              <Mutation mutation={TOGGLE_KILLSWITCH}>
                {(toggleKillSwitch) =>
                  <FlatList
                    data={ sortBy(data.flags, [ (f) => f.key ]) }
                    renderItem={({item}) => this.renderItem(item, toggleKillSwitch)}
                    ItemSeparatorComponent={Separator}
                    onRefresh={() => refetch()}
                    refreshing={loading}
                  />
                }
              </Mutation>
            );
          }
        }
      </Query>
    );
  }
}

export default createStackNavigator({
  Dashboard: {
    screen: DashboardScreen,
  },
  EnvPicker: {
    screen: EnvPicker
  }
});