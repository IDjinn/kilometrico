import * as React from 'react';
import { Text } from 'react-native';
import Login from './views/login';
import Logs from './views/logs';
import Travel from './views/travel';

export default function App() {
  const [login, setLogin] = React.useState(false);
  const [showLogs, setShowLogs] = React.useState(false);
  const [motorista, setMotorista] = React.useState('');
  const [token, setToken] = React.useState('');
  const [logs, setLogs] = React.useState([]);

  return (
    login ? showLogs ? (<Logs carro={'sandero'} logs={logs} />) : (
      <Travel
        setLogs={setLogs}
        goToLogs={() => setShowLogs(true)}
        motorista={motorista}
        token={token}
      />)
      : (<Login
        setToken={setToken}
        onLogin={(motorista) => {
          setMotorista(motorista)
          setLogin(true)
        }} />)
  )
}