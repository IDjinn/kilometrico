import * as React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Table, Row, Col, Cols, Rows, TableWrapper, Cell } from 'react-native-table-component';

import AwesomeButton from 'react-native-really-awesome-button';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import endpoint, { Endpoint } from '../api/endpoint';
import { Image } from 'react-native';
//import RNFetchBlob from 'react-native-fetch-blob';///


//const dir = RNFetchBlob.fs.dirs.DownloadDir;
export default class Logs extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            carro: props.carro,
            logs: props.logs,
            tableHead: ['Data e Hora', 'Km', 'Motorista', 'Foto'],
            pic: null,
            km: props.logs.map(x => parseInt(x[1]).toFixed(0)).sort((a, b) => b - a)
        }
    }
    /* logs.map(log => {
         console.log(log)
         const data = log[0];
         const km = log[1];
         const driver = log[2];
         const photo = log[3];
         console.log(data, km, driver, photo)
         console.log([data, km, driver, <MaterialIcons name={'insert-photo'} size={12} color={'black'} />])
         if (photo)
             return [data, km, driver, <MaterialIcons name={'insert-photo'} size={12} color={'black'} />];
         else
             return [data, km, driver, <MaterialIcons name={'insert-photo'} size={12} color={'grey'} />];
     });*/


    dewit = (next) => {/*
        const pathToWrite = `${dir}/data.csv`;
        const csvData = tableHead.join(',') + data.map(x => x.join(',')).join('\n');
        RNFetchBlob.fs
            .writeFile(pathToWrite, csvData, 'utf8')
            .then(() => console.warn('ok'))
            .catch(error => console.warn(error));
*/
        if (next && typeof next === 'function')
            next();
    }


    showPic(url) {
        this.setState({ pic: url })
    }

    formatKm(km) {
        km = km.toString()
        const builder = [];
        let counter = 0;
        for (let i = km.length; i >= 0; i--) {
            const digit = km[i];
            builder.push(digit);
            if (++counter > 3 && i > 0) {
                builder.push('.')
                counter = 0;
            }
        }
        return builder.reverse().join('')
    }

    render() {
        const cellPicture = (data, index) => data ? (
            <TouchableOpacity onPress={() => this.showPic(Endpoint.BASE_URL + '/' + data)}>
                <Image style={{ alignSelf: 'center', width: 30, height: 30 }} source={{ uri: Endpoint.BASE_URL + '/' + data }} />
            </TouchableOpacity>) : <MaterialIcons name={'insert-photo'} size={12} color={'grey'} />;

        const kmCounter = (data) => {
            const km = parseInt(data).toFixed(0)
            const index = this.state.km.indexOf(km);
            let lastKm = 0;
            if (index >= 0 && this.state.km[index + 1]) lastKm = this.state.km[index + 1]
            const diff = km - lastKm

            if (diff < 0) console.warn('diff < 0')

            return (<View>
                <Text>{this.formatKm(km)}km</Text>
                <Text style={styles.kmDiff}>+{this.formatKm(diff)}km</Text>
            </View>
            )
        }
        return (
            <View style={styles.container} >
                <Text style={styles.info}>Registros do carro {this.state.carro}</Text>
                <ScrollView>
                    <Table style={styles.table}>
                        <Row
                            style={styles.head}
                            data={this.state.tableHead}
                        />
                        {this.state.logs.map((rowData, index) => (
                            <TableWrapper key={index} style={styles.row}>
                                {
                                    rowData.map((cellData, cellIndex) => (
                                        <Cell key={cellIndex} data={cellIndex === 3 ? cellPicture(cellData, index) : cellIndex === 1 ? kmCounter(cellData) : cellData} textStyle={styles.cell} />
                                    ))
                                }
                            </TableWrapper>
                        ))}
                    </Table>
                </ScrollView>
                {this.state.pic != null ? (
                    <TouchableOpacity onPressIn={() => this.setState({ pic: null })} style={styles.picRegion}>
                        <TouchableOpacity onPress={() => { }}><Image fadeDuration={2} style={styles.picContainer} source={{ uri: this.state.pic }} /></TouchableOpacity>
                    </TouchableOpacity>
                ) : null
                }
            </View>
        )
    }
}


const isPortrait = Dimensions.get('window').height > Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 15,
        backgroundColor: '#f2f2f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    table: {
        borderWidth: 1,
        borderColor: 'black',
        width: isPortrait ? Dimensions.get('window').width - 40 : 700,
    },
    cell: {
        alignSelf: 'center',
    },
    head: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
        marginBottom: 5
    },
    row: {
        borderWidth: 1,
        borderColor: 'black',
        height: 40,
        flexDirection: 'row'
    },
    info: {
        fontSize: 16,
        marginVertical: 20
    },
    export: {
        backgroundColor: 'green',
        width: 140,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },
    picRegion: {
        width: 1700,
        height: 1700,
        position: 'absolute',
        opacity: 0.9,
        backgroundColor: 'white',
        zIndex: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    picContainer: {
        width: 360,
        height: 360,
    },
    kmDiff: {
        color: 'green',
        fontSize: 8
    }
})