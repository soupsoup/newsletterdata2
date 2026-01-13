import { Dashboard } from './components/Dashboard';
import { PasswordGate } from './components/PasswordGate';
import './App.css';

function App() {
  return (
    <PasswordGate>
      <Dashboard />
    </PasswordGate>
  );
}

export default App;
