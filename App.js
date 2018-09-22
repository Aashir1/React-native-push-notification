/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, View, AsyncStorage, TextInput, Button } from 'react-native';
import firebase from 'react-native-firebase';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      userInput: ''
    }
    firebase.messaging().subscribeToTopic('notification');
  }
  componentDidMount() {
    this.checkPermission();
    this.createNotificationListeners();
  }
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  createNotificationListeners = () => {
    this.notificationListener = firebase.notifications().onNotification((notification) => {
      // const { title, body } = notification;
      alert(JSON.stringify(notification));
    });

    this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpened) => {
      alert(JSON.stringify(notificationOpened));
    })

    firebase.notifications().getInitialNotification()
      .then(notificationOpen => {
        if (notificationOpen) {
          const { title, body } = notificationOpen.notification;
          this.showAlert(title, body);
        }
      })
      .catch(error => {
        alert(JSON.stringify(error));
      });

    this.messageListener = firebase.messaging().onMessage((message) => {
      console.log(JSON.stringify(message));
    });
  }

  checkPermission = () => {
    firebase.messaging().hasPermission()
      .then(enabled => {
        if (enabled) {
          this.getToken();
        } else {
          this.requsetPermission();
        }
      })
      .catch(error => {
        alert(JSON.stringify(error));
      })
  }

  requsetPermission = () => {
    firebase.messaging().requestPermission()
      .then(() => {
        this.getToken();
      })
      .catch(error => {
        console.log("error in requestPermission");
      })
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput onChange={(e) => this.setState({ userInput: e.target.value })} />
        <Button title="Add Data" onPress={() => {
          firebase.database().ref('/notification').push({ data: this.state.userInput })
            .then(data => {
              console.log('data: ', data)
              // alert(JSON.stringify(data.val()));
            }).catch(error => {
              console.log('error: ', error);
              alert(JSON.stringify(error))
            })
        }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
