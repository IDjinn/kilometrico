import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AsyncStorage, Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import AwesomeButton from 'react-native-really-awesome-button';
import { Fumi } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import Endpoint from '../api/endpoint'
import endpoint from '../api/endpoint';

export default function Login({ onLogin, setToken }) {
    const [usuario, setUsuario] = React.useState('');
    const [senha, setSenha] = React.useState('');
    const [first, setFirst] = React.useState(false);

    const tryLoginWithPreviousToken = async () => {
        try {
            const tokenJson = await AsyncStorage.getItem('token');
            if (!tokenJson)
                return

            const { token, expiresAt, username, password } = JSON.parse(tokenJson);
            setUsuario(username);
            setSenha(password);

            if (!token || Date.now() > expiresAt) {
                return;
            }

            console.log(endpoint.login.withToken({ token }))
            const res = await axios.post(endpoint.login.withToken({ token }), {}, { timeout: 1000 });
            if (res.status == 200) {
                setToken(token);
                onLogin(res.data.username);
            }
        }
        catch { }
    }


    const onUserText = (value) => setUsuario(value);
    const onPasswordText = (value) => setSenha(value);
    const doLogin = async (next) => {
        next = next && typeof next === 'function' ? next : () => { }
        if (!usuario) return next(alert('Você precisa colocar um usuário válido'));
        if (!senha) return next(alert('Você precisa colocar uma senha válida'));

        try {
            const req = await axios.post(Endpoint.login.dewit({ username: usuario, password: senha, macAddress: '1234' }), {}, { timeout: 2000, timeoutErrorMessage: 'Falha na comunicação do servidor, verifique o seu acesso a internet.' });
            if (req.status === 200) {
                setToken(req.data.token);
                next(onLogin(usuario));
                await AsyncStorage.setItem('token', JSON.stringify(req.data))
            }
            else {
                switch (req.status) {
                    case 401:
                    case 403:
                        return next(alert('Erro ao fazer login, verifique as credenciais e tente novamente.'));
                    case 500:
                        return next(alert('Erro interno do servidor, tente novamente.'));
                    default:
                        return next(alert('Erro ao fazer login. ' + req.status + ' - ' + req.data));
                }
            }
        }
        catch (error) {
            return next(alert(error));
        }
    }

    if (!first) {
        setTimeout(() => {
            tryLoginWithPreviousToken();
            setFirst(true)
        }, 500);
    }
    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Fumi
                    style={styles.input}
                    label={'Usuário'}
                    value={usuario}
                    onChangeText={onUserText}
                    iconClass={FontAwesomeIcon}
                    iconName={'user'}
                    iconColor={'black'}
                    passiveIconColor={'grey'}
                    iconSize={20}
                    iconWidth={40}
                    inputPadding={16}
                    onSubmitEditing={next => doLogin(next)}
                />
                <Fumi
                    style={styles.input}
                    label={'Senha'}
                    value={senha}
                    onChangeText={onPasswordText}
                    iconClass={MaterialCommunityIcons}
                    iconName={'onepassword'}
                    iconColor={'black'}
                    passiveIconColor={'grey'}
                    iconSize={20}
                    iconWidth={40}
                    inputPadding={16}
                    onSubmitEditing={next => doLogin(next)}
                />
                <AwesomeButton
                    style={styles.login}
                    width={100}
                    height={45}
                    progress
                    activityColor={'aqua'}
                    backgroundColor={'green'}
                    onPress={next => doLogin(next)}
                >Login</AwesomeButton>
            </View>
            <StatusBar style="auto" />
        </View>
    );
}

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;
const isPortrait = height > width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f2f2f2',
        minWidth: width - 40,
        minHeight: height - 40,
        marginHorizontal: isPortrait ? 20 : 40,
        marginVertical: isPortrait ? 40 : 20,
        borderRadius: 15
    },
    logo: {
        minWidth: 75,
        minHeight: 75,
        marginBottom: 50
    },
    input: {
        width: 300,
        marginBottom: 5,
        borderRadius: 15
    },
    login: {
        marginTop: 50,
    }
});
