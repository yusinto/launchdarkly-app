import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {DrawerItems, SafeAreaView} from 'react-navigation';
import styled from 'styled-components';
import colors from '../constants/Colors';

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

export default CustomDrawerContentComponent;