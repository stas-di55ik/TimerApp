import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    StatusBar,
    TouchableOpacity,
    Dimensions,
    TextInput,
} from 'react-native';
import { Audio } from 'expo-av';

const screen = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#07121B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderWidth: 10,
        borderColor: '#89AAFF',
        width: screen.width / 2,
        height: screen.width / 2,
        borderRadius: screen.width / 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30
    },
    buttonStop: {
        borderColor: '#FF851B',
    },
    buttonText: {
        fontSize: 45,
        color: '#89AAFF'
    },
    buttonTextStop: {
        color: '#FF851B'
    },
    timerTextInput: {
        color: '#fff',
        fontSize: 90,
        flexDirection: 'row'
    },
    timerInput: {
        color: '#fff',
        fontSize: 45,
        width: 100,
        textAlign: 'center'
    },
});

const formatNumber = (number) => `0${number}`.slice(-2);

const getRemaining = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return { minutes: formatNumber(minutes), seconds: formatNumber(seconds) };
}

class App extends React.Component {
    state = {
        isRunning: false,
        minutesInput: '',
        secondsInput: '',
        remainingSeconds: 0,
        sound: null
    };

    async componentDidUpdate(prevProp, prevState) {
        if (this.state.remainingSeconds === 0 && prevState.remainingSeconds !== 0) {
            await this.playSound();
            this.stop();
        }
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    playSound = async () => {
        console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync(require('../assets/old-car-horn.mp3'));
        this.setState({ sound });
        console.log('Playing Sound');
        await sound.playAsync();
    }

    handleMinutesChange = (text) => {
        if (text === '' || (parseInt(text) >= 0 && parseInt(text) <= 59)) {
            this.setState({ minutesInput: text }, () => {
                this.updateRemainingSeconds();
            });
        }
    }

    handleSecondsChange = (text) => {
        if (text === '' || (parseInt(text) >= 0 && parseInt(text) <= 59)) {
            this.setState({ secondsInput: text }, () => {
                this.updateRemainingSeconds();
            });
        }
    }

    updateRemainingSeconds = () => {
        const minutes = parseInt(this.state.minutesInput) || 0;
        const seconds = parseInt(this.state.secondsInput) || 0;
        const remainingSeconds = minutes * 60 + seconds;
        this.setState({ remainingSeconds });
    }

    start = () => {
        this.updateRemainingSeconds();

        this.setState({
            isRunning: true
        });

        this.interval = setInterval(() => {
            this.setState(prevState => ({
                remainingSeconds: prevState.remainingSeconds - 1
            }));
        }, 1000);
    }

    stop = () => {
        clearInterval(this.interval);
        this.interval = null;
        this.setState({
            remainingSeconds: 5,
            isRunning: false
        });
    }

    render() {
        const { minutes, seconds } = getRemaining(this.state.remainingSeconds);
        return (
            <View style={styles.container}>
                <StatusBar barStyle='light-content' />
                <View style={styles.timerTextInput}>
                    {this.state.isRunning ? (
                        <Text style={styles.timerTextInput}>{`${minutes}:${seconds}`}</Text>
                    ) : (
                        <>
                            <TextInput
                                style={styles.timerInput}
                                placeholder="MM"
                                placeholderTextColor={styles.timerTextInput.color}
                                keyboardType="numeric"
                                maxLength={2}
                                onChangeText={this.handleMinutesChange}
                                value={this.state.minutesInput}
                            />
                            <Text style={styles.timerInput}>:</Text>
                            <TextInput
                                style={styles.timerInput}
                                placeholder="SS"
                                placeholderTextColor={styles.timerTextInput.color}
                                keyboardType="numeric"
                                maxLength={2}
                                onChangeText={this.handleSecondsChange}
                                value={this.state.secondsInput}
                            />
                        </>
                    )}
                </View>

                {this.state.isRunning ? (
                    <TouchableOpacity onPress={this.stop} style={[styles.button, styles.buttonStop]}>
                        <Text style={[styles.buttonText, styles.buttonTextStop]}>Stop</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={this.start} style={styles.button}>
                        <Text style={styles.buttonText}>Start</Text>
                    </TouchableOpacity>
                )}
            </View >
        );
    }
}

export default App;
