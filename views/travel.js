import * as React from 'react';
import { StyleSheet, View, Text, Dimensions, ScrollView, Touchable, TouchableOpacity, ImageBackground } from 'react-native';
import { Camera } from 'expo-camera'
import { Fumi } from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AwesomeButton from 'react-native-really-awesome-button';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import endpoint from '../api/endpoint'
import * as FileSystem from 'expo-file-system';
import { FileSystemUploadType } from 'expo-file-system';

let camera;
export default function Travel({ motorista, goToLogs, token, setLogs }) {
    const [photo, setPhoto] = React.useState(null);
    const [openCamera, setOpenCamera] = React.useState(false);
    const [quilometragem, setQuilometragem] = React.useState("");


    const dewit = async (next) => {
        next = next && typeof next === 'function' ? next : () => { }
        if (!photo) return next(alert('Você precisa tirar a foto para poder confirmar os dados!'));
        if (!motorista) return next(alert('Parece que houve problemas no seu login, tente novamente.'));

        try {
            const data = await FileSystem.readAsStringAsync(photo.uri, { encoding: FileSystem.EncodingType.Base64 });
            const res = await axios.post(
                endpoint.logs.create({ token, km: quilometragem, timestamp: Date.now(), driver: motorista }),
                { data: data },
            );
            next()

            if (res.status === 200) {
                console.log('data', res.data)
                setLogs(res.data)
                goToLogs();
            }
        }
        catch ({ response }) {
            if (response.status === 499)
                alert('Verifique os Km, parece que o valor inserido é menor que o último registro do servidor.');
            console.log('erro', response.status, ' - ', response.data)
            next()
        }
    }


    const takePicture = async () => {
        const photo = await camera.takePictureAsync()
        console.log(photo)
        setPhoto(photo);
        setOpenCamera(false);
    }

    const startCamera = async () => {
        const { status } = await Camera.requestPermissionsAsync()
        if (status === 'granted') {
            setOpenCamera(true)
        } else {
            console.warn('denied')
        }
    }

    const onChangeText = (text) => {
        setQuilometragem(text)
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerInfo}>Insira as informações da quilometragem do carro e a foto para continuar.</Text>
            {openCamera && !photo ? (
                <View style={styles.photo}>
                    <Camera
                        style={{ flex: 1 }}
                        ref={(r) => {
                            camera = r
                        }}
                    />

                    <TouchableOpacity
                        onPress={takePicture}
                        style={{
                            position: 'absolute',
                            alignSelf: 'center',
                            width: 70,
                            height: 70,
                            bottom: 0,
                            borderRadius: 50,
                            backgroundColor: '#fff',
                            marginBottom: 5
                        }}
                    >
                        <TouchableOpacity
                            onPress={takePicture}
                            style={{
                                alignSelf: 'center',
                                width: 60,
                                height: 60,
                                bottom: -5,
                                borderRadius: 50,
                                backgroundColor: '#f2f2f2'
                            }}
                        />
                    </TouchableOpacity>
                </View>
            ) : photo ? (
                <ImageBackground style={styles.photo}
                    source={{ uri: photo && photo.uri }}
                />) :
                (
                    <TouchableOpacity style={styles.photo} onPress={() => startCamera()}>
                        <MaterialIcons style={{ alignSelf: 'center' }} size={40} color={'black'} name={'add-a-photo'} />
                    </TouchableOpacity>
                )}
            <Fumi
                style={styles.input}
                value={quilometragem}
                onChangeText={(text) => onChangeText(text)}
                keyboardType={'decimal-pad'}
                label={'Quilometragem'}
                iconClass={MaterialCommunityIcons}
                iconName={'counter'}
                iconColor={'black'}
                passiveIconColor={'grey'}
                iconSize={20}
                iconWidth={40}
                inputPadding={16}
            />
            <Fumi
                style={styles.input}
                label={'Data'}
                editable={false}
                value={new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')}
                iconClass={FontistoIcon}
                iconName={'date'}
                iconColor={'black'}
                passiveIconColor={'grey'}
                iconSize={20}
                iconWidth={40}
                inputPadding={16}
            />
            <Fumi
                style={styles.input}
                label={'Motorista'}
                value={motorista}
                editable={false}
                iconClass={FontAwesomeIcon}
                iconName={'user'}
                iconColor={'black'}
                passiveIconColor={'grey'}
                iconSize={20}
                iconWidth={40}
                inputPadding={16}
            />
            <AwesomeButton
                style={styles.login}
                width={100}
                height={45}
                progress
                backgroundColor={'green'}
                onPress={next => dewit(next)} >Enviar</AwesomeButton>
        </View>
    )
}
const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 20,
        backgroundColor: '#f2f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: isPortrait ? 20 : 0,
        padding: 30,
        borderRadius: 10,
    },
    headerInfo: {
        fontSize: 16,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    photo: {
        width: 250,
        height: 250,
        backgroundColor: 'gray',
        marginVertical: 20,
        justifyContent: 'center'
    },
    input: {
        width: 300,
        marginBottom: 5,
        borderRadius: 15,
        marginVertical: 5
    },
    login: {
        marginTop: 30,
    }
});