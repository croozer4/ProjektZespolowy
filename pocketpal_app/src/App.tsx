import './App.css'
import CustomNavbar from './components/NavbarComponent'
import BasicPieChart from './components/BasicPieChart'
import {MantineProvider, Text} from "@mantine/core";
import HistoryComponent from "./components/HistoryComponent.tsx";
import ExpenseAddingForm from './components/ExpenseAddingForm.tsx';

function App() {
  return (
    <MantineProvider theme={{colorScheme:'dark'}}>
      <CustomNavbar/>
      <div className="interface">
        <div className="overview">
          <Text
            size="xl"
            weight={700}
            style={{marginBottom: "1rem"}}
          >
            Witaj w PocketPal!
          </Text>
          <BasicPieChart/>
        </div>
        <HistoryComponent/>
      </div>
      <ExpenseAddingForm/>
    </MantineProvider>
  )
}

export default App